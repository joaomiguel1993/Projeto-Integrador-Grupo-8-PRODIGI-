from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class AntecedenteBase(BaseModel):
    Nome: str = Field(..., min_length=1, max_length=100)
    Tipo: Optional[str] = Field(None, max_length=50)

class AntecedenteCreate(AntecedenteBase):
    pass

class AntecedenteResponse(AntecedenteBase):
    CodAntecedente: int

class UtenteAntecedenteResponse(BaseModel):
    NumUtent: int
    CodAntecedente: int
    DataRegisto: date