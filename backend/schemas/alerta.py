from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertaCreate(BaseModel):
    idprescricao: int
    idfunc: Optional[int] = None
    tipo: str


class AlertaUpdate(BaseModel):
    ignorado: bool
    justificacao: Optional[str] = None


class AlertaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codalerta: int
    idprescricao: int
    idfunc: Optional[int] = None
    tipo: str
    datahoralerta: datetime
    ignorado: bool
    justificacao: Optional[str] = None