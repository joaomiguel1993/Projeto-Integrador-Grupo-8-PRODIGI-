from ..dao.prescricao_dao import get_prescricoes, get_prescricoes_episodio, insert_prescricao

def listar_prescricoes():
    return get_prescricoes()

def listar_prescricoes_episodio(cod: int, nomehosp: str):
    return get_prescricoes_episodio(cod, nomehosp)

def criar_prescricao(cod: int, nomehosp: str, numfuncpresc: int, datahorapresc: str,
                     medicamento: str, dose: str, frequencia: str, duracao: str):
    return insert_prescricao(
        cod, nomehosp, numfuncpresc, datahorapresc,
        medicamento, dose, frequencia, duracao
    )