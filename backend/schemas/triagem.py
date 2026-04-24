from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class TriagemBase(BaseModel):
    CorTriagem: str
    Sintomas: str
    Temperatura: Optional[float] = None
    FreqCard: Optional[int] = None
    FreqResp: Optional[int] = None
    SpO2: Optional[float] = None
    Sistolica: Optional[int] = None
    Diastolica: Optional[int] = None
    DataHoraFim: Optional[datetime] = None

class TriagemCreate(TriagemBase):
    CodEpUrgenc: int
    DataHoraInicio: datetime

class TriagemResponse(TriagemBase):
    CodEpUrgenc: int
    DataHoraInicio: datetime