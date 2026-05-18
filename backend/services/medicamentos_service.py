from fastapi import HTTPException
from backend.repositories import medicamentos_repository


def listar_medicamentos():
    return medicamentos_repository.get_all()


def obter_medicamento(cod_medicamento: int):
    medicamento = medicamentos_repository.get_by_id(cod_medicamento)
    if not medicamento:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado.")
    return medicamento


def listar_por_classe(classe_terapeutica: str):
    return medicamentos_repository.get_by_classe(classe_terapeutica)


def criar_medicamento(data: dict):
    try:
        return medicamentos_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar medicamento: {str(e)}")


def atualizar_medicamento(cod_medicamento: int, data: dict):
    result = medicamentos_repository.update(cod_medicamento, data)
    if not result:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado para atualização.")
    return result


def remover_medicamento(cod_medicamento: int):
    result = medicamentos_repository.delete(cod_medicamento)
    if not result:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado para remoção.")
    return {"detail": "Medicamento removido com sucesso."}