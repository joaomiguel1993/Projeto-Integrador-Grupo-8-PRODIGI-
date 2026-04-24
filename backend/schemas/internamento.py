from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class InternamentoBase(BaseModel):
    CodEpUrgenc: int
    IdFunc: Optional[int] = None
    DataHoraConsulta: Optional[datetime] = None
    DataHoraAlta: Optional[datetime] = None
    MotivoInt: str
    NumeroCama: Optional[str] = None
    Servico: Optional[str] = None
    TipoAlta: Optional[str] = None

class InternamentoCreate(BaseModel):
    CodEpUrgenc: int
    IdFunc: Optional[int] = None
    DataHoraInt: datetime
    MotivoInt: str
    NumeroCama: Optional[str] = None
    Servico: Optional[str] = None

class InternamentoResponse(InternamentoBase):
    CodInternamento: int
    DataHoraInt: datetime