from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EpisodioCreate(BaseModel):
    cod_epurgenc: int
    nome_hosp: str
    num_utent: int
    data_hora_entr: str

class EpisodioResponse(EpisodioCreate):
    data_hora_saida: Optional[str] = None