from ..schemas.nlp import VoiceNlpInput, VoiceNlpOutput


def processar_voz(data: VoiceNlpInput) -> VoiceNlpOutput:
    # TODO: aqui colocas a lógica real (STT + NLP).
    # Neste momento, devolvo só um stub para não rebentar o serviço.
    texto_falso = "[transcricao_de_exemplo]"
    resumo_falso = "[resumo_de_exemplo]"
    intent_falsa = "nota_clinica"

    return VoiceNlpOutput(
        texto=texto_falso,
        resumo=resumo_falso,
        intent=intent_falsa,
        sucesso=True,
        erro_mensagem=None,
    )