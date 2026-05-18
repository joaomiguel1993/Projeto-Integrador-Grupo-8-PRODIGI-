from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ContextoPrescricaoOut(BaseModel):
    id_prescricao: int
    id_ato: int
    cod_medicamento: int
    dosagem: str
    frequencia: Optional[str] = None
    via_administracao: Optional[str] = None
    duracao_dias: Optional[int] = None
    observacoes: Optional[str] = None
    data_hora_presc: Optional[datetime] = None
    estado_prescricao: Optional[str] = None
    score_risco_ia: Optional[float] = None
    cod_ep_urgenc: int
    nif: str
    id_hosp: int
    data_hora_entr: Optional[datetime] = None
    substancia: Optional[str] = None
    classe_terapeutica: Optional[str] = None
    nivel_gravidade: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)