from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class PrescricaoBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idato: int
    codmedicamento: int  # Adicionado: essencial para o banco
    dosagem: str        # Adicionado: obrigatório no SQL
    observacoes: Optional[str] = None # Ajustado: reflete o 'Observacoes' do SQL


class PrescricaoCreate(PrescricaoBase):
    # Pode incluir datahorapresc como opcional se quiser retroagir a data
    pass


class PrescricaoUpdate(BaseModel):
    # Geralmente prescrições não são editadas (por questões legais), 
    # mas se forem, apenas observações ou dosagem fariam sentido.
    dosagem: Optional[str] = None
    observacoes: Optional[str] = None


class PrescricaoResponse(PrescricaoBase):
    idprescricao: int
    datahorapresc: datetime