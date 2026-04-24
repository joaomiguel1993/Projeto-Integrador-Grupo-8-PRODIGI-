from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class UtenteBase(BaseModel):
    Nome: str = Field(..., min_length=1, max_length=100)
    NIF: str = Field(..., min_length=9, max_length=9)
    DataNasc: date
    Sexo: str
    Localidade: Optional[str] = None

class UtenteCreate(UtenteBase):
    pass

class UtenteResponse(UtenteBase):
    NumUtent: int