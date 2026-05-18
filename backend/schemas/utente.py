from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UtenteBase(BaseModel):
    nif: str = Field(min_length=9, max_length=9)
    nome: str
    data_nasc: date
    sexo: str
    localidade: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None


class UtenteCreate(UtenteBase):
    pass


class UtenteUpdate(BaseModel):
    nome: Optional[str] = None
    data_nasc: Optional[date] = None
    sexo: Optional[str] = None
    localidade: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None


class UtenteOut(UtenteBase):
    model_config = ConfigDict(from_attributes=True)