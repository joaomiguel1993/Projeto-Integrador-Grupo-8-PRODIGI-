from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class MedicamentoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str = Field(..., min_length=1, max_length=100)
    principioativo: str = Field(..., min_length=1, max_length=100)
    classeterapeuticaid: int = Field(...) # Adicionado campo obrigatório

class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(MedicamentoBase):
    pass


class MedicamentoResponse(MedicamentoBase):
    codmedicamento: int

class MedicamentoUpdate(BaseModel):
    nome: Optional[str] = Field(None, max_length=100)
    principioativo: Optional[str] = Field(None, max_length=100)
    classeterapeuticaid: Optional[int] = None