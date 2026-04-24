from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AtoBase(BaseModel):
    CodEpUrgenc: int
    Tipo: str = Field(..., min_length=1, max_length=100)
    Descricao: Optional[str] = None
    DataHoraFim: Optional[datetime] = None

class AtoCreate(BaseModel):
    CodEpUrgenc: int
    Tipo: str = Field(..., min_length=1, max_length=100)
    Descricao: Optional[str] = None
    DataHoraInicio: Optional[datetime] = None

class AtoResponse(AtoBase):
    IdAto: int
    DataHoraInicio: datetime

class FuncionarioAtoResponse(BaseModel):
    IdFunc: int
    Nome: str
    TipoFunc: str

class PrescricaoAtoResponse(BaseModel):
    IdPrescricao: int
    IdAto: int
    Descricao: str
    DataHoraPresc: datetime