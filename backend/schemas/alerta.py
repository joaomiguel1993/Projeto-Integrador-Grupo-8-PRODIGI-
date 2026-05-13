from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class AlertaBase(BaseModel):
    id_prescricao: int
    id_func: Optional[int] = None
    tipo: str
    justificacao: Optional[str] = None
    severidade: Literal["baixo", "moderado", "alto", "critico"] = "moderado"
    score_risco: Optional[float] = None


class AlertaCreate(AlertaBase):
    pass


class AlertaUpdate(BaseModel):
    id_func: Optional[int] = None
    tipo: Optional[str] = None
    ignorado: Optional[bool] = None
    justificacao: Optional[str] = None
    severidade: Optional[Literal["baixo", "moderado", "alto", "critico"]] = None
    score_risco: Optional[float] = None
    resolvido: Optional[bool] = None
    resolvido_em: Optional[datetime] = None
    resolvido_por: Optional[int] = None


class AlertaOut(BaseModel):
    cod_alerta: int
    id_prescricao: int
    id_func: Optional[int] = None
    tipo: str
    data_hor_alerta: datetime
    ignorado: bool
    justificacao: Optional[str] = None
    severidade: str
    score_risco: Optional[float] = None
    resolvido: bool
    resolvido_em: Optional[datetime] = None
    resolvido_por: Optional[int] = None