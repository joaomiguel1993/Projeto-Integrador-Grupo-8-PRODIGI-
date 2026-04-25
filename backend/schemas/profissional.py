from pydantic import BaseModel, ConfigDict


class ProfissionalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idfunc: int
    nome: str
    tipofunc: str
    sexo: str
