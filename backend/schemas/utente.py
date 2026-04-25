from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UtenteBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str = Field(..., min_length=1, max_length=100)
    nif: str = Field(..., min_length=9, max_length=9)
    datanasc: date
    sexo: str
    localidade: Optional[str] = None


class UtenteCreate(UtenteBase):
    pass


class UtenteResponse(UtenteBase):
    numutent: int
