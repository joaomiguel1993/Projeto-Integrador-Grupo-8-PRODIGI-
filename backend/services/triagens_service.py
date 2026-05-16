from fastapi import HTTPException

from backend.repositories import triagens_repository
from backend.services import ai_espera_service
from backend.services import ai_triagem_service


def listar_triagens():
    return triagens_repository.listar_triagens()


def obter_triagem(cod_ep_urgenc: int):
    triagem = triagens_repository.obter_triagem_por_episodio(cod_ep_urgenc)
    if triagem is None:
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")
    return triagem


def criar_triagem(data: dict):
    try:
        resultado = triagens_repository.criar_triagem(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a triagem.")

        # Chamar IA para prever tempo de espera (não bloqueia se falhar)
        try:
            ai_espera_service.prever_tempo_espera(resultado["cod_ep_urgenc"])
            resultado = triagens_repository.obter_triagem_por_episodio(resultado["cod_ep_urgenc"]) or resultado
        except Exception as e:
            print(f"[IA] Aviso: predição de tempo de espera falhou — {e}")

        # Chamar IA para prever cor da pulseira e comparar com enfermeiro
        try:
            ai_triagem_service.prever_triagem(resultado["cod_ep_urgenc"])
        except Exception as e:
            print(f"[IA] Aviso: predição de triagem falhou — {e}")

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

def listar_triagens_por_hospital(idhosp: int):
    return triagens_repository.listar_triagens_por_hospital(idhosp)