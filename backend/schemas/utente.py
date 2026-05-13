from pydantic import BaseModel, EmailStr, Field
from datetime import date
from typing import Optional, Literal


class UtenteBase(BaseModel):
    nome: str
    nif: str = Field(..., min_length=9, max_length=9)
    data_nasc: date
    sexo: Literal["M", "F"]
    localidade: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None


class UtenteCreate(UtenteBase):
    pass


class UtenteUpdate(BaseModel):
    nome: Optional[str] = None
    nif: Optional[str] = Field(default=None, min_length=9, max_length=9)
    data_nasc: Optional[date] = None
    sexo: Optional[Literal["M", "F"]] = None
    localidade: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None


class UtenteOut(BaseModel):
    num_utent: int
    nome: str
    nif: str
    data_nasc: date
    sexo: str
    localidade: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None