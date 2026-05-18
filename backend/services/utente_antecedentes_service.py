from fastapi import HTTPException
from backend.repositories import utente_antecedentes_repository


def listar():
    return utente_antecedentes_repository.get_all()


def obter(nif: str, cod_antecedente: int):
    registo = utente_antecedentes_repository.get_by_ids(nif, cod_antecedente)
    if not registo:
        raise HTTPException(status_code=404, detail="Associação utente-antecedente não encontrada.")
    return registo


def listar_por_nif(nif: str):
    return utente_antecedentes_repository.get_by_nif(nif)


def listar_por_antecedente(cod_antecedente: int):
    return utente_antecedentes_repository.get_by_antecedente(cod_antecedente)


def criar(data: dict):
    try:
        return utente_antecedentes_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar associação: {str(e)}")


def atualizar(nif: str, cod_antecedente: int, data: dict):
    result = utente_antecedentes_repository.update(nif, cod_antecedente, data)
    if not result:
        raise HTTPException(status_code=404, detail="Associação utente-antecedente não encontrada para atualização.")
    return result


def remover(nif: str, cod_antecedente: int):
    result = utente_antecedentes_repository.delete(nif, cod_antecedente)
    if not result:
        raise HTTPException(status_code=404, detail="Associação utente-antecedente não encontrada para remoção.")
    return {"detail": "Associação removida com sucesso."}