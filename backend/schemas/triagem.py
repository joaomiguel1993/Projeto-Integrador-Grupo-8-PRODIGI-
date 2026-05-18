from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class CorTriagemEnum(str, Enum):
    vermelho = "vermelho"
    laranja = "laranja"
    amarelo = "amarelo"
    verde = "verde"
    azul = "azul"


class QueixaPrincipalEnum(str, Enum):
    dor_toracica = "dor_toracica"
    dispneia = "dispneia"
    febre = "febre"
    cefaleia = "cefaleia"
    dor_abdominal = "dor_abdominal"
    trauma = "trauma"
    hemorragia = "hemorragia"
    vomitos = "vomitos"
    alteracao_consciencia = "alteracao_consciencia"
    reacao_alergica = "reacao_alergica"
    convulsoes = "convulsoes"
    intoxicacao = "intoxicacao"


class ViaAereaEnum(str, Enum):
    permeavel = "permeavel"
    comprometida = "comprometida"
    obstruida = "obstruida"


class RespiracaoCirculacaoEnum(str, Enum):
    normal = "normal"
    dispneia_ligeira = "dispneia_ligeira"
    dispneia_moderada = "dispneia_moderada"
    dispneia_grave = "dispneia_grave"
    choque = "choque"
    paragem_cardiorrespiratoria = "paragem_cardiorrespiratoria"


class HemorragiaEnum(str, Enum):
    nenhuma = "nenhuma"
    ligeira = "ligeira"
    moderada = "moderada"
    grave = "grave"


class ConscienciaEnum(str, Enum):
    alerta = "alerta"
    confuso = "confuso"
    sonolento = "sonolento"
    inconsciente = "inconsciente"


class EstadoPeleEnum(str, Enum):
    normal = "normal"
    palida = "palida"
    cianotica = "cianotica"
    sudorese = "sudorese"
    ruborizada = "ruborizada"


class MobilidadeEnum(str, Enum):
    independente = "independente"
    auxilio_parcial = "auxilio_parcial"
    cadeira_rodas = "cadeira_rodas"
    acamado = "acamado"


class TipoDorEnum(str, Enum):
    pontada = "pontada"
    pressao = "pressao"
    ardor = "ardor"
    pulsatil = "pulsatil"
    continua = "continua"
    intermitente = "intermitente"


class TriagemBase(BaseModel):
    cod_ep_urgenc: int
    data_hora_inicio: datetime
    data_hora_fim: Optional[datetime] = None
    cor_triagem: CorTriagemEnum
    queixa_principal: QueixaPrincipalEnum
    via_aerea: ViaAereaEnum
    respiracao_circulacao: RespiracaoCirculacaoEnum
    hemorragia: HemorragiaEnum
    consciencia: ConscienciaEnum
    estado_pele: Optional[EstadoPeleEnum] = None
    mobilidade: Optional[MobilidadeEnum] = None
    tipo_dor: Optional[TipoDorEnum] = None
    dor_localizacao: Optional[str] = Field(default=None, max_length=100)
    sintomas: str
    observacoes_clinicas: Optional[str] = None
    tempo_inicio_sintomas: Optional[str] = Field(default=None, max_length=100)
    escala_glasgow: Optional[int] = Field(default=None, ge=3, le=15)
    isolamento: bool = False
    gravida: bool = False
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    tempo_espera_previsto: Optional[int] = None
    id_func: Optional[int] = None


class TriagemCreate(TriagemBase):
    pass


class TriagemUpdate(BaseModel):
    data_hora_inicio: Optional[datetime] = None
    data_hora_fim: Optional[datetime] = None
    cor_triagem: Optional[CorTriagemEnum] = None
    queixa_principal: Optional[QueixaPrincipalEnum] = None
    via_aerea: Optional[ViaAereaEnum] = None
    respiracao_circulacao: Optional[RespiracaoCirculacaoEnum] = None
    hemorragia: Optional[HemorragiaEnum] = None
    consciencia: Optional[ConscienciaEnum] = None
    estado_pele: Optional[EstadoPeleEnum] = None
    mobilidade: Optional[MobilidadeEnum] = None
    tipo_dor: Optional[TipoDorEnum] = None
    dor_localizacao: Optional[str] = Field(default=None, max_length=100)
    sintomas: Optional[str] = None
    observacoes_clinicas: Optional[str] = None
    tempo_inicio_sintomas: Optional[str] = Field(default=None, max_length=100)
    escala_glasgow: Optional[int] = Field(default=None, ge=3, le=15)
    isolamento: Optional[bool] = None
    gravida: Optional[bool] = None
    temperatura: Optional[float] = None
    freq_card: Optional[int] = None
    freq_resp: Optional[int] = None
    sp_o2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None
    nivel_dor: Optional[int] = Field(default=None, ge=0, le=10)
    tempo_espera_previsto: Optional[int] = None
    id_func: Optional[int] = None


class TriagemOut(TriagemBase):
    model_config = ConfigDict(from_attributes=True)