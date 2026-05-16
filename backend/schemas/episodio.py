from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, Literal


class EpisodioBase(BaseModel):
    num_utent: int
    id_hosp: int
    data_hora_entr: Optional[datetime] = None
    estado: Literal["aberto", "em_triagem", "em_atendimento", "internado", "terminado"] = "aberto"


class EpisodioCreate(EpisodioBase):
    pass


class EpisodioUpdate(BaseModel):
    id_hosp: Optional[int] = None
    data_hora_atendimento: Optional[datetime] = None
    data_hora_saida: Optional[datetime] = None
    estado: Optional[Literal["aberto", "em_triagem", "em_atendimento", "internado", "terminado"]] = None


class EpisodioOut(BaseModel):
    cod_ep_urgenc: int
    num_utent: int
    id_hosp: int
    data_hora_entr: datetime
    data_hora_atendimento: Optional[datetime] = None
    data_hora_saida: Optional[datetime] = None
    estado: str
    nome_utente: Optional[str] = None
    data_nasc_utente: Optional[date] = None