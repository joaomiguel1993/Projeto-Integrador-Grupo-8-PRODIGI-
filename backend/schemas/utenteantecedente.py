from pydantic import BaseModel
from datetime import date
from typing import Optional


class UtenteAntecedenteBase(BaseModel):
    num_utent: int
    cod_antecedente: int
    data_registo: Optional[date] = None


class UtenteAntecedenteCreate(UtenteAntecedenteBase):
    pass


class UtenteAntecedenteUpdate(BaseModel):
    data_registo: Optional[date] = None


class UtenteAntecedenteOut(BaseModel):
    num_utent: int
    cod_antecedente: int
    data_registo: date
    nome: Optional[str] = None
    tipo: Optional[str] = None