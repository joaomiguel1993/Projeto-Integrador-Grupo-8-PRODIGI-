from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InternamentoCreate(BaseModel):
    num_utent: int
    nome_hosp: str
    data_internamento: str

class InternamentoResponse(InternamentoCreate):
    data_alta: Optional[str] = None