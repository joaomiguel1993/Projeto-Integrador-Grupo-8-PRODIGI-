from pydantic import BaseModel
from typing import Optional

class PrescricaoCreate(BaseModel):
    cod_epurgenc: int
    nome_hosp: str
    num_func_presc: int
    data_hora_presc: str
    medicamento: str
    dose: Optional[str] = None
    frequencia: Optional[str] = None
    duracao: Optional[str] = None

class PrescricaoResponse(PrescricaoCreate):
    cod_prescricao: int