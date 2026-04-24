from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class EpisodioBase(BaseModel):
    NumUtent: int
    IdHosp: int
    DataHoraSaida: Optional[datetime] = None
    Estado: str = "aberto"

class EpisodioCreate(BaseModel):
    NumUtent: int
    IdHosp: int

class EpisodioResponse(EpisodioBase):
    CodEpUrgenc: int
    DataHoraEntr: datetime