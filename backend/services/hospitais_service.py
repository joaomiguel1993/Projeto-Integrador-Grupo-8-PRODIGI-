from fastapi import HTTPException
from backend.repositories import hospitais_repository


def listar_hospitais():
    return hospitais_repository.get_all()


def obter_hospital(id_hosp: int):
    hospital = hospitais_repository.get_by_id(id_hosp)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")
    return hospital


def criar_hospital(data: dict):
    try:
        return hospitais_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar hospital: {str(e)}")


def atualizar_hospital(id_hosp: int, data: dict):
    hospital = hospitais_repository.update(id_hosp, data)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital não encontrado para atualização.")
    return hospital


def remover_hospital(id_hosp: int):
    result = hospitais_repository.delete(id_hosp)
    if not result:
        raise HTTPException(status_code=404, detail="Hospital não encontrado para remoção.")
    return {"detail": "Hospital removido com sucesso."}