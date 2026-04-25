from pydantic import BaseModel, Field, ConfigDict


class UtilizadorBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str = Field(..., min_length=1, max_length=50)


class UtilizadorCreate(UtilizadorBase):
    idfunc: int
    password: str = Field(..., min_length=1, max_length=255)


class UtilizadorResponse(UtilizadorBase):
    idfunc: int
