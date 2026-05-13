from pydantic import BaseModel
from typing import Optional


class UtilizadorBase(BaseModel):
    id_func: int
    username: str
    password: str
    bloqueado: bool = False
    role: str = ""


class UtilizadorCreate(UtilizadorBase):
    pass


class UtilizadorUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    bloqueado: Optional[bool] = None
    role: Optional[str] = None


class UtilizadorOut(BaseModel):
    id_func: int
    username: str
    password: str
    bloqueado: bool
    role: str