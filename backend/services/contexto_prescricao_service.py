from fastapi import HTTPException
from backend.repositories import contexto_prescricao_repository


def listar_contextos_prescricao():
    return contexto_prescricao_repository.get_all()


def obter_por_prescricao(id_prescricao: int):
    items = contexto_prescricao_repository.get_by_id_prescricao(id_prescricao)
    if not items:
        raise HTTPException(status_code=404, detail="Contexto da prescrição não encontrado.")
    return items


def listar_por_ato(id_ato: int):
    return contexto_prescricao_repository.get_by_ato(id_ato)


def listar_por_ep(cod_ep_urgenc: int):
    return contexto_prescricao_repository.get_by_ep(cod_ep_urgenc)


def listar_por_nif(nif: str):
    return contexto_prescricao_repository.get_by_nif(nif)


def listar_por_medicamento(cod_medicamento: int):
    return contexto_prescricao_repository.get_by_medicamento(cod_medicamento)