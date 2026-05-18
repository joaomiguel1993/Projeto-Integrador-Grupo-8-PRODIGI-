from typing import Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class TipoAltaEnum(str, Enum):
    clinica = "clinica"
    voluntaria = "voluntaria"
    transferencia = "transferencia"
    obito = "obito"


class InternamentoBase(BaseModel):
    cod_ep_urgenc: int
    id_func: Optional[int] = None
    data_hora_int: datetime
    data_hora_consulta: Optional[datetime] = None
    data_hora_alta: Optional[datetime] = None
    motivo_int: str
    numero_cama: Optional[str] = Field(default=None, max_length=20)
    servico: Optional[str] = Field(default=None, max_length=100)
    prioridade_internamento: Optional[str] = Field(default=None, max_length=50)
    estado_atual: Optional[str] = Field(default="ativo", max_length=50)
    observacoes_alta: Optional[str] = None
    diagnostico_alta: Optional[str] = None
    tipo_alta: Optional[TipoAltaEnum] = None


class InternamentoCreate(InternamentoBase):
    pass


class InternamentoUpdate(BaseModel):
    cod_ep_urgenc: Optional[int] = None
    id_func: Optional[int] = None
    data_hora_int: Optional[datetime] = None
    data_hora_consulta: Optional[datetime] = None
    data_hora_alta: Optional[datetime] = None
    motivo_int: Optional[str] = None
    numero_cama: Optional[str] = Field(default=None, max_length=20)
    servico: Optional[str] = Field(default=None, max_length=100)
    prioridade_internamento: Optional[str] = Field(default=None, max_length=50)
    estado_atual: Optional[str] = Field(default=None, max_length=50)
    observacoes_alta: Optional[str] = None
    diagnostico_alta: Optional[str] = None
    tipo_alta: Optional[TipoAltaEnum] = None


class InternamentoOut(InternamentoBase):
    cod_internamento: int

    model_config = ConfigDict(from_attributes=True)