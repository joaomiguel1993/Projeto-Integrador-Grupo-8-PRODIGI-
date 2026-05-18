from fastapi import HTTPException
from backend.repositories import antecedentes_repository


def listar_antecedentes():
    return antecedentes_repository.get_all()


def obter_antecedente(cod_antecedente: int):
    antecedente = antecedentes_repository.get_by_id(cod_antecedente)
    if not antecedente:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado.")
    return antecedente


def listar_por_tipo(tipo: str):
    return antecedentes_repository.get_by_tipo(tipo)


def criar_antecedente(data: dict):
    try:
        return antecedentes_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar antecedente: {str(e)}")


def atualizar_antecedente(cod_antecedente: int, data: dict):
    result = antecedentes_repository.update(cod_antecedente, data)
    if not result:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado para atualização.")
    return result


def remover_antecedente(cod_antecedente: int):
    result = antecedentes_repository.delete(cod_antecedente)
    if not result:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado para remoção.")
    return {"detail": "Antecedente removido com sucesso."}