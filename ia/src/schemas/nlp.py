from pydantic import BaseModel
from typing import Optional


class VoiceNlpInput(BaseModel):
    audio_b64: str
    idioma: Optional[str] = "pt-PT"
    contexto: Optional[str] = None


class VoiceNlpOutput(BaseModel):
    texto: str
    resumo: Optional[str] = None
    intent: Optional[str] = None
    sucesso: bool = True
    erro_mensagem: Optional[str] = None