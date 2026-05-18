from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SinaisVitaisBase(BaseModel):
    cod_ep_urgenc: int
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    data_hora: Optional[datetime] = None
    id_func: Optional[int] = None


class SinaisVitaisCreate(SinaisVitaisBase):
    pass


class SinaisVitaisUpdate(BaseModel):
    cod_ep_urgenc: Optional[int] = None
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    data_hora: Optional[datetime] = None
    id_func: Optional[int] = None


class SinaisVitaisOut(SinaisVitaisBase):
    id_sinal: int

    model_config = ConfigDict(from_attributes=True)