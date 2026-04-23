from datetime import date
from typing import Optional
from pydantic import BaseModel, Field

class MedicamentoBase(BaseModel):
    Nome: str = Field(..., min_length=1, max_length=100)
    PrincipioAtivo: str = Field(..., min_length=1, max_length=100)

class MedicamentoCreate(MedicamentoBase):
    pass

class MedicamentoResponse(MedicamentoBase):
    CodMedicamento: int

class MedicacaoAtivaResponse(BaseModel):
    CodMedicacaoAtiva: int
    NumUtent: int
    CodMedicamento: int
    DataInicio: date
    DataFim: Optional[date] = None
    Dosagem: Optional[str] = Field(None, max_length=50)
    Ativo: bool