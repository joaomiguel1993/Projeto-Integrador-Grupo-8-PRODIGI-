from fastapi import HTTPException
from backend.repositories import utilizadores_repository


def listar_utilizadores():
    return utilizadores_repository.listar_utilizadores()


def obter_utilizador(id_func: int):
    utilizador = utilizadores_repository.obter_utilizador_por_id_func(id_func)
    if utilizador is None:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def obter_utilizador_por_username(username: str):
    utilizador = utilizadores_repository.obter_utilizador_por_username(username)
    if utilizador is None:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
    return utilizador


def criar_utilizador(data: dict):
    try:
        resultado = utilizadores_repository.criar_utilizador(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o utilizador.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar utilizador: {str(e)}")


def atualizar_utilizador(id_func: int, data: dict):
    try:
        resultado = utilizadores_repository.atualizar_utilizador(id_func, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar utilizador: {str(e)}")


def remover_utilizador(id_func: int):
    try:
        resultado = utilizadores_repository.remover_utilizador(id_func)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utilizador não encontrado.")
        return {"detail": "Utilizador removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover utilizador: {str(e)}")