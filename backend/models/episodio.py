from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from backend.models.enums import EstadoEpEnum

class EpisodioBase(BaseModel):
    NumUtent: int
    IdHosp: int
    DataHoraSaida: Optional[datetime] = None
    Estado: EstadoEpEnum = EstadoEpEnum.aberto

class EpisodioCreate(EpisodioBase):
    pass

class EpisodioResponse(EpisodioBase):
    CodEpUrgenc: int
    DataHoraEntr: datetime