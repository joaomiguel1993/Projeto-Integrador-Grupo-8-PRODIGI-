from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TriagemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    cortriagem: str
    sintomas: str
    temperatura: Optional[float] = None
    freqcard: Optional[int] = None
    freqresp: Optional[int] = None
    spo2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    datahorafim: Optional[datetime] = None

class TriagemCreate(TriagemBase):
    codepurgenc: int
    datahorainicio: datetime

class TriagemUpdate(TriagemBase):
    pass

class TriagemResponse(TriagemBase):
    codepurgenc: int
    datahorainicio: datetime