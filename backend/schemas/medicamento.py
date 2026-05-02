from pydantic import BaseModel, Field, ConfigDict


class MedicamentoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str = Field(..., min_length=1, max_length=100)
    principioativo: str = Field(..., min_length=1, max_length=100)


class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(MedicamentoBase):
    pass


class MedicamentoResponse(MedicamentoBase):
    codmedicamento: int