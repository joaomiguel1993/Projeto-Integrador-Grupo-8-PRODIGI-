from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EstadoEpEnum(str, Enum):
    aberto = "aberto"
    em_triagem = "em_triagem"
    em_atendimento = "em_atendimento"
    internado = "internado"
    terminado = "terminado"


class CorTriagemEnum(str, Enum):
    vermelho = "vermelho"
    laranja = "laranja"
    amarelo = "amarelo"
    verde = "verde"
    azul = "azul"


class EpUrgenciaBase(BaseModel):
    nif: str = Field(min_length=9, max_length=9)
    id_hosp: int
    data_hora_entr: Optional[datetime] = None
    data_hora_atendimento: Optional[datetime] = None
    data_hora_saida: Optional[datetime] = None
    estado: EstadoEpEnum = EstadoEpEnum.aberto
    prioridade_atual: Optional[CorTriagemEnum] = None
    tempo_espera_atual: Optional[int] = None
    em_observacao: bool = False
    destino_final: Optional[str] = Field(default=None, max_length=100)


class EpUrgenciaCreate(EpUrgenciaBase):
    pass


class EpUrgenciaUpdate(BaseModel):
    nif: Optional[str] = Field(default=None, min_length=9, max_length=9)
    id_hosp: Optional[int] = None
    data_hora_entr: Optional[datetime] = None
    data_hora_atendimento: Optional[datetime] = None
    data_hora_saida: Optional[datetime] = None
    estado: Optional[EstadoEpEnum] = None
    prioridade_atual: Optional[CorTriagemEnum] = None
    tempo_espera_atual: Optional[int] = None
    em_observacao: Optional[bool] = None
    destino_final: Optional[str] = Field(default=None, max_length=100)


class EpUrgenciaOut(EpUrgenciaBase):
    cod_ep_urgenc: int

    model_config = ConfigDict(from_attributes=True)