from fastapi import HTTPException
from backend.repositories import hospitais_repository


def listar_hospitais():
    return hospitais_repository.listar_hospitais()


def obter_hospital(id_hosp: int):
    hospital = hospitais_repository.obter_hospital_por_id(id_hosp)
    if hospital is None:
        raise HTTPException(status_code=404, detail="Hospital não encontrado.")
    return hospital


def criar_hospital(data: dict):
    try:
        resultado = hospitais_repository.criar_hospital(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o hospital.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar hospital: {str(e)}")


def atualizar_hospital(id_hosp: int, data: dict):
    try:
        resultado = hospitais_repository.atualizar_hospital(id_hosp, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Hospital não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar hospital: {str(e)}")


def remover_hospital(id_hosp: int):
    try:
        resultado = hospitais_repository.remover_hospital(id_hosp)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Hospital não encontrado.")
        return {"detail": "Hospital removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover hospital: {str(e)}")