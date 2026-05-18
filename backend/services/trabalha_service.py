from fastapi import HTTPException
from backend.repositories import trabalha_repository


def listar_trabalhos():
    return trabalha_repository.get_all()


def obter_trabalho(id_func: int, id_hosp: int):
    trabalho = trabalha_repository.get_by_ids(id_func, id_hosp)
    if not trabalho:
        raise HTTPException(status_code=404, detail="Relação de trabalho não encontrada.")
    return trabalho


def listar_por_funcionario(id_func: int):
    return trabalha_repository.get_by_funcionario(id_func)


def listar_por_hospital(id_hosp: int):
    return trabalha_repository.get_by_hospital(id_hosp)


def criar_trabalho(data: dict):
    try:
        return trabalha_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar relação de trabalho: {str(e)}")


def atualizar_trabalho(id_func: int, id_hosp: int, data: dict):
    result = trabalha_repository.update(id_func, id_hosp, data)
    if not result:
        raise HTTPException(status_code=404, detail="Relação de trabalho não encontrada para atualização.")
    return result


def remover_trabalho(id_func: int, id_hosp: int):
    result = trabalha_repository.delete(id_func, id_hosp)
    if not result:
        raise HTTPException(status_code=404, detail="Relação de trabalho não encontrada para remoção.")
    return {"detail": "Relação de trabalho removida com sucesso."}