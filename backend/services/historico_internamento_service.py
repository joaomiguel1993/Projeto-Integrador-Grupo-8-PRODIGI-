from fastapi import HTTPException
from backend.repositories import historico_internamento_repository


def listar_historico():
    return historico_internamento_repository.get_all()


def obter_historico(id_historico: int):
    item = historico_internamento_repository.get_by_id(id_historico)
    if not item:
        raise HTTPException(status_code=404, detail="Histórico de internamento não encontrado.")
    return item


def listar_por_internamento(cod_internamento: int):
    return historico_internamento_repository.get_by_internamento(cod_internamento)


def listar_por_funcionario(id_func: int):
    return historico_internamento_repository.get_by_funcionario(id_func)


def listar_por_tipo_evento(tipo_evento: str):
    return historico_internamento_repository.get_by_tipo_evento(tipo_evento)


def criar_historico(data: dict):
    try:
        return historico_internamento_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar histórico de internamento: {str(e)}")


def atualizar_historico(id_historico: int, data: dict):
    result = historico_internamento_repository.update(id_historico, data)
    if not result:
        raise HTTPException(status_code=404, detail="Histórico de internamento não encontrado para atualização.")
    return result


def remover_historico(id_historico: int):
    result = historico_internamento_repository.delete(id_historico)
    if not result:
        raise HTTPException(status_code=404, detail="Histórico de internamento não encontrado para remoção.")
    return {"detail": "Histórico de internamento removido com sucesso."}