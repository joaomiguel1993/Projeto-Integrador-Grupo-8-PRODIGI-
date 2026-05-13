from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AtoBase(BaseModel):
    cod_ep_urgenc: int
    tipo: str
    descricao: Optional[str] = None
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None


class AtoCreate(AtoBase):
    pass


class AtoUpdate(BaseModel):
    tipo: Optional[str] = None
    descricao: Optional[str] = None
    data_hora_inicio: Optional[datetime] = None
    data_hora_fim: Optional[datetime] = None


class AtoOut(BaseModel):
    id_ato: int
    cod_ep_urgenc: int
    tipo: str
    descricao: Optional[str] = None
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None