from pydantic import BaseModel

class UtenteCreate(BaseModel):
    numutent: int
    sexo: str
    localidade: str
    idadeatual: int

class UtenteResponse(UtenteCreate):
    pass