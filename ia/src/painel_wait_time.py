"""
Módulo de previsão de tempos de espera para o painel da sala de espera.
Recebe o estado operacional do hospital e devolve os tempos previstos
para cada cor de triagem.
"""
from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]

_model    = None
_encoders = None

PULSEIRAS = {
    "vermelho": "Critical",
    "laranja":  "High",
    "amarelo":  "Medium",
    "verde":    "Low",
    "azul":     "Very Low",
}


def _load():
    global _model, _encoders
    if _model is None:
        _model    = joblib.load(BASE_DIR / "models" / "xgboost_wait_time.joblib")
        _encoders = joblib.load(BASE_DIR / "data" / "processed" / "encoders_wait_time.joblib")


def prever_painel(estado_hospital: dict) -> dict:
    _load()
    enc = _encoders
    resultado = {}

    for cor_pt, urgency_en in PULSEIRAS.items():
        X = [[
            float(enc["Urgency Level"].transform([urgency_en])[0]),
            float(estado_hospital["nurse_ratio"]),
            float(estado_hospital["specialist_avail"]),
            float(estado_hospital["facility_size_beds"]),
            float(enc["Day of Week"].transform([estado_hospital["day_of_week"]])[0]),
            float(enc["Time of Day"].transform([estado_hospital["time_of_day"]])[0]),
            float(enc["Season"].transform([estado_hospital["season"]])[0]),
        ]]
        resultado[cor_pt] = round(float(_model.predict(X)[0]), 1)

    return resultado