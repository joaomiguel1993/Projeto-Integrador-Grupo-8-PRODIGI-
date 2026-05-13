from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Literal, Dict, Any


class PredicaoIABase(BaseModel):
    tipo_modelo: Literal["triagem", "tempo_espera", "risco_medicamentoso"]
    entidade: Literal["triagem", "prescricao"]
    entidade_id: int
    input_json: Dict[str, Any]
    output_json: Dict[str, Any]
    score: Optional[float] = None
    modelo_versao: str
    sucesso: bool = True
    erro_mensagem: Optional[str] = None


class PredicaoIACreate(PredicaoIABase):
    pass


class PredicaoIAOut(PredicaoIABase):
    id_predicao: int
    criado_em: datetime