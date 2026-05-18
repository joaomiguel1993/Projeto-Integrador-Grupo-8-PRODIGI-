import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    # Base
    APP_NAME: str = "SIGUI IA Service"
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # DB SIGUI (usa o mesmo Postgres do backend)
    SIGUI_DB_URL: str = os.getenv(
        "SIGUI_DB_URL",
        "postgresql+psycopg2://user:password@localhost:5432/sigui_db"
    )

    # Modelos IA
    MODELO_TRIAGEM_PATH: str = os.getenv(
        "MODELO_TRIAGEM_PATH", "models/xgboost_triagem.joblib"
    )
    ENCODERS_TRIAGEM_PATH: str = os.getenv(
        "ENCODERS_TRIAGEM_PATH", "data/processed/encoders_triagem.joblib"
    )

    MODELO_WAIT_TIME_PATH: str = os.getenv(
        "MODELO_WAIT_TIME_PATH", "models/xgboost_wait_time.joblib"
    )
    ENCODERS_WAIT_TIME_PATH: str = os.getenv(
        "ENCODERS_WAIT_TIME_PATH", "data/processed/encoders_wait_time.joblib"
    )

    MODELO_MEDICINE_RISK_PATH: str = os.getenv(
        "MODELO_MEDICINE_RISK_PATH", "models/randomforest_medicine_risk.joblib"
    )

    TRIAGEM_MODEL_VERSION: str = "1.0.0"
    WAIT_TIME_MODEL_VERSION: str = "1.0.0"
    MEDICINE_RISK_MODEL_VERSION: str = "1.0.0"

    # CORS (se precisares)
    BACKEND_CORS_ORIGINS: str = os.getenv(
        "BACKEND_CORS_ORIGINS", "*"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()