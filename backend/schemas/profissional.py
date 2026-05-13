from pydantic import BaseModel
from typing import Optional, Literal


class ProfissionalBase(BaseModel):
    nome: str
    tipo_func: Literal["medico", "enfermeiro", "admin", "rececionista"]
    sexo: Literal["M", "F"]
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None


class ProfissionalCreate(ProfissionalBase):
    pass


class ProfissionalUpdate(BaseModel):
    nome: Optional[str] = None
    tipo_func: Optional[Literal["medico", "enfermeiro", "admin", "rececionista"]] = None
    sexo: Optional[Literal["M", "F"]] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None


class ProfissionalOut(BaseModel):
    id_func: int
    nome: str
    tipo_func: str
    sexo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None