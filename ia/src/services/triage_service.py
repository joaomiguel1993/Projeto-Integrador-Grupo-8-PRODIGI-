import joblib
import os
from ..schemas.triage import TriageInput, TriagePrediction

MODELO_TRIAGEM_PATH = os.getenv(
    "MODELO_TRIAGEM_PATH",
    "models/xgboost_triagem.joblib"
)
ENCODERS_TRIAGEM_PATH = os.getenv(
    "ENCODERS_TRIAGEM_PATH",
    "data/processed/encoders_triagem.joblib"
)

modelo_triagem = joblib.load(MODELO_TRIAGEM_PATH)
encoders_triagem = joblib.load(ENCODERS_TRIAGEM_PATH)
MODELO_TRIAGEM_VERSAO = "1.0.0"

def prever_triagem(data: TriageInput) -> TriagePrediction:
    # 1) converter input em vetor/df no formato do modelo
    # 2) aplicar encoders
    # 3) obter probas / classe
    # Exemplo ilustrativo (ajusta ao teu código existente):
    # X = preprocessar_triagem(data, encoders_triagem)
    # proba = modelo_triagem.predict_proba(X)[0]
    # classe_idx = proba.argmax()
    # cor = encoders_triagem["cor"].inverse_transform([classe_idx])[0]

    # Aqui coloca a chamada real ao teu código atual de previsão:
    cor = "amarelo"
    score = 0.85

    return TriagePrediction(
        cor_triagem=cor,
        score=score,
        explicacao=None,       # futuro: SHAP/LIME
        modelo_versao=MODELO_TRIAGEM_VERSAO,
    )