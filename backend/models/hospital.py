from pydantic import BaseModel, Field

class HospitalBase(BaseModel):
    Nome: str = Field(..., min_length=1, max_length=100)
    Localizacao: str = Field(..., min_length=1, max_length=200)

class HospitalCreate(HospitalBase):
    pass

class HospitalResponse(HospitalBase):
    IdHosp: int