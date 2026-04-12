from pydantic import BaseModel
from typing import Optional

class TriagemCreate(BaseModel):
    cod_epurgenc: int
    nome_hosp: str
    data_hora_triagem: str
    prioridade: str

class TriagemCompletaCreate(TriagemCreate):
    temperatura: float
    pressao_sistolica: int
    pressao_diastolica: int
    observacoes: Optional[str] = None
    num_func_triagem: Optional[int] = None

class TriagemResponse(TriagemCompletaCreate):
    pass