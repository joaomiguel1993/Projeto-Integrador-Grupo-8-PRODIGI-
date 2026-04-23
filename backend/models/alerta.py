from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AlertaBase(BaseModel):
    IdPrescricao: int
    IdFunc: Optional[int] = None
    Tipo: str = Field(..., min_length=1, max_length=50)
    Ignorado: bool = False
    Justificacao: Optional[str] = None

class AlertaCreate(AlertaBase):
    pass

class AlertaResponse(AlertaBase):
    CodAlerta: int
    DataHorAlerta: datetime