from pydantic import BaseModel, Field, ConfigDict


class HospitalBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str = Field(..., min_length=1, max_length=100)
    localizacao: str = Field(..., min_length=1, max_length=200)


class HospitalCreate(HospitalBase):
    pass


class HospitalResponse(HospitalBase):
    idhosp: int


class HospitalDeleteResponse(BaseModel):
    message: str
    idhosp: int
