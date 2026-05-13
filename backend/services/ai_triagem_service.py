from datetime import datetime
from typing import Any, Dict, List

from fastapi import HTTPException

from backend.db import run_query
from backend.services.model_registry import get_artifact
from backend.services import predicao_ia_service


def _first_or_none(rows):
    if not rows:
        return None
    return rows[0]


def _load_triagem_context(cod_ep_urgenc: int):
    rows = run_query("""
        SELECT
            t.codepurgenc,
            t.cortriagem,
            t.sintomas,
            t.temperatura,
            t.freqcard,
            t.freqresp,
            t.spo2,
            t.sistolica,
            t.diastolica,
            t.niveldor,
            t.consciencia,
            t.tempoesperaprevisto,
            e.numutent,
            e.idhosp,
            e.estado,
            u.sexo,
            u.datanasc
        FROM triagem t
        JOIN epurgencia e ON e.codepurgenc = t.codepurgenc
        JOIN utente u ON u.numutent = e.numutent
        WHERE t.codepurgenc = %s
    """, (cod_ep_urgenc,))
    return _first_or_none(rows)


def _calc_age(data_nasc):
    if data_nasc is None:
        return 0
    from datetime import date
    hoje = date.today()
    return hoje.year - data_nasc.year - ((hoje.month, hoje.day) < (data_nasc.month, data_nasc.day))


def _encode_value(encoders, key: str, value, default=0):
    encoder = encoders.get(key) if isinstance(encoders, dict) else None
    if encoder is None:
        return default
    try:
        return int(encoder.transform([value])[0])
    except Exception:
        return default


def construir_features_triagem(cod_ep_urgenc: int) -> Dict[str, Any]:
    row = _load_triagem_context(cod_ep_urgenc)
    if row is None:
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")

    idade = _calc_age(row[16])

    return {
        "cod_ep_urgenc": int(row[0]),
        "cor_triagem_atual": row[1],
        "sintomas": row[2],
        "temperatura": float(row[3] or 0),
        "freq_card": int(row[4] or 0),
        "freq_resp": int(row[5] or 0),
        "spo2": float(row[6] or 0),
        "sistolica": int(row[7] or 0),
        "diastolica": int(row[8] or 0),
        "nivel_dor": int(row[9] or 0),
        "consciencia": row[10] or "Acordado",
        "tempo_espera_previsto": int(row[11] or 0),
        "num_utent": int(row[12]),
        "id_hosp": int(row[13]),
        "estado_ep": row[14],
        "sexo": row[15],
        "idade": int(idade),
    }


def _build_triagem_model_input(features: Dict[str, Any]) -> List[List[float]]:
    encoders = get_artifact("encoders_triagem")

    sexo_enc = _encode_value(encoders, "sexo", features["sexo"])
    consciencia_enc = _encode_value(encoders, "consciencia", features["consciencia"])
    estado_ep_enc = _encode_value(encoders, "estado_ep", features["estado_ep"])

    return [[
        float(features["temperatura"]),
        float(features["freq_card"]),
        float(features["freq_resp"]),
        float(features["spo2"]),
        float(features["sistolica"]),
        float(features["diastolica"]),
        float(features["nivel_dor"]),
        float(features["tempo_espera_previsto"]),
        float(features["idade"]),
        float(sexo_enc),
        float(consciencia_enc),
        float(estado_ep_enc),
    ]]


def prever_triagem(cod_ep_urgenc: int):
    model = get_artifact("triagem")
    encoders = get_artifact("encoders_triagem")

    features = construir_features_triagem(cod_ep_urgenc)
    X = _build_triagem_model_input(features)

    pred = model.predict(X)[0]
    score = 0.5

    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(X)[0]
            score = float(max(proba))
        except Exception:
            pass

    cor_prevista = pred
    encoder_target = encoders.get("cor_triagem") if isinstance(encoders, dict) else None
    if encoder_target is not None:
        try:
            cor_prevista = encoder_target.inverse_transform([pred])[0]
        except Exception:
            cor_prevista = str(pred)

    predicao_ia_service.criar_predicao({
        "tipo_modelo": "triagem",
        "entidade": "episodio_urgencia",
        "entidade_id": cod_ep_urgenc,
        "input_json": {
            "features_contexto": features,
            "features_modelo": X[0],
        },
        "output_json": {
            "cor_triagem_prevista": cor_prevista,
            "pred_raw": str(pred),
            "modelo_executor": "xgboost_triagem.joblib",
        },
        "score": score,
        "modelo_versao": "xgboost_triagem_v1",
        "sucesso": True,
        "erro_mensagem": None,
    })

    return {
        "cod_ep_urgenc": cod_ep_urgenc,
        "cor_triagem_prevista": cor_prevista,
        "confianca": score,
        "features_usadas": features,
    }