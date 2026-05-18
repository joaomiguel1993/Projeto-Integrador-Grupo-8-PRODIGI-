from fastapi import HTTPException
from backend.repositories import realiza_repository


def listar_realizacoes():
    return realiza_repository.get_all()


def obter_realizacao(id_ato: int, id_func: int):
    item = realiza_repository.get_by_ids(id_ato, id_func)
    if not item:
        raise HTTPException(status_code=404, detail="Registo de realização não encontrado.")
    return item


def listar_por_ato(id_ato: int):
    return realiza_repository.get_by_ato(id_ato)


def listar_por_funcionario(id_func: int):
    return realiza_repository.get_by_func(id_func)


def criar_realizacao(data: dict):
    try:
        return realiza_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar registo de realização: {str(e)}")


def atualizar_realizacao(id_ato: int, id_func: int, data: dict):
    result = realiza_repository.update(id_ato, id_func, data)
    if not result:
        raise HTTPException(status_code=404, detail="Registo de realização não encontrado para atualização.")
    return result


def remover_realizacao(id_ato: int, id_func: int):
    result = realiza_repository.delete(id_ato, id_func)
    if not result:
        raise HTTPException(status_code=404, detail="Registo de realização não encontrado para remoção.")
    return {"detail": "Registo de realização removido com sucesso."}