from pydantic import BaseModel, Field

class MedicamentoBase(BaseModel):
    Nome: str = Field(..., min_length=1, max_length=100)
    PrincipioAtivo: str = Field(..., min_length=1, max_length=100)

class MedicamentoCreate(MedicamentoBase):
    pass

class MedicamentoResponse(MedicamentoBase):
    CodMedicamento: int