from pydantic import BaseModel, ConfigDict, Field


class ProfissionalCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=100)
    tipofunc: str = Field(..., min_length=1, max_length=20)
    sexo: str = Field(..., min_length=1, max_length=20)


class ProfissionalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    nome: str
    tipofunc: str
    sexo: str