from datetime import datetime
from pydantic import BaseModel

class RealizaEpUrgenciaResponse(BaseModel):
    IdFunc: int
    CodEpUrgenc: int
    DataHora: datetime