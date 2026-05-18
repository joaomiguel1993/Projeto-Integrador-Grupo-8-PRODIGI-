from typing import Optional
from datetime import date
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class ClasseTerapeuticaEnum(str, Enum):
    analgesico = "analgesico"
    anti_inflamatorio = "anti_inflamatorio"
    antibiotico = "antibiotico"
    antiviral = "antiviral"
    antifungico = "antifungico"
    anti_histaminico = "anti_histaminico"
    corticosteroide = "corticosteroide"
    opioide = "opioide"
    ansiolitico = "ansiolitico"
    antidepressivo = "antidepressivo"
    antipsicotico = "antipsicotico"
    antiepileptico = "antiepileptico"
    anti_hipertensor = "anti_hipertensor"
    beta_bloqueador = "beta_bloqueador"
    anticoagulante = "anticoagulante"
    antiagregante = "antiagregante"
    antidiabetico = "antidiabetico"
    insulina = "insulina"
    broncodilatador = "broncodilatador"
    antiacido = "antiacido"
    diuretico = "diuretico"
    relaxante_muscular = "relaxante_muscular"
    imunossupressor = "imunossupressor"
    vacina = "vacina"
    sedativo = "sedativo"
    anestesico = "anestesico"
    contraste_radiologico = "contraste_radiologico"
    outro = "outro"


class AlergiaBase(BaseModel):
    nif: str = Field(min_length=9, max_length=9)
    substancia: str = Field(min_length=1, max_length=100)
    classe_terapeutica: ClasseTerapeuticaEnum
    nivel_gravidade: Optional[str] = Field(default=None, max_length=50)
    reacao: Optional[str] = None
    data_registo: Optional[date] = None


class AlergiaCreate(AlergiaBase):
    pass


class AlergiaUpdate(BaseModel):
    nif: Optional[str] = Field(default=None, min_length=9, max_length=9)
    substancia: Optional[str] = Field(default=None, min_length=1, max_length=100)
    classe_terapeutica: Optional[ClasseTerapeuticaEnum] = None
    nivel_gravidade: Optional[str] = Field(default=None, max_length=50)
    reacao: Optional[str] = None
    data_registo: Optional[date] = None


class AlergiaOut(AlergiaBase):
    cod_alergia: int

    model_config = ConfigDict(from_attributes=True)