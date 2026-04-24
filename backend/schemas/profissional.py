from pydantic import BaseModel

class ProfissionalResponse(BaseModel):
    IdFunc: int
    Nome: str
    TipoFunc: str
    Sexo: str