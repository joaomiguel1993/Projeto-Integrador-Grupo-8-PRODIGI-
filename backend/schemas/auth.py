from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=6, max_length=255)


class UserAuthOut(BaseModel):
    id_func: int
    username: str
    bloqueado: bool = False
    role: str = ""
    nome: str | None = None
    tipofunc: str | None = None
    email: str | None = None
    telefone: str | None = None
    foto_url: str | None = None


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAuthOut