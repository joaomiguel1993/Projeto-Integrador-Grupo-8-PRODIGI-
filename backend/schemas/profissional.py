from pydantic import BaseModel


class ProfissionalCreate(BaseModel):
    nome: str
    tipofunc: str
    sexo: str


class ProfissionalUpdate(BaseModel):
    nome: str
    tipofunc: str
    sexo: str


class ProfissionalResponse(BaseModel):
    idfunc: int
    nome: str
    tipofunc: str
    sexo: str