from fastapi import HTTPException
from backend.repositories import antecedentes_repository


def listar_antecedentes():
    return antecedentes_repository.listar_antecedentes()


def obter_antecedente(cod_antecedente: int):
    antecedente = antecedentes_repository.obter_antecedente_por_id(cod_antecedente)
    if antecedente is None:
        raise HTTPException(status_code=404, detail="Antecedente não encontrado.")
    return antecedente


def criar_antecedente(data: dict):
    try:
        resultado = antecedentes_repository.criar_antecedente(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o antecedente.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar antecedente: {str(e)}")


def atualizar_antecedente(cod_antecedente: int, data: dict):
    try:
        resultado = antecedentes_repository.atualizar_antecedente(cod_antecedente, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Antecedente não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar antecedente: {str(e)}")


def remover_antecedente(cod_antecedente: int):
    try:
        resultado = antecedentes_repository.remover_antecedente(cod_antecedente)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Antecedente não encontrado.")
        return {"detail": "Antecedente removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover antecedente: {str(e)}")