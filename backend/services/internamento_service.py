from fastapi import HTTPException
from backend.repositories import internamento_repository


def listar_internamentos():
    return internamento_repository.get_all()


def obter_internamento(cod_internamento: int):
    item = internamento_repository.get_by_id(cod_internamento)
    if not item:
        raise HTTPException(status_code=404, detail="Internamento não encontrado.")
    return item


def obter_por_ep(cod_ep_urgenc: int):
    item = internamento_repository.get_by_ep(cod_ep_urgenc)
    if not item:
        raise HTTPException(status_code=404, detail="Internamento do episódio não encontrado.")
    return item


def listar_por_funcionario(id_func: int):
    return internamento_repository.get_by_funcionario(id_func)


def listar_por_estado(estado_atual: str):
    return internamento_repository.get_by_estado(estado_atual)


def criar_internamento(data: dict):
    try:
        return internamento_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar internamento: {str(e)}")


def atualizar_internamento(cod_internamento: int, data: dict):
    result = internamento_repository.update(cod_internamento, data)
    if not result:
        raise HTTPException(status_code=404, detail="Internamento não encontrado para atualização.")
    return result


def remover_internamento(cod_internamento: int):
    result = internamento_repository.delete(cod_internamento)
    if not result:
        raise HTTPException(status_code=404, detail="Internamento não encontrado para remoção.")
    return {"detail": "Internamento removido com sucesso."}