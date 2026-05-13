from typing import Optional

from pydantic import BaseModel, Field, ConfigDict

class HospitalBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str = Field(..., min_length=1, max_length=100)
    localizacao: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = Field(None, max_length=150)
    telefone: Optional[str] = Field(None, max_length=30)
    totalcamas: int = Field(default=100, ge=0) # 'ge=0' garante que não haja camas negativas

class HospitalCreate(HospitalBase):
    pass


class HospitalResponse(HospitalBase):
    idhosp: int


class HospitalDeleteResponse(BaseModel):
    message: str
    idhosp: int

class HospitalIAResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idhosp: int
    nome: str
    localizacao: str
    facility_size_beds: int
    contagem_enfermeiros: int
    contagem_medicos: int
    pacientes_ativos: int