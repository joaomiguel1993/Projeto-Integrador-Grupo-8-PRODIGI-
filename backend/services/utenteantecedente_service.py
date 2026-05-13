from fastapi import HTTPException
from backend.repositories import utenteantecedente_repository


def listar_utente_antecedentes():
    return utenteantecedente_repository.listar_utente_antecedentes()


def obter_utente_antecedente(num_utent: int, cod_antecedente: int):
    relacao = utenteantecedente_repository.obter_utente_antecedente(num_utent, cod_antecedente)
    if relacao is None:
        raise HTTPException(status_code=404, detail="Relação utente-antecedente não encontrada.")
    return relacao


def listar_antecedentes_por_utente(num_utent: int):
    return utenteantecedente_repository.listar_antecedentes_por_utente(num_utent)


def listar_utentes_por_antecedente(cod_antecedente: int):
    return utenteantecedente_repository.listar_utentes_por_antecedente(cod_antecedente)


def criar_utente_antecedente(data: dict):
    try:
        resultado = utenteantecedente_repository.criar_utente_antecedente(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a relação utente-antecedente.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar relação utente-antecedente: {str(e)}")


def atualizar_utente_antecedente(num_utent: int, cod_antecedente: int, data: dict):
    try:
        resultado = utenteantecedente_repository.atualizar_utente_antecedente(num_utent, cod_antecedente, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Relação utente-antecedente não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar relação utente-antecedente: {str(e)}")


def remover_utente_antecedente(num_utent: int, cod_antecedente: int):
    try:
        resultado = utenteantecedente_repository.remover_utente_antecedente(num_utent, cod_antecedente)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Relação utente-antecedente não encontrada.")
        return {"detail": "Relação utente-antecedente removida com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover relação utente-antecedente: {str(e)}")