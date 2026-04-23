from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from backend.models.enums import CorTriagemEnum

class TriagemBase(BaseModel):
    CorTriagem: CorTriagemEnum
    Sintomas: str
    DataHoraFim: Optional[datetime] = None
    Temperatura: Optional[float] = None
    FreqCardiaca: Optional[int] = None
    FreqRespiratoria: Optional[int] = None
    SpO2: Optional[float] = None
    Sistolica: Optional[int] = None
    Diastolica: Optional[int] = None

class TriagemCreate(TriagemBase):
    CodEpUrgenc: int

class TriagemResponse(TriagemBase):
    CodEpUrgenc: int
    DataHoraInicio: datetime