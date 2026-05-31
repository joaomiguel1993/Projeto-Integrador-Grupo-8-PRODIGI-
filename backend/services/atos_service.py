from fastapi import HTTPException
from backend.repositories import atos_repository, episodios_repository


def listar_atos():
    return atos_repository.listar_atos()


def obter_ato(id_ato: int):
    ato = atos_repository.obter_ato_por_id(id_ato)
    if ato is None:
        raise HTTPException(status_code=404, detail="Ato não encontrado.")
    return ato


def listar_atos_por_episodio(cod_ep_urgenc: int):
    return atos_repository.listar_atos_por_episodio(cod_ep_urgenc)


def criar_ato(data: dict):
    try:
        cod_ep = data.get("cod_ep_urgenc")
        episodio = episodios_repository.obter_episodio_por_id(cod_ep)
        if episodio and episodio.get("estado") in ("terminado", "desistiu"):
            raise HTTPException(
                status_code=400,
                detail="Operação inválida: episódio encerrado."
            )

        resultado = atos_repository.criar_ato(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o ato.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar ato: {str(e)}")


def atualizar_ato(id_ato: int, data: dict):
    try:
        resultado = atos_repository.atualizar_ato(id_ato, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Ato não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar ato: {str(e)}")


def remover_ato(id_ato: int):
    try:
        resultado = atos_repository.remover_ato(id_ato)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Ato não encontrado.")
        return {"detail": "Ato removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover ato: {str(e)}")