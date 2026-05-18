from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class HospitalBase(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    localizacao: str = Field(min_length=1, max_length=200)
    email: Optional[str] = Field(default=None, max_length=150)
    telefone: Optional[str] = Field(default=None, max_length=30)
    total_camas: Optional[int] = 100


class HospitalCreate(HospitalBase):
    pass


class HospitalUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=100)
    localizacao: Optional[str] = Field(default=None, max_length=200)
    email: Optional[str] = Field(default=None, max_length=150)
    telefone: Optional[str] = Field(default=None, max_length=30)
    total_camas: Optional[int] = None


class HospitalOut(HospitalBase):
    id_hosp: int

    model_config = ConfigDict(from_attributes=True)