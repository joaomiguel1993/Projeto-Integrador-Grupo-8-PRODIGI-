from pydantic import BaseModel
from datetime import date
from typing import Optional, List

class AlergiaBase(BaseModel):
    num_utent: int
    substancia: str
    classe_terapeutica_id: int
    nivel_gravidade: Optional[str] = None

class AlergiaCreate(AlergiaBase):
    pass

class AlergiaUpdate(BaseModel):
    substancia: Optional[str] = None
    classe_terapeutica_id: Optional[int] = None
    nivel_gravidade: Optional[str] = None

class AlergiaOut(AlergiaBase):
    cod_alergia: int
    data_registo: date

    class Config:
        from_attributes = True

class AlergiaEstatisticasOut(BaseModel):
    classe_terapeutica_id: int
    nivel_gravidade: Optional[str]
    total: int
    utentes_afetados: int