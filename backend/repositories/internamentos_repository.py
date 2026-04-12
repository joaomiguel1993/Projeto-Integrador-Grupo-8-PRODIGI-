from ..dao.internamento_dao import get_internados_todos, get_internados_hospital, get_internamento, insert_internamento

def listar_internados():
    return get_internados_todos()

def listar_internados_hospital(nomehosp: str):
    return get_internados_hospital(nomehosp)

def obter_internamento(numutent: int, data_internamento: str):
    return get_internamento(numutent, data_internamento)

def criar_internamento(numutent: int, nomehosp: str, data_internamento: str):
    return insert_internamento(numutent, nomehosp, data_internamento)