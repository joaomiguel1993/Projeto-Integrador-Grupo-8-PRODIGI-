from typing import Any, Dict, List
from fastapi import HTTPException

from backend.db import run_query
from backend.services.model_registry import get_artifact
from backend.services import predicao_ia_service


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _encode_value(encoders, key: str, value, default=0):
    encoder = encoders.get(key) if isinstance(encoders, dict) else None
    if encoder is None:
        return default
    try:
        return int(encoder.transform([value])[0])
    except Exception:
        return default


def construir_features_espera(cod_ep_urgenc: int) -> Dict[str, Any]:
    episodio = _first_or_none(run_query("""
        SELECT
            e.codepurgenc,
            e.numutent,
            e.idhosp,
            e.estado,
            t.cortriagem,
            t.temperatura,
            t.freqcard,
            t.freqresp,
            t.spo2,
            t.sistolica,
            t.diastolica,
            t.niveldor,
            t.consciencia
        FROM epurgencia e
        LEFT JOIN triagem t ON t.codepurgenc = e.codepurgenc
        WHERE e.codepurgenc = %s
    """, (cod_ep_urgenc,)))

    if episodio is None:
        raise HTTPException(status_code=404, detail="Episódio de urgência não encontrado.")

    estat = _first_or_none(run_query("""
        SELECT
            idhosp,
            hospitalnome,
            facility_size_beds,
            contagem_enfermeiros,
            contagem_medicos,
            pacientes_ativos
        FROM v_estatisticas_ia
        WHERE idhosp = %s
    """, (episodio[2],)))

    if estat is None:
        raise HTTPException(status_code=404, detail="Estatísticas IA do hospital não encontradas.")

    return {
        "cod_ep_urgenc": int(episodio[0]),
        "num_utent": int(episodio[1]),
        "id_hosp": int(episodio[2]),
        "estado_ep": episodio[3],
        "cor_triagem": episodio[4] or "verde",
        "temperatura": float(episodio[5] or 0),
        "freq_card": int(episodio[6] or 0),
        "freq_resp": int(episodio[7] or 0),
        "spo2": float(episodio[8] or 0),
        "sistolica": int(episodio[9] or 0),
        "diastolica": int(episodio[10] or 0),
        "nivel_dor": int(episodio[11] or 0),
        "consciencia": episodio[12] or "Acordado",
        "hospital_nome": estat[1],
        "facility_size_beds": int(estat[2] or 0),
        "contagem_enfermeiros": int(estat[3] or 0),
        "contagem_medicos": int(estat[4] or 0),
        "pacientes_ativos": int(estat[5] or 0),
    }


def _build_wait_time_input(features: Dict[str, Any]) -> List[List[float]]:
    encoders = get_artifact("encoders_wait_time")

    estado_ep_enc = _encode_value(encoders, "estado_ep", features["estado_ep"])
    cor_triagem_enc = _encode_value(encoders, "cor_triagem", features["cor_triagem"])
    consciencia_enc = _encode_value(encoders, "consciencia", features["consciencia"])

    return [[
        float(features["facility_size_beds"]),
        float(features["contagem_enfermeiros"]),
        float(features["contagem_medicos"]),
        float(features["pacientes_ativos"]),
        float(features["temperatura"]),
        float(features["freq_card"]),
        float(features["freq_resp"]),
        float(features["spo2"]),
        float(features["sistolica"]),
        float(features["diastolica"]),
        float(features["nivel_dor"]),
        float(estado_ep_enc),
        float(cor_triagem_enc),
        float(consciencia_enc),
    ]]


def prever_tempo_espera(cod_ep_urgenc: int):
    model = get_artifact("wait_time")
    features = construir_features_espera(cod_ep_urgenc)
    X = _build_wait_time_input(features)

    pred = model.predict(X)[0]
    tempo_previsto = float(pred)

    predicao_ia_service.criar_predicao({
        "tipo_modelo": "tempo_espera",
        "entidade": "episodio_urgencia",
        "entidade_id": cod_ep_urgenc,
        "input_json": {
            "features_contexto": features,
            "features_modelo": X[0],
        },
        "output_json": {
            "tempo_espera_previsto_min": tempo_previsto,
            "modelo_executor": "xgboost_wait_time.joblib",
        },
        "score": None,
        "modelo_versao": "xgboost_wait_time_v1",
        "sucesso": True,
        "erro_mensagem": None,
    })

    return {
        "cod_ep_urgenc": cod_ep_urgenc,
        "tempo_espera_previsto_min": round(tempo_previsto, 2),
        "features_usadas": features,
    }