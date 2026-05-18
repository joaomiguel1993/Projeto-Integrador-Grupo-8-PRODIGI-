from fastapi import HTTPException
from backend.repositories import log_atividade_repository


def listar_logs():
    return log_atividade_repository.get_all()


def obter_log(id_log: int):
    item = log_atividade_repository.get_by_id(id_log)
    if not item:
        raise HTTPException(status_code=404, detail="Log de atividade não encontrado.")
    return item


def listar_por_username(username: str):
    return log_atividade_repository.get_by_username(username)


def listar_por_acao(acao: str):
    return log_atividade_repository.get_by_acao(acao)


def listar_por_ip(ip: str):
    return log_atividade_repository.get_by_ip(ip)


def criar_log(data: dict):
    try:
        return log_atividade_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar log de atividade: {str(e)}")


def atualizar_log(id_log: int, data: dict):
    result = log_atividade_repository.update(id_log, data)
    if not result:
        raise HTTPException(status_code=404, detail="Log de atividade não encontrado para atualização.")
    return result


def remover_log(id_log: int):
    result = log_atividade_repository.delete(id_log)
    if not result:
        raise HTTPException(status_code=404, detail="Log de atividade não encontrado para remoção.")
    return {"detail": "Log de atividade removido com sucesso."}