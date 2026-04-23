from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from backend.models.enums import TipoAltaEnum

class InternamentoBase(BaseModel):
    CodEpUrgenc: int
    IdFunc: int
    DataHoraConsulta: Optional[datetime] = None
    DataHoraAlta: Optional[datetime] = None
    MotivoInt: str
    NumeroCama: Optional[str] = Field(None, max_length=10)
    Servico: Optional[str] = Field(None, max_length=100)
    TipoAlta: Optional[TipoAltaEnum] = None

class InternamentoCreate(InternamentoBase):
    pass

class InternamentoResponse(InternamentoBase):
    CodInternamento: int
    DataHoraInt: datetime