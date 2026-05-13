from fastapi import HTTPException
from backend.repositories import utentes_repository


def listar_utentes():
    return utentes_repository.listar_utentes()


def obter_utente(num_utent: int):
    utente = utentes_repository.obter_utente_por_id(num_utent)
    if utente is None:
        raise HTTPException(status_code=404, detail="Utente não encontrado.")
    return utente


def obter_utente_por_nif(nif: str):
    utente = utentes_repository.obter_utente_por_nif(nif)
    if utente is None:
        raise HTTPException(status_code=404, detail="Utente não encontrado.")
    return utente


def criar_utente(data: dict):
    try:
        resultado = utentes_repository.criar_utente(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o utente.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar utente: {str(e)}")


def atualizar_utente(num_utent: int, data: dict):
    try:
        resultado = utentes_repository.atualizar_utente(num_utent, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utente não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar utente: {str(e)}")


def remover_utente(num_utent: int):
    try:
        resultado = utentes_repository.remover_utente(num_utent)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Utente não encontrado.")
        return {"detail": "Utente removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover utente: {str(e)}")