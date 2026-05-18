from fastapi import HTTPException
from backend.repositories import enfermeiros_repository


def listar_enfermeiros():
    return enfermeiros_repository.get_all()


def obter_enfermeiro(id_func: int):
    enfermeiro = enfermeiros_repository.get_by_id(id_func)
    if not enfermeiro:
        raise HTTPException(status_code=404, detail="Enfermeiro não encontrado.")
    return enfermeiro


def criar_enfermeiro(data: dict):
    try:
        return enfermeiros_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar enfermeiro: {str(e)}")


def remover_enfermeiro(id_func: int):
    result = enfermeiros_repository.delete(id_func)
    if not result:
        raise HTTPException(status_code=404, detail="Enfermeiro não encontrado para remoção.")
    return {"detail": "Enfermeiro removido com sucesso."}