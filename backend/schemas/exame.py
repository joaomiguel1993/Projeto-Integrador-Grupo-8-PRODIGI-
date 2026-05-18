from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ExameBase(BaseModel):
    cod_ep_urgenc: int
    tipo: str = Field(min_length=1, max_length=100)
    resultado: Optional[str] = None
    data_hora_pedido: Optional[datetime] = None
    data_hora_resultado: Optional[datetime] = None
    estado: Optional[str] = Field(default="pendente", max_length=50)
    id_func: Optional[int] = None


class ExameCreate(ExameBase):
    pass


class ExameUpdate(BaseModel):
    cod_ep_urgenc: Optional[int] = None
    tipo: Optional[str] = Field(default=None, max_length=100)
    resultado: Optional[str] = None
    data_hora_pedido: Optional[datetime] = None
    data_hora_resultado: Optional[datetime] = None
    estado: Optional[str] = Field(default=None, max_length=50)
    id_func: Optional[int] = None


class ExameOut(ExameBase):
    cod_exame: int

    model_config = ConfigDict(from_attributes=True)