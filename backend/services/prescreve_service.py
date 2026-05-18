from fastapi import HTTPException
from backend.repositories import prescreve_repository


def listar_prescricoes():
    return prescreve_repository.get_all()


def obter_prescricao(id_prescricao: int):
    item = prescreve_repository.get_by_id(id_prescricao)
    if not item:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
    return item


def listar_por_ato(id_ato: int):
    return prescreve_repository.get_by_ato(id_ato)


def listar_por_medicamento(cod_medicamento: int):
    return prescreve_repository.get_by_medicamento(cod_medicamento)


def listar_por_estado(estado_prescricao: str):
    return prescreve_repository.get_by_estado(estado_prescricao)


def criar_prescricao(data: dict):
    try:
        return prescreve_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar prescrição: {str(e)}")


def atualizar_prescricao(id_prescricao: int, data: dict):
    result = prescreve_repository.update(id_prescricao, data)
    if not result:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada para atualização.")
    return result


def remover_prescricao(id_prescricao: int):
    result = prescreve_repository.delete(id_prescricao)
    if not result:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada para remoção.")
    return {"detail": "Prescrição removida com sucesso."}