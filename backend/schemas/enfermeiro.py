from pydantic import BaseModel, ConfigDict


class EnfermeiroBase(BaseModel):
    id_func: int


class EnfermeiroCreate(EnfermeiroBase):
    pass


class EnfermeiroUpdate(BaseModel):
    pass


class EnfermeiroOut(EnfermeiroBase):
    model_config = ConfigDict(from_attributes=True)