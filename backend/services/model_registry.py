from pathlib import Path
import joblib
from fastapi import HTTPException


BASE_DIR = Path(__file__).resolve().parents[1]
IA_DIR = BASE_DIR / "IA"

MODEL_PATHS = {
    "medicine_risk": IA_DIR / "models" / "randomforest_medicine_risk.joblib",
    "triagem": IA_DIR / "models" / "xgboost_triagem.joblib",
    "wait_time": IA_DIR / "models" / "xgboost_wait_time.joblib",
    "encoders_triagem": IA_DIR / "data" / "processed" / "encoders_triagem.joblib",
    "encoders_wait_time": IA_DIR / "data" / "processed" / "encoders_aist_time.joblib",
}

_CACHE = {}


def get_artifact(name: str):
    if name not in MODEL_PATHS:
        raise HTTPException(status_code=500, detail=f"Artefacto IA desconhecido: {name}")

    if name not in _CACHE:
        path = MODEL_PATHS[name]
        if not path.exists():
            raise HTTPException(status_code=500, detail=f"Ficheiro IA não encontrado: {path}")
        _CACHE[name] = joblib.load(path)

    return _CACHE[name]