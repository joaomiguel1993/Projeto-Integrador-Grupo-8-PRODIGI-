from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class UtenteAntecedenteCreate(BaseModel):
    codantecedente: int


class UtenteAntecedenteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    numutent: int
    codantecedente: int
    dataregisto: date


class UtenteAntecedenteDetalheResponse(UtenteAntecedenteResponse):
    nome: str
    tipo: Optional[str] = None