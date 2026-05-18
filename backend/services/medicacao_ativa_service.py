from fastapi import HTTPException
from backend.repositories import medicacao_ativa_repository


def listar_medicacao_ativa():
    return medicacao_ativa_repository.get_all()


def obter_medicacao_ativa(cod_medicacao_ativa: int):
    item = medicacao_ativa_repository.get_by_id(cod_medicacao_ativa)
    if not item:
        raise HTTPException(status_code=404, detail="Medicação ativa não encontrada.")
    return item


def listar_por_nif(nif: str):
    return medicacao_ativa_repository.get_by_nif(nif)


def listar_por_medicamento(cod_medicamento: int):
    return medicacao_ativa_repository.get_by_medicamento(cod_medicamento)


def criar_medicacao_ativa(data: dict):
    try:
        return medicacao_ativa_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar medicação ativa: {str(e)}")


def atualizar_medicacao_ativa(cod_medicacao_ativa: int, data: dict):
    result = medicacao_ativa_repository.update(cod_medicacao_ativa, data)
    if not result:
        raise HTTPException(status_code=404, detail="Medicação ativa não encontrada para atualização.")
    return result


def remover_medicacao_ativa(cod_medicacao_ativa: int):
    result = medicacao_ativa_repository.delete(cod_medicacao_ativa)
    if not result:
        raise HTTPException(status_code=404, detail="Medicação ativa não encontrada para remoção.")
    return {"detail": "Medicação ativa removida com sucesso."}