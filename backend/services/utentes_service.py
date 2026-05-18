from fastapi import HTTPException
from backend.repositories import utentes_repository


def listar_utentes():
    return utentes_repository.get_all()


def obter_utente(nif: str):
    utente = utentes_repository.get_by_nif(nif)
    if not utente:
        raise HTTPException(status_code=404, detail="Utente não encontrado.")
    return utente


def obter_utente_por_email(email: str):
    utente = utentes_repository.get_by_email(email)
    if not utente:
        raise HTTPException(status_code=404, detail="Utente não encontrado.")
    return utente


def criar_utente(data: dict):
    try:
        if utentes_repository.get_by_nif(data["nif"]):
            raise HTTPException(status_code=409, detail="NIF já existente.")
        return utentes_repository.create(data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar utente: {str(e)}")


def atualizar_utente(nif: str, data: dict):
    if not utentes_repository.get_by_nif(nif):
        raise HTTPException(status_code=404, detail="Utente não encontrado para atualização.")
    result = utentes_repository.update(nif, data)
    return result


def remover_utente(nif: str):
    result = utentes_repository.delete(nif)
    if not result:
        raise HTTPException(status_code=404, detail="Utente não encontrado para remoção.")
    return {"detail": "Utente removido com sucesso."}