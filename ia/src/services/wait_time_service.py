import joblib
import numpy as np
from ..schemas.wait_time import WaitTimeInput, WaitTimePrediction
from ..core.config import settings

# Carrega modelo e encoders ao arrancar
_model_wait = joblib.load(settings.MODELO_WAIT_TIME_PATH)
_encoders_wait = joblib.load(settings.ENCODERS_WAIT_TIME_PATH)


def prever_tempo_espera(data: WaitTimeInput) -> WaitTimePrediction:
    # TODO: adapta isto ao teu preprocess real
    # Exemplo meramente ilustrativo:
    # X = preprocessar_wait_time(data, _encoders_wait)
    # y_pred = _model_wait.predict(X)[0]

    # Aqui meto um valor mock só para teres o arame montado:
    y_pred = 35  # minutos

    return WaitTimePrediction(
        tempo_espera_previsto_min=int(y_pred),
        intervalo_confianca=None,
        modelo_versao=settings.WAIT_TIME_MODEL_VERSION,
    )