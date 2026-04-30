from backend.repositories.medicacaoativa_repository import (
    listar_medicacaoativa,
    listar_medicacaoativa_por_utente,
    criar_medicacaoativa,
    atualizar_medicacaoativa,
    remover_medicacaoativa
)

def get_medicacaoativa_service():
    return listar_medicacaoativa()

def get_medicacaoativa_por_utente_service(numutent: int):
    return listar_medicacaoativa_por_utente(numutent)

def criar_medicacaoativa_service(data):
    return criar_medicacaoativa(
        numutent=data.numutent,
        codmedicamento=data.codmedicamento,
        datainicio=data.datainicio,
        datafim=data.datafim,
        dosagem=data.dosagem
    )

def atualizar_medicacaoativa_service(codmedicacaoativa: int, data):
    return atualizar_medicacaoativa(
        codmedicacaoativa=codmedicacaoativa,
        datafim=data.datafim,
        dosagem=data.dosagem
    )

def remover_medicacaoativa_service(codmedicacaoativa: int):
    return remover_medicacaoativa(codmedicacaoativa)