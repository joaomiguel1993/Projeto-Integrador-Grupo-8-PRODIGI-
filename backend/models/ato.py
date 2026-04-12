from pydantic import BaseModel
from typing import Optional

class AtoCreate(BaseModel):
    cod_epurgenc: int
    nome_hosp: str
    data_hora_inicio: str
    tipo: str

class AtoResponse(AtoCreate):
    data_hora_fim: Optional[str] = None
    num_func_presc: Optional[int] = None
    data_hora_presc: Optional[str] = None