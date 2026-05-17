from pydantic import BaseModel, model_validator
from datetime import date
from typing import Optional


class MedicacaoAtivaBase(BaseModel):
    num_utent: int
    cod_medicamento: int
    data_inicio: date
    data_fim: Optional[date] = None
    dosagem: Optional[str] = None

    @model_validator(mode="after")
    def validar_datas(self):
        if self.data_fim is not None and self.data_fim < self.data_inicio:
            raise ValueError("data_fim não pode ser anterior a data_inicio.")
        return self


class MedicacaoAtivaCreate(MedicacaoAtivaBase):
    pass


class MedicacaoAtivaUpdate(BaseModel):
    data_fim: Optional[date] = None
    dosagem: Optional[str] = None


class MedicacaoAtivaOut(BaseModel):
    cod_medicacao_ativa: int
    num_utent: int
    cod_medicamento: int
    data_inicio: date
    data_fim: Optional[date] = None
    dosagem: Optional[str] = None
    nome_medicamento: Optional[str] = None
    principio_ativo:  Optional[str] = None