from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PrescricaoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idato: int
    descricao: str


class PrescricaoCreate(PrescricaoBase):
    pass


class PrescricaoResponse(PrescricaoBase):
    idprescricao: int
    datahorapresc: datetime
