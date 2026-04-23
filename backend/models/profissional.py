from pydantic import BaseModel, Field
from backend.models.enums import SexoEnum, TipoFuncEnum

class FuncionarioBase(BaseModel):
    NumFunc: str = Field(..., min_length=1, max_length=20)
    Nome: str = Field(..., min_length=1, max_length=100)
    TipoFunc: TipoFuncEnum
    Sexo: SexoEnum

class FuncionarioCreate(FuncionarioBase):
    pass

class FuncionarioResponse(FuncionarioBase):
    IdFunc: int

class MedicoResponse(FuncionarioResponse):
    Especialidade: str
    Estagiario: bool

class EnfermeiroResponse(FuncionarioResponse):
    pass