from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AtoBase(BaseModel):
    cod_ep_urgenc: int
    tipo: str = Field(min_length=1, max_length=100)
    descricao: Optional[str] = None
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None


class AtoCreate(AtoBase):
    pass


class AtoUpdate(BaseModel):
    cod_ep_urgenc: Optional[int] = None
    tipo: Optional[str] = Field(default=None, max_length=100)
    descricao: Optional[str] = None
    data_hora_inicio: Optional[datetime] = None
    data_hora_fim: Optional[datetime] = None


class AtoOut(AtoBase):
    id_ato: int

    model_config = ConfigDict(from_attributes=True)