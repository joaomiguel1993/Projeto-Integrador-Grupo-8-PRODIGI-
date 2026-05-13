from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class TriagemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    # Manchester Protocol Colors
    cortriagem: Literal['vermelho', 'laranja', 'amarelo', 'verde', 'azul']
    sintomas: str
    temperatura: Optional[float] = Field(None, ge=30, le=45) # ge: greater than, le: less than
    freqcard: Optional[int] = None
    freqresp: Optional[int] = None
    spo2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    
    # Campos que faltavam:
    niveldor: Optional[int] = Field(None, ge=0, le=10)
    consciencia: Optional[Literal['Acordado', 'Confuso', 'Inconsciente']] = None
    tempoesperaprevisto: Optional[int] = None
    
    datahorafim: Optional[datetime] = None

class TriagemCreate(TriagemBase):
    codepurgenc: int
    datahorainicio: datetime = Field(default_factory=datetime.now)

class TriagemResponse(TriagemBase):
    codepurgenc: int
    datahorainicio: datetime