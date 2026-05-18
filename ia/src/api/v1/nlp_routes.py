from fastapi import APIRouter
from ...schemas.nlp import VoiceNlpInput, VoiceNlpOutput
from ...services.nlp_service import processar_voz

router = APIRouter(
    prefix="/api/v1/ia/voz-nlp",
    tags=["IA - Voz / NLP"],
)


@router.post("/", response_model=VoiceNlpOutput)
def ia_voz_nlp(payload: VoiceNlpInput):
    result = processar_voz(payload)
    return result