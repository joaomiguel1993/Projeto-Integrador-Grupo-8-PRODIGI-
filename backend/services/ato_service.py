from fastapi import HTTPException
from backend.repositories import ato_repository


def listar_atos():
    return ato_repository.get_all()


def obter_ato(id_ato: int):
    item = ato_repository.get_by_id(id_ato)
    if not item:
        raise HTTPException(status_code=404, detail="Ato não encontrado.")
    return item


def listar_por_cod_ep_urgenc(cod_ep_urgenc: int):
    return ato_repository.get_by_cod_ep_urgenc(cod_ep_urgenc)


def criar_ato(data: dict):
    try:
        return ato_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar ato: {str(e)}")


def atualizar_ato(id_ato: int, data: dict):
    result = ato_repository.update(id_ato, data)
    if not result:
        raise HTTPException(status_code=404, detail="Ato não encontrado para atualização.")
    return result


def remover_ato(id_ato: int):
    result = ato_repository.delete(id_ato)
    if not result:
        raise HTTPException(status_code=404, detail="Ato não encontrado para remoção.")
    return {"detail": "Ato removido com sucesso."}