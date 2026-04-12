from ..dao.profissional_dao import get_profissionais, get_profissional

def listar_profissionais():
    return get_profissionais()

def obter_profissional(numfunc: int):
    return get_profissional(numfunc)