from ..dao.triagem_dao import (
    get_triagens_todos,
    get_triagens_hospital,
    get_triagem,
    insert_triagem,
    insert_triagem_completa
)

def listar_triagens():
    return get_triagens_todos()

def listar_triagens_hospital(nomehosp: str):
    return get_triagens_hospital(nomehosp)

def obter_triagem(cod: int, nomehosp: str):
    return get_triagem(cod, nomehosp)

def criar_triagem_basica(cod: int, nomehosp: str, datahoratriagem: str, prioridade: str):
    return insert_triagem(cod, nomehosp, datahoratriagem, prioridade)

def criar_triagem_completa(cod: int, nomehosp: str, datahoratriagem: str, prioridade: str,
                           temperatura: float, pressaosistolica: int, pressaodiastolica: int,
                           observacoes: str, numfunctriagem: int):
    return insert_triagem_completa(
        cod,
        nomehosp,
        datahoratriagem,
        prioridade,
        temperatura,
        pressaosistolica,
        pressaodiastolica,
        observacoes,
        numfunctriagem
    )