from pydantic import BaseModel
from typing import Optional

class WaitTimeInput(BaseModel):
    cor_triagem: str
    hora_chegada: str   # ou datetime ISO, dependendo do modelo
    dia_semana: int
    hospital_id: int
    pacientes_na_fila: int

class WaitTimePrediction(BaseModel):
    tempo_espera_previsto_min: int
    intervalo_confianca: Optional[str] = None
    modelo_versao: str