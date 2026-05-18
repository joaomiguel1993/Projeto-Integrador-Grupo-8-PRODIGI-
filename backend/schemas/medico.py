from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MedicoBase(BaseModel):
    id_func: int
    estagiario: bool = False
    especialidade: str = Field(min_length=1, max_length=100)


class MedicoCreate(MedicoBase):
    pass


class MedicoUpdate(BaseModel):
    estagiario: Optional[bool] = None
    especialidade: Optional[str] = Field(default=None, max_length=100)


class MedicoOut(MedicoBase):
    model_config = ConfigDict(from_attributes=True)