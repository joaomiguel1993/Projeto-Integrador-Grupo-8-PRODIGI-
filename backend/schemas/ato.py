from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class AtoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    codepurgenc: int
    tipo: str
    descricao: Optional[str] = None
    datahorafim: Optional[datetime] = None

class AtoCreate(BaseModel):
    codepurgenc: int
    tipo: str
    descricao: Optional[str] = None
    datahorainicio: Optional[datetime] = None

class AtoUpdate(BaseModel):
    tipo: str
    descricao: Optional[str] = None
    datahorafim: Optional[datetime] = None

class AtoResponse(AtoBase):
    idato: int
    datahorainicio: datetime

class FuncionarioAtoResponse(BaseModel):
    idfunc: int; nome: str; tipofunc: str

class PrescricaoAtoResponse(BaseModel):
    idprescricao: int; idato: int; dosagem: str; observacoes: Optional[str] = None; datahorapresc: datetime