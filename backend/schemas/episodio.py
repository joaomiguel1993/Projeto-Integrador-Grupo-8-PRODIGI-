from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EpisodioBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numutent: int
    idhosp: int
    datahorasaida: Optional[datetime] = None
    estado: str = "aberto"


class EpisodioCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numutent: int
    idhosp: int


class EpisodioResponse(EpisodioBase):
    codepurgenc: int
    datahoraentr: datetime
