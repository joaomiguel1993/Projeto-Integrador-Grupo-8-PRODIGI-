from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class AtoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codepurgenc: int
    tipo: str = Field(..., min_length=1, max_length=100)
    descricao: Optional[str] = None
    datahorafim: Optional[datetime] = None


class AtoCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codepurgenc: int
    tipo: str = Field(..., min_length=1, max_length=100)
    descricao: Optional[str] = None
    datahorainicio: Optional[datetime] = None


class AtoResponse(AtoBase):
    idato: int
    datahorainicio: datetime


class FuncionarioAtoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    nome: str
    tipofunc: str


class PrescricaoAtoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idprescricao: int
    idato: int
    descricao: str
    datahorapresc: datetime
