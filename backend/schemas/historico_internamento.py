from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HistoricoInternamentoBase(BaseModel):
    cod_internamento: int
    data_hora: Optional[datetime] = None
    tipo_evento: str = Field(min_length=1, max_length=100)
    descricao: str
    id_func: Optional[int] = None


class HistoricoInternamentoCreate(HistoricoInternamentoBase):
    pass


class HistoricoInternamentoUpdate(BaseModel):
    cod_internamento: Optional[int] = None
    data_hora: Optional[datetime] = None
    tipo_evento: Optional[str] = Field(default=None, max_length=100)
    descricao: Optional[str] = None
    id_func: Optional[int] = None


class HistoricoInternamentoOut(HistoricoInternamentoBase):
    id_historico: int

    model_config = ConfigDict(from_attributes=True)