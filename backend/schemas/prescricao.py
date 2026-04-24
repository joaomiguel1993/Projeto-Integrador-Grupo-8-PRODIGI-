from datetime import datetime
from pydantic import BaseModel

class PrescricaoBase(BaseModel):
    IdAto: int
    Descricao: str

class PrescricaoCreate(PrescricaoBase):
    pass

class PrescricaoResponse(PrescricaoBase):
    IdPrescricao: int
    DataHoraPresc: datetime