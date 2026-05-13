from pathlib import Path
import joblib

BASE_DIR = Path(__file__).resolve().parents[1]

_model    = None
_encoders = None


def _load():
    global _model, _encoders
    if _model is None:
        _model    = joblib.load(BASE_DIR / "models" / "xgboost_wait_time.joblib")
        _encoders = joblib.load(BASE_DIR / "data" / "processed" / "encoders_wait_time.joblib")


def prever(features: dict) -> float:
    """
    Recebe um dicionário com as 7 features e devolve o tempo de espera previsto em minutos.

    features = {
        "urgency_level":      "Critical" | "High" | "Medium" | "Low" | "Very Low",
        "nurse_ratio":        float,   # enfermeiros / pacientes_ativos
        "specialist_avail":   int,     # número de médicos ativos
        "facility_size_beds": int,     # total de camas do hospital
        "day_of_week":        "Monday" | "Tuesday" | ... | "Sunday",
        "time_of_day":        "Morning" | "Late Morning" | "Afternoon" | "Evening" | "Night",
        "season":             "Winter" | "Spring" | "Summer" | "Autumn",
    }
    """
    _load()

    enc = _encoders
    X = [[
        float(enc["Urgency Level"].transform([features["urgency_level"]])[0]),
        float(features["nurse_ratio"]),
        float(features["specialist_avail"]),
        float(features["facility_size_beds"]),
        float(enc["Day of Week"].transform([features["day_of_week"]])[0]),
        float(enc["Time of Day"].transform([features["time_of_day"]])[0]),
        float(enc["Season"].transform([features["season"]])[0]),
    ]]

    return float(_model.predict(X)[0])