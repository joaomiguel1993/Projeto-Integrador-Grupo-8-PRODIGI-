from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal


class PrescricaoBase(BaseModel):
    id_ato: int
    cod_medicamento: int
    dosagem: str
    observacoes: Optional[str] = None


class PrescricaoCreate(PrescricaoBase):
    pass


class PrescricaoUpdate(BaseModel):
    id_ato: Optional[int] = None
    cod_medicamento: Optional[int] = None
    dosagem: Optional[str] = None
    observacoes: Optional[str] = None
    estado_prescricao: Optional[Literal["pendente", "aprovada", "bloqueada", "anulada"]] = None
    score_risco_ia: Optional[float] = None
    validado_por_ia: Optional[bool] = None
    data_hora_validacao_ia: Optional[datetime] = None


class PrescricaoOut(BaseModel):
    id_prescricao: int
    id_ato: int
    cod_medicamento: int
    dosagem: str
    observacoes: Optional[str] = None
    data_hora_presc: datetime
    estado_prescricao: str
    score_risco_ia: Optional[float] = None
    validado_por_ia: bool
    data_hora_validacao_ia: Optional[datetime] = None