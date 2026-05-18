from fastapi import HTTPException
from backend.repositories import funcionarios_repository


def listar_funcionarios():
    return funcionarios_repository.get_all()


def obter_funcionario(id_func: int):
    funcionario = funcionarios_repository.get_by_id(id_func)
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")
    return funcionario


def criar_funcionario(data: dict):
    try:
        return funcionarios_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar funcionário: {str(e)}")


def atualizar_funcionario(id_func: int, data: dict):
    result = funcionarios_repository.update(id_func, data)
    if not result:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado para atualização.")
    return result


def remover_funcionario(id_func: int):
    result = funcionarios_repository.delete(id_func)
    if not result:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado para remoção.")
    return {"detail": "Funcionário removido com sucesso."}