from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EstadoPrescricaoEnum(str, Enum):
    pendente = "pendente"
    aprovada = "aprovada"
    bloqueada = "bloqueada"
    anulada = "anulada"


class PrescreveBase(BaseModel):
    id_ato: int
    cod_medicamento: int
    dosagem: str = Field(min_length=1, max_length=50)
    frequencia: Optional[str] = Field(default=None, max_length=50)
    via_administracao: Optional[str] = Field(default=None, max_length=50)
    duracao_dias: Optional[int] = None
    observacoes: Optional[str] = None
    data_hora_presc: Optional[datetime] = None
    estado_prescricao: EstadoPrescricaoEnum = EstadoPrescricaoEnum.pendente
    score_risco_ia: Optional[float] = None
    validado_por_ia: bool = False
    data_hora_validacao_ia: Optional[datetime] = None


class PrescreveCreate(PrescreveBase):
    pass


class PrescreveUpdate(BaseModel):
    id_ato: Optional[int] = None
    cod_medicamento: Optional[int] = None
    dosagem: Optional[str] = Field(default=None, max_length=50)
    frequencia: Optional[str] = Field(default=None, max_length=50)
    via_administracao: Optional[str] = Field(default=None, max_length=50)
    duracao_dias: Optional[int] = None
    observacoes: Optional[str] = None
    data_hora_presc: Optional[datetime] = None
    estado_prescricao: Optional[EstadoPrescricaoEnum] = None
    score_risco_ia: Optional[float] = None
    validado_por_ia: Optional[bool] = None
    data_hora_validacao_ia: Optional[datetime] = None


class PrescreveOut(PrescreveBase):
    id_prescricao: int

    model_config = ConfigDict(from_attributes=True)