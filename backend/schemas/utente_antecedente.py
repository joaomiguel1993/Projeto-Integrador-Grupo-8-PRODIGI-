from typing import Optional
from pydantic import BaseModel, ConfigDict


class UtenteAntecedenteBase(BaseModel):
    nif: str
    cod_antecedente: int
    data_registo: Optional[str] = None


class UtenteAntecedenteCreate(UtenteAntecedenteBase):
    pass


class UtenteAntecedenteUpdate(BaseModel):
    data_registo: Optional[str] = None


class UtenteAntecedenteOut(UtenteAntecedenteBase):
    model_config = ConfigDict(from_attributes=True)