from fastapi import HTTPException
from backend.repositories import estatisticas_ia_repository


def listar_estatisticas():
    return estatisticas_ia_repository.get_all()


def obter_estatisticas_hospital(id_hosp: int):
    item = estatisticas_ia_repository.get_by_hospital(id_hosp)
    if not item:
        raise HTTPException(status_code=404, detail="Estatísticas IA do hospital não encontradas.")
    return item