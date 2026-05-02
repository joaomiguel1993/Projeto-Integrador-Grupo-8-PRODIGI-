from fastapi import HTTPException

from backend.repositories.prescricoes_repository import (
    listar_prescricoes,
    obter_prescricao,
    criar_prescricao,
    atualizar_prescricao
)


def get_prescricoes_service():
    return listar_prescricoes()


def get_prescricao_service(id_prescricao: int):
    return obter_prescricao(id_prescricao)


def create_prescricao_service(id_ato: int, descricao: str):
    if id_ato <= 0:
        raise HTTPException(status_code=400, detail="ID do ato inválido.")

    if not descricao or not descricao.strip():
        raise HTTPException(status_code=400, detail="Descrição é obrigatória.")

    criada = criar_prescricao(
        id_ato=id_ato,
        descricao=descricao.strip()
    )

    if not criada:
        raise HTTPException(status_code=500, detail="Erro ao criar prescrição.")

    return criada


def update_prescricao_service(id_prescricao: int, id_ato: int, descricao: str):
    existente = obter_prescricao(id_prescricao)
    if not existente:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada.")

    if id_ato <= 0:
        raise HTTPException(status_code=400, detail="ID do ato inválido.")

    if not descricao or not descricao.strip():
        raise HTTPException(status_code=400, detail="Descrição é obrigatória.")

    atualizada = atualizar_prescricao(
        id_prescricao=id_prescricao,
        id_ato=id_ato,
        descricao=descricao.strip()
    )

    if not atualizada:
        raise HTTPException(status_code=500, detail="Erro ao atualizar prescrição.")

    return atualizada