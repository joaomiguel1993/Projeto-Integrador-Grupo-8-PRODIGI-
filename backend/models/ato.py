from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AtoBase(BaseModel):
    CodEpUrgenc: int
    Tipo: str = Field(..., min_length=1, max_length=100)
    DataHoraFim: Optional[datetime] = None
    Descricao: Optional[str] = None

class AtoCreate(BaseModel):
    CodEpUrgenc: int
    Tipo: str = Field(..., min_length=1, max_length=100)
    DataHoraInicio: Optional[datetime] = None
    Descricao: Optional[str] = None

class AtoResponse(AtoBase):
    IdAto: int
    DataHoraInicio: datetime

class RealizaAtoResponse(BaseModel):
    IdAto: int
    IdFunc: int