from pydantic import BaseModel, Field
from backend.models.enums import TipoFuncEnum

class UtilizadorBase(BaseModel):
    IdFunc: int
    UserName: str = Field(..., min_length=1, max_length=50)
    Funcao: TipoFuncEnum

class UtilizadorCreate(UtilizadorBase):
    Password: str = Field(..., min_length=4, max_length=255)

class UtilizadorLogin(BaseModel):
    UserName: str = Field(..., min_length=1, max_length=50)
    Password: str = Field(..., min_length=1, max_length=255)

class UtilizadorResponse(UtilizadorBase):
    IdUtilizador: int