from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional, Literal


class InternamentoBase(BaseModel):
    cod_ep_urgenc: int
    id_func: Optional[int] = None
    data_hora_int: datetime
    data_hora_consulta: Optional[datetime] = None
    data_hora_alta: Optional[datetime] = None
    motivo_int: str
    numero_cama: Optional[str] = None
    servico: Optional[str] = None
    tipo_alta: Optional[Literal["clinica", "voluntaria", "transferencia", "obito"]] = None

    @model_validator(mode="after")
    def validar_alta(self):
        if (self.data_hora_alta is None and self.tipo_alta is not None) or (
            self.data_hora_alta is not None and self.tipo_alta is None
        ):
            raise ValueError("data_hora_alta e tipo_alta devem ser preenchidos em conjunto.")
        return self


class InternamentoCreate(InternamentoBase):
    pass


class InternamentoUpdate(BaseModel):
    id_func: Optional[int] = None
    data_hora_consulta: Optional[datetime] = None
    data_hora_alta: Optional[datetime] = None
    motivo_int: Optional[str] = None
    numero_cama: Optional[str] = None
    servico: Optional[str] = None
    tipo_alta: Optional[Literal["clinica", "voluntaria", "transferencia", "obito"]] = None

    @model_validator(mode="after")
    def validar_alta(self):
        if (self.data_hora_alta is None and self.tipo_alta is not None) or (
            self.data_hora_alta is not None and self.tipo_alta is None
        ):
            raise ValueError("data_hora_alta e tipo_alta devem ser preenchidos em conjunto.")
        return self


class InternamentoOut(BaseModel):
    cod_internamento: int
    cod_ep_urgenc: int
    id_func: Optional[int] = None
    data_hora_int: datetime
    data_hora_consulta: Optional[datetime] = None
    data_hora_alta: Optional[datetime] = None
    motivo_int: str
    numero_cama: Optional[str] = None
    servico: Optional[str] = None
    tipo_alta: Optional[str] = None
    nome_utente: Optional[str] = None  # ← adicionar