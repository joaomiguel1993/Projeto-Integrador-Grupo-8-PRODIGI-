from pydantic import BaseModel, ConfigDict


class RealizaBase(BaseModel):
    id_ato: int
    id_func: int


class RealizaCreate(RealizaBase):
    pass


class RealizaUpdate(BaseModel):
    id_ato: int | None = None
    id_func: int | None = None


class RealizaOut(RealizaBase):
    model_config = ConfigDict(from_attributes=True)