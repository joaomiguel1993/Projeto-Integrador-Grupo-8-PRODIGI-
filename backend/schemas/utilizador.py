from pydantic import BaseModel, Field, ConfigDict


class HospitalMiniResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idhosp: int
    nome: str


class UtilizadorBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str = Field(..., min_length=1, max_length=50)


class UtilizadorCreate(UtilizadorBase):
    idfunc: int
    password: str = Field(..., min_length=1, max_length=255)


class UtilizadorResponse(UtilizadorBase):
    idfunc: int


class UtilizadorDetalheResponse(UtilizadorBase):
    idfunc: int
    nome: str
    tipofunc: str
    hospitais: list[HospitalMiniResponse] = []