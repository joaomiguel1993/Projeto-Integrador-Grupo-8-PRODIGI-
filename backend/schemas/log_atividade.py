from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class LogAtividadeBase(BaseModel):
    username: Optional[str] = Field(default=None, max_length=50)
    acao: Optional[str] = Field(default=None, max_length=100)
    detalhe: Optional[str] = None
    ip: Optional[str] = Field(default=None, max_length=45)
    criado_em: Optional[datetime] = None


class LogAtividadeCreate(LogAtividadeBase):
    pass


class LogAtividadeUpdate(BaseModel):
    username: Optional[str] = Field(default=None, max_length=50)
    acao: Optional[str] = Field(default=None, max_length=100)
    detalhe: Optional[str] = None
    ip: Optional[str] = Field(default=None, max_length=45)
    criado_em: Optional[datetime] = None


class LogAtividadeOut(LogAtividadeBase):
    id_log: int

    model_config = ConfigDict(from_attributes=True)