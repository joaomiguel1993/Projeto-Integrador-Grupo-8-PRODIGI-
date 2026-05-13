from datetime import datetime, date
from pathlib import Path
from typing import Any, Dict, Optional, List
import joblib


from typing import Any, Dict, List

from fastapi import HTTPException

from backend.dao import ai_features_dao
from backend.services import prescricoes_service, alerta_service, predicao_ia_service
from backend.db import run_query


BASE_DIR = Path(__file__).resolve().parents[1]
IA_DIR = BASE_DIR / "IA"

MODEL_PATH = IA_DIR / "models" / "randomforest_medicine_risk.joblib"

MODELO_VERSAO_RISCO = "randomforest_medicine_risk_v1"

_modelo_risco = None


def _get_modelo_risco():
    global _modelo_risco

    if _modelo_risco is None:
        if not MODEL_PATH.exists():
            raise HTTPException(
                status_code=500,
                detail=f"Modelo não encontrado em {MODEL_PATH}"
            )
        _modelo_risco = joblib.load(MODEL_PATH)

    return _modelo_risco


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _calcular_idade(data_nasc):
    if data_nasc is None:
        return 0

    hoje = date.today()
    return hoje.year - data_nasc.year - (
        (hoje.month, hoje.day) < (data_nasc.month, data_nasc.day)
    )


def _normalizar_gravidade(nivel_gravidade: Optional[str]) -> int:
    if not nivel_gravidade:
        return 1

    valor = nivel_gravidade.strip().lower()
    mapa = {
        "baixo": 1,
        "baixa": 1,
        "ligeiro": 1,
        "ligeira": 1,
        "moderado": 2,
        "moderada": 2,
        "medio": 2,
        "média": 2,
        "media": 2,
        "alto": 3,
        "alta": 3,
        "grave": 3,
        "critico": 4,
        "critica": 4,
        "crítica": 4,
    }
    return mapa.get(valor, 1)


def _map_contexto_prescricao(row) -> Optional[Dict[str, Any]]:
    if row is None:
        return None

    return {
        "id_prescricao": int(row[0]),
        "id_ato": int(row[1]),
        "cod_medicamento": int(row[2]),
        "cod_ep_urgenc": int(row[3]),
        "num_utent": int(row[4]),
        "id_hosp": int(row[5]),
        "data_hora_entrada": row[6],
    }


def _map_medicamento(row) -> Optional[Dict[str, Any]]:
    if row is None:
        return None

    return {
        "cod_medicamento": int(row[0]),
        "nome": row[1],
        "principio_ativo": row[2],
        "classe_terapeutica_id": int(row[3]),
    }


def _map_alergia(row) -> Dict[str, Any]:
    return {
        "cod_alergia": int(row[0]),
        "num_utent": int(row[1]),
        "substancia": row[2],
        "classe_terapeutica_id": int(row[3]),
        "nivel_gravidade": row[4],
        "gravidade_score": _normalizar_gravidade(row[4]),
        "data_registo": row[5],
    }


def _map_medicacao_ativa(row) -> Dict[str, Any]:
    return {
        "cod_medicacao_ativa": int(row[0]),
        "num_utent": int(row[1]),
        "cod_medicamento": int(row[2]),
        "data_inicio": row[3],
        "data_fim": row[4],
        "dosagem": row[5],
        "classe_terapeutica_id": int(row[6]),
    }


def construir_features_risco(id_prescricao: int) -> Dict[str, Any]:
    contexto_raw = ai_features_dao.get_contexto_prescricao_by_id(id_prescricao)
    contexto = _map_contexto_prescricao(_first_or_none(contexto_raw))

    if contexto is None:
        raise HTTPException(status_code=404, detail="Contexto da prescrição não encontrado.")

    medicamento_raw = ai_features_dao.get_medicamento_by_id(contexto["cod_medicamento"])
    medicamento = _map_medicamento(_first_or_none(medicamento_raw))

    if medicamento is None:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado.")

    alergias_raw = ai_features_dao.get_alergias_utente(contexto["num_utent"])
    medicacao_raw = ai_features_dao.get_medicacao_ativa_utente(contexto["num_utent"])

    utente_raw = run_query("""
        SELECT numutent, datanasc
        FROM utente
        WHERE numutent = %s
    """, (contexto["num_utent"],))
    utente = _first_or_none(utente_raw)

    data_nasc = utente[1] if utente else None
    idade = _calcular_idade(data_nasc)

    alergias = [_map_alergia(row) for row in alergias_raw] if alergias_raw else []
    medicacao_ativa = [_map_medicacao_ativa(row) for row in medicacao_raw] if medicacao_raw else []

    return {
        "id_prescricao": contexto["id_prescricao"],
        "id_ato": contexto["id_ato"],
        "cod_medicamento": contexto["cod_medicamento"],
        "cod_ep_urgenc": contexto["cod_ep_urgenc"],
        "num_utent": contexto["num_utent"],
        "id_hosp": contexto["id_hosp"],
        "data_hora_entrada": contexto["data_hora_entrada"],
        "idade": idade,
        "nova_classe_terapeutica": medicamento["classe_terapeutica_id"],
        "alergias": alergias,
        "medicacao_ativa": medicacao_ativa,
    }


def _build_model_features(features: Dict[str, Any]) -> List[List[float]]:
    nova_classe = float(int(features.get("nova_classe_terapeutica", 0) or 0))
    idade = float(int(features.get("idade", 0) or 0))

    match_alergia = 0.0
    gravidade_max = 0.0

    alergias = features.get("alergias", []) or []
    medicacao_ativa = features.get("medicacao_ativa", []) or []

    for alergia in alergias:
        classe_alergia = int(alergia.get("classe_terapeutica_id", 0) or 0)
        gravidade_score = float(int(alergia.get("gravidade_score", 0) or 0))

        if classe_alergia == int(nova_classe):
            match_alergia = 1.0
            if gravidade_score > gravidade_max:
                gravidade_max = gravidade_score

    qtd_medicacao_ativa = float(len(medicacao_ativa))
    qtd_medicacao_mesma_classe = 0.0

    for med in medicacao_ativa:
        classe_med = int(med.get("classe_terapeutica_id", 0) or 0)
        if classe_med == int(nova_classe):
            qtd_medicacao_mesma_classe += 1.0

    return [[
        nova_classe,
        match_alergia,
        gravidade_max,
        qtd_medicacao_ativa,
        qtd_medicacao_mesma_classe,
        idade,
    ]]

def avaliar_risco_prescricao(id_prescricao: int, id_func_responsavel=None):
    prescricao = prescricoes_service.obter_prescricao(id_prescricao)
    if prescricao is None:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada.")

    features_contexto = construir_features_risco(id_prescricao)
    X = _build_model_features(features_contexto)

    modelo = _get_modelo_risco()
    pred = modelo.predict(X)[0]

    score = 0.5
    if hasattr(modelo, "predict_proba"):
        try:
            proba = modelo.predict_proba(X)[0]
            score = float(max(proba))
        except Exception:
            pass

    pred_str = str(pred).lower()

    if pred_str in ["1", "true", "risco", "alto_risco", "bloquear", "bloqueada"]:
        estado_final = "bloqueada"
        severidade = "alto" if score < 0.85 else "critico"
    else:
        estado_final = "aprovada"
        severidade = "baixo"

    explicacoes = []

    if any(a["classe_terapeutica_id"] == features_contexto["nova_classe_terapeutica"] for a in features_contexto["alergias"]):
        explicacoes.append("Existe correspondência com alergia registada.")

    if any(
        m["classe_terapeutica_id"] == features_contexto["nova_classe_terapeutica"]
        for m in features_contexto["medicacao_ativa"]
    ):
        explicacoes.append("Existe medicação ativa da mesma classe terapêutica.")

    if features_contexto["idade"] >= 65:
        explicacoes.append("Idade do utente exige maior cautela.")

    prescricao_atualizada = prescricoes_service.atualizar_estado_ia_prescricao(
        id_prescricao=id_prescricao,
        estado_prescricao=estado_final,
        score_risco_ia=score,
        validado_por_ia=True,
        data_hora_validacao_ia=datetime.now(),
    )

    alerta_criado = None
    if estado_final in ("bloqueada", "pendente"):
        alerta_criado = alerta_service.criar_alerta({
            "id_prescricao": id_prescricao,
            "id_func": id_func_responsavel,
            "tipo": "risco_medicamentoso",
            "justificacao": " | ".join(explicacoes) if explicacoes else "Risco medicamentoso identificado pela IA.",
            "severidade": severidade,
            "score_risco": score,
        })

    predicao_ia_service.criar_predicao({
        "tipo_modelo": "risco_medicamentoso",
        "entidade": "prescricao",
        "entidade_id": id_prescricao,
        "input_json": {
            "features_contexto": features_contexto,
            "features_modelo": {
                "ordem": [
                    "nova_classe_terapeutica",
                    "presenca_alergia_match",
                    "gravidade_alergia_max",
                    "qtd_medicacao_ativa",
                    "qtd_medicacao_mesma_classe",
                    "idade",
                ],
                "values": X[0],
            },
        },
        "output_json": {
            "pred_raw": str(pred),
            "estado_final": estado_final,
            "severidade": severidade,
            "explicacoes": explicacoes,
            "modelo_executor": "randomforest_medicine_risk.joblib",
        },
        "score": score,
        "modelo_versao": MODELO_VERSAO_RISCO,
        "sucesso": True,
        "erro_mensagem": None,
    })

    return {
        "prescricao": prescricao_atualizada,
        "alerta": alerta_criado,
        "avaliacao": {
            "score": score,
            "estado_final": estado_final,
            "severidade": severidade,
            "explicacoes": explicacoes,
            "modelo_versao": MODELO_VERSAO_RISCO,
        }
    }