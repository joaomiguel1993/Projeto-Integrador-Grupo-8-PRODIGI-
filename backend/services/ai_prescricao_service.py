import os
from datetime import date

import httpx
from fastapi import HTTPException

from backend.db import run_query
from backend.services import predicao_ia_service

IA_URL = os.getenv("IA_URL", "http://prodigi_ia:8001")

_GRAVIDADE_MAP = {
    "leve":      1,
    "moderada":  2,
    "grave":     3,
    "critica":   4,
    "crítica":   4,
}


def _calcular_idade(datanasc) -> int:
    hoje = date.today()
    if isinstance(datanasc, str):
        datanasc = date.fromisoformat(datanasc)
    return hoje.year - datanasc.year - (
        (hoje.month, hoje.day) < (datanasc.month, datanasc.day)
    )


def avaliar_risco_prescricao(id_prescricao: int) -> dict:
    """
    Chamado pelo prescricoes_service após criar uma prescrição.
    1. Recolhe dados da prescrição, medicamento, utente, alergias e medicação ativa
    2. Chama o serviço IA via HTTP (POST /predict/v1/medicine-risk)
    3. Actualiza estado da prescrição com o resultado
    4. Grava auditoria em PredicaoIA
    5. Se risco alto, cria alerta
    """
    # 1. Buscar dados da prescrição
    rows = run_query("""
        SELECT
            p.idprescricao,
            p.codmedicamento,
            m.classeterapeuticaid,
            u.numutent,
            u.datanasc
        FROM prescreve p
        JOIN ato a ON a.idato = p.idato
        JOIN epurgencia e ON e.codepurgenc = a.codepurgenc
        JOIN utente u ON u.numutent = e.numutent
        JOIN medicamento m ON m.codmedicamento = p.codmedicamento
        WHERE p.idprescricao = %s
    """, (id_prescricao,))

    if not rows:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
    row = rows[0]

    num_utent          = row["numutent"]
    classe_novo_med    = int(row["classeterapeuticaid"])
    idade              = _calcular_idade(row["datanasc"])

    # 2. Verificar alergias do utente para esta classe
    alergias = run_query("""
        SELECT nivelgravidade
        FROM alergia
        WHERE numutent = %s AND classeterapeuticaid = %s
        LIMIT 1
    """, (num_utent, classe_novo_med))

    tem_alergia     = 1 if alergias else 0
    gravidade_raw   = alergias[0]["nivelgravidade"] if alergias else None
    gravidade_num   = _GRAVIDADE_MAP.get((gravidade_raw or "").lower(), 0)

    # 3. Verificar interações com medicação ativa (mesma classe)
    interacoes = run_query("""
        SELECT 1
        FROM medicacaoativa ma
        JOIN medicamento m ON m.codmedicamento = ma.codmedicamento
        WHERE ma.numutent = %s AND m.classeterapeuticaid = %s
        LIMIT 1
    """, (num_utent, classe_novo_med))

    tem_interacao = 1 if interacoes else 0

    features = {
        "Classe_Novo_Med":     classe_novo_med,
        "Tem_Alergia_Classe":  tem_alergia,
        "Gravidade_Alergia":   gravidade_num,
        "Tem_Interacao_Ativa": tem_interacao,
        "Idade_Utente":        idade,
    }

    # 4. Chamar serviço IA
    try:
        resp = httpx.post(f"{IA_URL}/predict/v1/medicine-risk", json=features, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        risco      = int(data.get("risco", 0))
        score      = float(data.get("probabilidade", 0))
        resultado  = data.get("resultado", "SEM RISCO")
    except Exception as e:
        print(f"[IA] Aviso: predição de risco medicamentoso falhou — {e}")
        return None

    # 5. Actualizar estado da prescrição
    novo_estado = "bloqueada" if risco == 1 else "aprovada"
    run_query("""
        UPDATE prescreve
        SET estadoprescricao = %s,
            scoreriscoia = %s,
            validadoporia = true,
            datahoravalidacaoia = NOW()
        WHERE idprescricao = %s
    """, (novo_estado, score, id_prescricao))

    # 6. Gravar auditoria em PredicaoIA
    try:
        predicao_ia_service.criar_predicao({
            "tipo_modelo":   "risco_medicamentoso",
            "entidade":      "prescricao",
            "entidade_id":   id_prescricao,
            "input_json":    features,
            "output_json":   {"risco": risco, "resultado": resultado, "probabilidade": score},
            "score":         score,
            "modelo_versao": "randomforest_medicine_risk_v1",
            "sucesso":       True,
            "erro_mensagem": None,
        })
    except Exception as e:
        print(f"[IA] Aviso: auditoria de risco medicamentoso falhou — {e}")

    return {
        "risco":         risco,
        "resultado":     resultado,
        "probabilidade": score,
        "estado":        novo_estado,
    }