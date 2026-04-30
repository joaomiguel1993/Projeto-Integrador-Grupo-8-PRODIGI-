from backend.repositories.utenteantecedente_repository import (
    listar_antecedentes_do_utente,
    adicionar_antecedente,
    remover_antecedente
)

def get_antecedentes_utente_service(numutent: int):
    return listar_antecedentes_do_utente(numutent)

def adicionar_antecedente_service(numutent: int, codantecedente: int):
    return adicionar_antecedente(numutent, codantecedente)

def remover_antecedente_service(numutent: int, codantecedente: int):
    return remover_antecedente(numutent, codantecedente)