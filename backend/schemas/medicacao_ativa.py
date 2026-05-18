from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict, Field


class MedicacaoAtivaBase(BaseModel):
    nif: str = Field(min_length=9, max_length=9)
    cod_medicamento: int
    data_inicio: date
    data_fim: Optional[date] = None
    dosagem: Optional[str] = Field(default=None, max_length=50)


class MedicacaoAtivaCreate(MedicacaoAtivaBase):
    pass


class MedicacaoAtivaUpdate(BaseModel):
    nif: Optional[str] = Field(default=None, min_length=9, max_length=9)
    cod_medicamento: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    dosagem: Optional[str] = Field(default=None, max_length=50)


class MedicacaoAtivaOut(MedicacaoAtivaBase):
    cod_medicacao_ativa: int

    model_config = ConfigDict(from_attributes=True)