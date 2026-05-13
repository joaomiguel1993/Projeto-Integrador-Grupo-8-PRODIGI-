from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class InternamentoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codepurgenc: int
    idfunc: Optional[int] = None
    datahoraint: Optional[datetime] = None  # Adicionado aqui
    datahoraconsulta: Optional[datetime] = None
    datahoraalta: Optional[datetime] = None
    motivoint: str
    numerocama: Optional[str] = None
    servico: Optional[str] = None
    tipoalta: Optional[str] = None


class InternamentoCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    codepurgenc: int
    idfunc: Optional[int] = None
    datahoraint: datetime
    motivoint: str
    numerocama: Optional[str] = None
    servico: Optional[str] = None


class InternamentoUpdate(InternamentoBase):
    pass


class InternamentoResponse(InternamentoBase):
    codinternamento: int
    datahoraint: datetime