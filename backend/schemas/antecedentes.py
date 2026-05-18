from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AntecedenteBase(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    tipo: Optional[str] = Field(default=None, max_length=50)


class AntecedenteCreate(AntecedenteBase):
    pass


class AntecedenteUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=100)
    tipo: Optional[str] = Field(default=None, max_length=50)


class AntecedenteOut(AntecedenteBase):
    cod_antecedente: int

    model_config = ConfigDict(from_attributes=True)