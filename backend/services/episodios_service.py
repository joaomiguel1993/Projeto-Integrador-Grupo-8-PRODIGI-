from fastapi import HTTPException
from backend.repositories import episodios_repository


def listar_episodios():
    return episodios_repository.listar_episodios()


def obter_episodio(cod_ep_urgenc: int):
    episodio = episodios_repository.obter_episodio_por_id(cod_ep_urgenc)
    if episodio is None:
        raise HTTPException(status_code=404, detail="Episódio não encontrado.")
    return episodio


def listar_episodios_por_utente(num_utent: int):
    return episodios_repository.listar_episodios_por_utente(num_utent)


def listar_episodios_por_hospital(id_hosp: int):
    return episodios_repository.listar_episodios_por_hospital(id_hosp)


def criar_episodio(data: dict):
    try:
        resultado = episodios_repository.criar_episodio(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o episódio.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar episódio: {str(e)}")


def atualizar_episodio(cod_ep_urgenc: int, data: dict):
    try:
        resultado = episodios_repository.atualizar_episodio(cod_ep_urgenc, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Episódio não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar episódio: {str(e)}")


def remover_episodio(cod_ep_urgenc: int):
    try:
        resultado = episodios_repository.remover_episodio(cod_ep_urgenc)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Episódio não encontrado.")
        return {"detail": "Episódio removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover episódio: {str(e)}")


def listar_episodios_sem_triagem(id_hosp: int = None):
    return episodios_repository.listar_episodios_sem_triagem(id_hosp)