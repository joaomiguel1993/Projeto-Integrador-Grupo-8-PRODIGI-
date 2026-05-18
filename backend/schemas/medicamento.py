from enum import Enum
from typing import Optional
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


class MedicamentoBase(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    principio_ativo: str = Field(min_length=1, max_length=100)
    classe_terapeutica: ClasseTerapeuticaEnum


class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, max_length=100)
    principio_ativo: Optional[str] = Field(default=None, max_length=100)
    classe_terapeutica: Optional[ClasseTerapeuticaEnum] = None


class MedicamentoOut(MedicamentoBase):
    cod_medicamento: int

    model_config = ConfigDict(from_attributes=True)