from fastapi import HTTPException
from backend.repositories import reavaliacao_triagem_repository


def listar_reavaliacoes():
    return reavaliacao_triagem_repository.get_all()


def obter_reavaliacao(id_reavaliacao: int):
    item = reavaliacao_triagem_repository.get_by_id(id_reavaliacao)
    if not item:
        raise HTTPException(status_code=404, detail="Reavaliação de triagem não encontrada.")
    return item


def listar_por_ep(cod_ep_urgenc: int):
    return reavaliacao_triagem_repository.get_by_ep(cod_ep_urgenc)


def listar_por_funcionario(id_func: int):
    return reavaliacao_triagem_repository.get_by_funcionario(id_func)


def criar_reavaliacao(data: dict):
    try:
        return reavaliacao_triagem_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar reavaliação de triagem: {str(e)}")


def atualizar_reavaliacao(id_reavaliacao: int, data: dict):
    result = reavaliacao_triagem_repository.update(id_reavaliacao, data)
    if not result:
        raise HTTPException(status_code=404, detail="Reavaliação de triagem não encontrada para atualização.")
    return result


def remover_reavaliacao(id_reavaliacao: int):
    result = reavaliacao_triagem_repository.delete(id_reavaliacao)
    if not result:
        raise HTTPException(status_code=404, detail="Reavaliação de triagem não encontrada para remoção.")
    return {"detail": "Reavaliação de triagem removida com sucesso."}