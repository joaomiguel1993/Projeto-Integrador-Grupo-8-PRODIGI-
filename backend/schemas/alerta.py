from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class SeveridadeAlertaEnum(str, Enum):
    baixo = "baixo"
    moderado = "moderado"
    alto = "alto"
    critico = "critico"


class AlertaBase(BaseModel):
    id_prescricao: int
    id_func: Optional[int] = None
    tipo: str = Field(min_length=1, max_length=50)
    data_hor_alerta: Optional[datetime] = None
    ignorado: bool = False
    justificacao: Optional[str] = None
    severidade: SeveridadeAlertaEnum = SeveridadeAlertaEnum.moderado
    score_risco: Optional[float] = None
    resolvido: bool = False
    resolvido_em: Optional[datetime] = None
    resolvido_por: Optional[int] = None
    mensagem_ia: Optional[str] = None
    recomendacao: Optional[str] = None


class AlertaCreate(AlertaBase):
    pass


class AlertaUpdate(BaseModel):
    id_prescricao: Optional[int] = None
    id_func: Optional[int] = None
    tipo: Optional[str] = Field(default=None, max_length=50)
    data_hor_alerta: Optional[datetime] = None
    ignorado: Optional[bool] = None
    justificacao: Optional[str] = None
    severidade: Optional[SeveridadeAlertaEnum] = None
    score_risco: Optional[float] = None
    resolvido: Optional[bool] = None
    resolvido_em: Optional[datetime] = None
    resolvido_por: Optional[int] = None
    mensagem_ia: Optional[str] = None
    recomendacao: Optional[str] = None


class AlertaOut(AlertaBase):
    cod_alerta: int

    model_config = ConfigDict(from_attributes=True)