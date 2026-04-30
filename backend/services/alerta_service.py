from backend.repositories.alerta_repository import (
    listar_alertas,
    obter_alerta,
    listar_alertas_por_prescricao,
    criar_alerta,
    atualizar_alerta_ignorado
)

def get_alertas_service():
    return listar_alertas()

def get_alerta_service(codalerta: int):
    return obter_alerta(codalerta)

def get_alertas_por_prescricao_service(idprescricao: int):
    return listar_alertas_por_prescricao(idprescricao)

def criar_alerta_service(idprescricao: int, idfunc, tipo: str):
    return criar_alerta(idprescricao, idfunc, tipo)

def atualizar_alerta_service(codalerta: int, ignorado: bool, justificacao):
    return atualizar_alerta_ignorado(codalerta, ignorado, justificacao)