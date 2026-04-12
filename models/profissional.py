from pydantic import BaseModel
from typing import Optional

class ProfissionalResponse(BaseModel):
    numfunc: int
    sexo: str
    tipo_func: str
    estagiario: Optional[bool] = None