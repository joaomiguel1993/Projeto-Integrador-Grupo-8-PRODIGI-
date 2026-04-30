from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MedicacaoAtivaCreate(BaseModel):
    numutent: int
    codmedicamento: int
    datainicio: date
    datafim: Optional[date] = None
    dosagem: Optional[str] = None


class MedicacaoAtivaUpdate(BaseModel):
    datafim: Optional[date] = None
    dosagem: Optional[str] = None


class MedicacaoAtivaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codmedicacaoativa: int
    numutent: int
    codmedicamento: int
    datainicio: date
    datafim: Optional[date] = None
    dosagem: Optional[str] = None


class MedicacaoAtivaDetalheResponse(MedicacaoAtivaResponse):
    nome: str
    principioativo: str