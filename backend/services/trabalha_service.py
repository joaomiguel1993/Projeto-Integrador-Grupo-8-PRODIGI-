from backend.repositories.trabalha_repository import (
    listar_funcionarios_do_hospital,
    listar_hospitais_do_funcionario,
    criar_trabalha,
    atualizar_trabalha_ativo,
    remover_trabalha
)

def get_funcionarios_hospital_service(idhosp: int):
    return listar_funcionarios_do_hospital(idhosp)

def get_hospitais_funcionario_service(idfunc: int):
    return listar_hospitais_do_funcionario(idfunc)

def criar_trabalha_service(idfunc: int, idhosp: int):
    return criar_trabalha(idfunc, idhosp)

def atualizar_trabalha_service(idfunc: int, idhosp: int, ativo: bool):
    return atualizar_trabalha_ativo(idfunc, idhosp, ativo)

def remover_trabalha_service(idfunc: int, idhosp: int):
    return remover_trabalha(idfunc, idhosp)