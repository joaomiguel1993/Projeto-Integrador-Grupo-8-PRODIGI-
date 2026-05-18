from pydantic import BaseModel
from typing import List, Optional

class MedicineRiskInput(BaseModel):
    nif: str
    cod_medicamento: int
    outros_medicamentos_codigos: List[int] = []
    idade: Optional[int] = None
    sexo: Optional[str] = None
    alergias_classes: List[str] = []

class MedicineRiskPrediction(BaseModel):
    risco_score: float
    severidade: str
    mensagem_ia: Optional[str] = None
    recomendacao: Optional[str] = None
    modelo_versao: str