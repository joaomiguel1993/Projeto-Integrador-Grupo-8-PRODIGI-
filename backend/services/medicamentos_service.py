from fastapi import HTTPException
from backend.repositories import medicamentos_repository


def listar_medicamentos():
    return medicamentos_repository.listar_medicamentos()


def obter_medicamento(cod_medicamento: int):
    medicamento = medicamentos_repository.obter_medicamento_por_id(cod_medicamento)
    if medicamento is None:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado.")
    return medicamento


def criar_medicamento(data: dict):
    try:
        resultado = medicamentos_repository.criar_medicamento(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o medicamento.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar medicamento: {str(e)}")


def atualizar_medicamento(cod_medicamento: int, data: dict):
    try:
        resultado = medicamentos_repository.atualizar_medicamento(cod_medicamento, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Medicamento não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar medicamento: {str(e)}")


def remover_medicamento(cod_medicamento: int):
    try:
        resultado = medicamentos_repository.remover_medicamento(cod_medicamento)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Medicamento não encontrado.")
        return {"detail": "Medicamento removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover medicamento: {str(e)}")