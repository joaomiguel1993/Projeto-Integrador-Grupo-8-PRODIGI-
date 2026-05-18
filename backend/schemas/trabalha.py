from typing import Optional
from pydantic import BaseModel, ConfigDict


class TrabalhaBase(BaseModel):
    id_func: int
    id_hosp: int
    ativo: Optional[bool] = True


class TrabalhaCreate(TrabalhaBase):
    pass


class TrabalhaUpdate(BaseModel):
    ativo: Optional[bool] = None


class TrabalhaOut(TrabalhaBase):
    model_config = ConfigDict(from_attributes=True)