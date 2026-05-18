from fastapi import HTTPException
from backend.repositories import exame_repository


def listar_exames():
    return exame_repository.get_all()


def obter_exame(cod_exame: int):
    item = exame_repository.get_by_id(cod_exame)
    if not item:
        raise HTTPException(status_code=404, detail="Exame não encontrado.")
    return item


def listar_por_ep(cod_ep_urgenc: int):
    return exame_repository.get_by_ep(cod_ep_urgenc)


def listar_por_estado(estado: str):
    return exame_repository.get_by_estado(estado)


def listar_por_tipo(tipo: str):
    return exame_repository.get_by_tipo(tipo)


def listar_por_funcionario(id_func: int):
    return exame_repository.get_by_funcionario(id_func)


def criar_exame(data: dict):
    try:
        return exame_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar exame: {str(e)}")


def atualizar_exame(cod_exame: int, data: dict):
    result = exame_repository.update(cod_exame, data)
    if not result:
        raise HTTPException(status_code=404, detail="Exame não encontrado para atualização.")
    return result


def remover_exame(cod_exame: int):
    result = exame_repository.delete(cod_exame)
    if not result:
        raise HTTPException(status_code=404, detail="Exame não encontrado para remoção.")
    return {"detail": "Exame removido com sucesso."}