from pydantic import BaseModel, ConfigDict
from datetime import date

class AlergiaBase(BaseModel):
    substancia: str
    classeterapeuticaid: int
    nivelgravidade: str | None = None

class AlergiaResponse(AlergiaBase):
    model_config = ConfigDict(from_attributes=True)
    codalergia: int
    numutent: int
    dataregisto: date