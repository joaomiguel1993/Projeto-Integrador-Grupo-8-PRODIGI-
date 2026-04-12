from pydantic import BaseModel

class HospitalCreate(BaseModel):
    nome: str
    localizacao: str

class HospitalResponse(HospitalCreate):
    pass