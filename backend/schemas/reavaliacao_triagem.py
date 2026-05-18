from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from enum import Enum


class CorTriagemEnum(str, Enum):
    vermelho = "vermelho"
    laranja = "laranja"
    amarelo = "amarelo"
    verde = "verde"
    azul = "azul"


class ReavaliacaoTriagemBase(BaseModel):
    cod_ep_urgenc: int
    data_hora: Optional[datetime] = None
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    observacoes: Optional[str] = None
    nova_cor_triagem: Optional[CorTriagemEnum] = None
    id_func: Optional[int] = None


class ReavaliacaoTriagemCreate(ReavaliacaoTriagemBase):
    pass


class ReavaliacaoTriagemUpdate(BaseModel):
    cod_ep_urgenc: Optional[int] = None
    data_hora: Optional[datetime] = None
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    observacoes: Optional[str] = None
    nova_cor_triagem: Optional[CorTriagemEnum] = None
    id_func: Optional[int] = None


class ReavaliacaoTriagemOut(ReavaliacaoTriagemBase):
    id_reavaliacao: int

    model_config = ConfigDict(from_attributes=True)