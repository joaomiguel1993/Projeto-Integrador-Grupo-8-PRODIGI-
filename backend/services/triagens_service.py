from fastapi import HTTPException
from backend.repositories import triagens_repository


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