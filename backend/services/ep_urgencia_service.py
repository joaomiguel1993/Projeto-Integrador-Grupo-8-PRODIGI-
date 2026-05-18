from fastapi import HTTPException
from backend.repositories import ep_urgencia_repository


def listar_episodios():
    return ep_urgencia_repository.get_all()


def obter_episodio(cod_ep_urgenc: int):
    item = ep_urgencia_repository.get_by_id(cod_ep_urgenc)
    if not item:
        raise HTTPException(status_code=404, detail="Episódio de urgência não encontrado.")
    return item


def listar_por_nif(nif: str):
    return ep_urgencia_repository.get_by_nif(nif)


def listar_por_hospital(id_hosp: int):
    return ep_urgencia_repository.get_by_hospital(id_hosp)


def listar_por_estado(estado: str):
    return ep_urgencia_repository.get_by_estado(estado)


def criar_episodio(data: dict):
    try:
        return ep_urgencia_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar episódio de urgência: {str(e)}")


def atualizar_episodio(cod_ep_urgenc: int, data: dict):
    result = ep_urgencia_repository.update(cod_ep_urgenc, data)
    if not result:
        raise HTTPException(status_code=404, detail="Episódio de urgência não encontrado para atualização.")
    return result


def remover_episodio(cod_ep_urgenc: int):
    result = ep_urgencia_repository.delete(cod_ep_urgenc)
    if not result:
        raise HTTPException(status_code=404, detail="Episódio de urgência não encontrado para remoção.")
    return {"detail": "Episódio de urgência removido com sucesso."}