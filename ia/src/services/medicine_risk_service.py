import joblib
from ..schemas.medicine_risk import (
    MedicineRiskInput,
    MedicineRiskPrediction,
)
from ..core.config import settings

_model_med = joblib.load(settings.MODELO_MEDICINE_RISK_PATH)


def prever_risco_medicamentoso(
    data: MedicineRiskInput,
) -> MedicineRiskPrediction:
    # TODO: adaptar ao teu preprocess real
    # Por agora devolvo um risco fake controlado.
    risco_score = 0.2
    severidade = "baixo"
    mensagem = "Sem interações críticas detetadas"
    recomendacao = "Manter prescrição; monitorizar clinicamente."

    return MedicineRiskPrediction(
        risco_score=risco_score,
        severidade=severidade,
        mensagem_ia=mensagem,
        recomendacao=recomendacao,
        modelo_versao=settings.MEDICINE_RISK_MODEL_VERSION,
    )