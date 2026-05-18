from fastapi import HTTPException
from backend.repositories import alerta_repository


def listar_alertas():
    return alerta_repository.get_all()


def obter_alerta(cod_alerta: int):
    item = alerta_repository.get_by_id(cod_alerta)
    if not item:
        raise HTTPException(status_code=404, detail="Alerta não encontrado.")
    return item


def listar_por_prescricao(id_prescricao: int):
    return alerta_repository.get_by_prescricao(id_prescricao)


def listar_por_funcionario(id_func: int):
    return alerta_repository.get_by_funcionario(id_func)


def listar_por_severidade(severidade: str):
    return alerta_repository.get_by_severidade(severidade)


def listar_por_resolvido(resolvido: bool):
    return alerta_repository.get_by_resolvido(resolvido)


def criar_alerta(data: dict):
    try:
        return alerta_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar alerta: {str(e)}")


def atualizar_alerta(cod_alerta: int, data: dict):
    result = alerta_repository.update(cod_alerta, data)
    if not result:
        raise HTTPException(status_code=404, detail="Alerta não encontrado para atualização.")
    return result


def remover_alerta(cod_alerta: int):
    result = alerta_repository.delete(cod_alerta)
    if not result:
        raise HTTPException(status_code=404, detail="Alerta não encontrado para remoção.")
    return {"detail": "Alerta removido com sucesso."}