from pydantic import BaseModel
from typing import Optional


class AntecedenteBase(BaseModel):
    nome: str
    tipo: Optional[str] = None


class AntecedenteCreate(AntecedenteBase):
    pass


class AntecedenteUpdate(BaseModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None


class AntecedenteOut(BaseModel):
    cod_antecedente: int
    nome: str
    tipo: Optional[str] = None