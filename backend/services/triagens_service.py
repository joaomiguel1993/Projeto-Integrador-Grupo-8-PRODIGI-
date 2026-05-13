from fastapi import HTTPException
from backend.services.ai_client import ai_client, DadosTriagem
from backend.repositories import triagens_repository


def listar_triagens():
    return triagens_repository.listar_triagens()


def obter_triagem(cod_ep_urgenc: int):
    triagem = triagens_repository.obter_triagem_por_episodio(cod_ep_urgenc)
    if triagem is None:
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")
    return triagem


def criar_triagem(data: dict):
    # Exemplo: assume que data já vem com:
    #  - idade, temperatura, freq_card, spo2, nivel_dor, consciencia, cod_ep_urgenc
    try:
        idade = data["idade"]
        temperatura = data["temperatura"]
        freq_card = data["freq_card"]
        spo2 = data["spo2"]
        nivel_dor = data["nivel_dor"]
        consciencia = data["consciencia"]
        cod_ep_urgenc = data["cod_ep_urgenc"]

        # Entrada para a IA
        dados_ia = DadosTriagem(
            Age=idade,
            Heart_Rate_BPM=freq_card,
            SpO2_Percent=spo2,
            Temperature_C=temperatura,
            Pain_Level=nivel_dor,
            Consciousness=consciencia,
        )

        # Chama o serviço IA e obtém a pulseira
        resultado_ia = ai_client.triage(dados_ia)

        # Adiciona a cor/pulseira ao payload
        data["cor_triagem"] = resultado_ia["pulseira"]

        # Envia para o repository
        resultado = triagens_repository.criar_triagem(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a triagem.")

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar triagem: {str(e)}")


def atualizar_triagem(cod_ep_urgenc: int, data: dict):
    try:
        resultado = triagens_repository.atualizar_triagem(cod_ep_urgenc, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Triagem não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar triagem: {str(e)}")


def remover_triagem(cod_ep_urgenc: int):
    try:
        resultado = triagens_repository.remover_triagem(cod_ep_urgenc)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Triagem não encontrada.")
        return {"detail": "Triagem removida com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover triagem: {str(e)}")