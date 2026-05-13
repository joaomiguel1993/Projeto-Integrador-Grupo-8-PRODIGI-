from pydantic import BaseModel
from typing import Optional


class MedicamentoBase(BaseModel):
    nome: str
    principio_ativo: str
    classe_terapeutica_id: int


class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(BaseModel):
    nome: Optional[str] = None
    principio_ativo: Optional[str] = None
    classe_terapeutica_id: Optional[int] = None


class MedicamentoOut(BaseModel):
    cod_medicamento: int
    nome: str
    principio_ativo: str
    classe_terapeutica_id: int