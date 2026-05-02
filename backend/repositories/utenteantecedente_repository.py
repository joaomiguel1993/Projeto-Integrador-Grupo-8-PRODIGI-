from backend.dao.utenteantecedente_dao import (
    select_antecedentes_by_utente,
    insert_utenteantecedente,
    delete_utenteantecedente
)


def listar_antecedentes_do_utente(numutent: int):
    result = select_antecedentes_by_utente(numutent)
    return result if isinstance(result, list) else []


def adicionar_antecedente(numutent: int, codantecedente: int):
    result = insert_utenteantecedente(numutent, codantecedente)
    if isinstance(result, list) and result:
        return result[0]
    return None


def remover_antecedente(numutent: int, codantecedente: int):
    result = delete_utenteantecedente(numutent, codantecedente)
    if isinstance(result, list) and result:
        return result[0]
    return None