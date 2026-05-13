from pydantic import BaseModel
from typing import Optional


class TrabalhaBase(BaseModel):
    id_func: int
    id_hosp: int
    ativo: bool = True


class TrabalhaCreate(TrabalhaBase):
    pass


class TrabalhaUpdate(BaseModel):
    ativo: Optional[bool] = None


class TrabalhaOut(BaseModel):
    id_func: int
    id_hosp: int
    ativo: bool