from pydantic import BaseModel, ConfigDict

class AntecedenteResponse(BaseModel):
        model_config = ConfigDict(from_attributes=True)
        codantecedente: int
        nome: str
        tipo: str | None = None
    
