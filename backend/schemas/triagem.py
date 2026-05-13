from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal


class TriagemBase(BaseModel):
    cod_ep_urgenc: int
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None
    cor_triagem: Literal["vermelho", "laranja", "amarelo", "verde", "azul"]
    sintomas: str
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    consciencia: Optional[Literal["Acordado", "Confuso", "Inconsciente"]] = None
    tempo_espera_previsto: Optional[int] = None


class TriagemCreate(TriagemBase):
    pass


class TriagemUpdate(BaseModel):
    data_hora_fim: Optional[datetime] = None
    cor_triagem: Optional[Literal["vermelho", "laranja", "amarelo", "verde", "azul"]] = None
    sintomas: Optional[str] = None
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    consciencia: Optional[Literal["Acordado", "Confuso", "Inconsciente"]] = None
    tempo_espera_previsto: Optional[int] = None


class TriagemOut(BaseModel):
    cod_ep_urgenc: int
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None
    cor_triagem: str
    sintomas: str
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = None
    consciencia: Optional[str] = None
    tempo_espera_previsto: Optional[int] = None