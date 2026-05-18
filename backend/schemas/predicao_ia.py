from enum import Enum
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class TipoModeloIAEnum(str, Enum):
    triagem = "triagem"
    tempo_espera = "tempo_espera"
    risco_medicamentoso = "risco_medicamentoso"


class EntidadeIAEnum(str, Enum):
    triagem = "triagem"
    prescricao = "prescricao"
    tempo_espera = "tempo_espera"


class PredicaoIABase(BaseModel):
    tipo_modelo: TipoModeloIAEnum
    entidade: EntidadeIAEnum
    entidade_id: int
    input_json: Dict[str, Any]
    output_json: Dict[str, Any]
    score: Optional[float] = None
    modelo_versao: str = Field(min_length=1, max_length=100)
    sucesso: bool = True
    erro_mensagem: Optional[str] = None
    criado_em: Optional[datetime] = None


class PredicaoIACreate(PredicaoIABase):
    pass


class PredicaoIAUpdate(BaseModel):
    tipo_modelo: Optional[TipoModeloIAEnum] = None
    entidade: Optional[EntidadeIAEnum] = None
    entidade_id: Optional[int] = None
    input_json: Optional[Dict[str, Any]] = None
    output_json: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    modelo_versao: Optional[str] = Field(default=None, max_length=100)
    sucesso: Optional[bool] = None
    erro_mensagem: Optional[str] = None
    criado_em: Optional[datetime] = None


class PredicaoIAOut(PredicaoIABase):
    id_predicao: int

    model_config = ConfigDict(from_attributes=True)