from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UtilizadorBase(BaseModel):
    id_func: int
    username: str = Field(min_length=1, max_length=50)
    bloqueado: bool = False
    role: str = Field(default="", max_length=50)


class UtilizadorCreate(UtilizadorBase):
    password: str = Field(min_length=6, max_length=255)


class UtilizadorUpdate(BaseModel):
    username: Optional[str] = Field(default=None, max_length=50)
    password: Optional[str] = Field(default=None, min_length=6, max_length=255)
    bloqueado: Optional[bool] = None
    role: Optional[str] = Field(default=None, max_length=50)


class UtilizadorOut(UtilizadorBase):
    model_config = ConfigDict(from_attributes=True)