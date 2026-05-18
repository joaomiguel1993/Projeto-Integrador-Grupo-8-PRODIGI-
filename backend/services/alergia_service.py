from fastapi import HTTPException
from backend.repositories import alergia_repository


def listar_alergias():
    return alergia_repository.get_all()


def obter_alergia(cod_alergia: int):
    item = alergia_repository.get_by_id(cod_alergia)
    if not item:
        raise HTTPException(status_code=404, detail="Alergia não encontrada.")
    return item


def listar_por_nif(nif: str):
    return alergia_repository.get_by_nif(nif)


def listar_por_classe(classe_terapeutica: str):
    return alergia_repository.get_by_classe(classe_terapeutica)


def criar_alergia(data: dict):
    try:
        return alergia_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar alergia: {str(e)}")


def atualizar_alergia(cod_alergia: int, data: dict):
    result = alergia_repository.update(cod_alergia, data)
    if not result:
        raise HTTPException(status_code=404, detail="Alergia não encontrada para atualização.")
    return result


def remover_alergia(cod_alergia: int):
    result = alergia_repository.delete(cod_alergia)
    if not result:
        raise HTTPException(status_code=404, detail="Alergia não encontrada para remoção.")
    return {"detail": "Alergia removida com sucesso."}