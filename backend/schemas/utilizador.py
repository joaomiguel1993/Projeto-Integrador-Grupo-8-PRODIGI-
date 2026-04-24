from pydantic import BaseModel, Field

class UtilizadorBase(BaseModel):
    UserName: str = Field(..., min_length=1, max_length=50)

class UtilizadorCreate(UtilizadorBase):
    IdFunc: int
    Password: str = Field(..., min_length=1, max_length=255)

class UtilizadorResponse(UtilizadorBase):
    IdFunc: int