from pydantic import BaseModel
from typing import Any, Dict

class PredicaoCreate(BaseModel):
    tipo_modelo: str          # triagem | tempo_espera | risco_medicamentoso
    entidade: str             # triagem | prescricao | tempo_espera
    entidade_id: int
    input_json: Dict[str, Any]
    output_json: Dict[str, Any]
    score: float
    modelo_versao: str
    sucesso: bool = True
    erro_mensagem: str | None = None