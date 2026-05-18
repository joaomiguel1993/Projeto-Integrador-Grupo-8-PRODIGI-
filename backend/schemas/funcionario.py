from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TipoFuncEnum(str, Enum):
    medico = "medico"
    enfermeiro = "enfermeiro"
    admin = "admin"
    rececionista = "rececionista"


class FuncionarioBase(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    tipo_func: TipoFuncEnum
    sexo: str = Field(min_length=1, max_length=1)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(default=None, max_length=20)
    biografia: Optional[str] = None
    foto_url: Optional[str] = None


class FuncionarioCreate(FuncionarioBase):
    pass


class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=100)
    tipo_func: Optional[TipoFuncEnum] = None
    sexo: Optional[str] = Field(default=None, min_length=1, max_length=1)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(default=None, max_length=20)
    biografia: Optional[str] = None
    foto_url: Optional[str] = None


class FuncionarioOut(FuncionarioBase):
    id_func: int

    model_config = ConfigDict(from_attributes=True)