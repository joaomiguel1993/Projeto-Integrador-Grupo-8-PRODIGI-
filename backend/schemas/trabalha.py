from pydantic import BaseModel, ConfigDict
from typing import Optional


class TrabalhaCreate(BaseModel):
    idfunc: int
    idhosp: int


class TrabalhaUpdate(BaseModel):
    ativo: bool


class TrabalhaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    idhosp: int
    ativo: bool


class FuncionarioHospitalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    idhosp: int
    ativo: bool
    nome: str
    tipofunc: str


class HospitalFuncionarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    idhosp: int
    ativo: bool
    nome: str
    localizacao: str