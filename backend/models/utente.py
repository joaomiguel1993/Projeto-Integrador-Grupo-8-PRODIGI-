from datetime import date
from typing import Optional
from pydantic import BaseModel, Field
from backend.models.enums import SexoEnum

class UtenteBase(BaseModel):
    NIF: str = Field(..., min_length=9, max_length=9)
    Nome: str = Field(..., min_length=1, max_length=100)
    DataNasc: date
    Sexo: SexoEnum
    Localidade: Optional[str] = Field(None, max_length=100)

class UtenteCreate(UtenteBase):
    pass

class UtenteResponse(UtenteBase):
    NumUtent: int