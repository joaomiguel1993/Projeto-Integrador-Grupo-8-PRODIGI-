from fastapi import HTTPException
from backend.repositories import sinais_vitais_repository


def listar_sinais_vitais():
    return sinais_vitais_repository.get_all()


def obter_sinal_vital(id_sinal: int):
    item = sinais_vitais_repository.get_by_id(id_sinal)
    if not item:
        raise HTTPException(status_code=404, detail="Registo de sinais vitais não encontrado.")
    return item


def listar_por_ep(cod_ep_urgenc: int):
    return sinais_vitais_repository.get_by_ep(cod_ep_urgenc)


def listar_por_funcionario(id_func: int):
    return sinais_vitais_repository.get_by_funcionario(id_func)


def criar_sinal_vital(data: dict):
    try:
        return sinais_vitais_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar registo de sinais vitais: {str(e)}")


def atualizar_sinal_vital(id_sinal: int, data: dict):
    result = sinais_vitais_repository.update(id_sinal, data)
    if not result:
        raise HTTPException(status_code=404, detail="Registo de sinais vitais não encontrado para atualização.")
    return result


def remover_sinal_vital(id_sinal: int):
    result = sinais_vitais_repository.delete(id_sinal)
    if not result:
        raise HTTPException(status_code=404, detail="Registo de sinais vitais não encontrado para remoção.")
    return {"detail": "Registo de sinais vitais removido com sucesso."}