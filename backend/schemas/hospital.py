from pydantic import BaseModel
from typing import Optional


class HospitalBase(BaseModel):
    nome: str
    localizacao: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    total_camas: Optional[int] = 100


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    nome: Optional[str] = None
    localizacao: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    total_camas: Optional[int] = None


class HospitalOut(BaseModel):
    id_hosp: int
    nome: str
    localizacao: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    total_camas: int