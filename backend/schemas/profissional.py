from typing import Optional
from pydantic import BaseModel

class ProfissionalCreate(BaseModel):
    nome: str
    tipofunc: str
    sexo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None

class ProfissionalUpdate(BaseModel):
    nome: str
    tipofunc: str
    sexo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None

class ProfissionalResponse(BaseModel):
    idfunc: int
    nome: str
    tipofunc: str
    sexo: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    biografia: Optional[str] = None
    foto_url: Optional[str] = None