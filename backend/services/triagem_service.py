from fastapi import HTTPException
from backend.repositories import triagem_repository


def listar_triagens():
    return triagem_repository.get_all()


def obter_triagem(cod_ep_urgenc: int):
    item = triagem_repository.get_by_ep(cod_ep_urgenc)
    if not item:
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")
    return item


def listar_por_cor(cor_triagem: str):
    return triagem_repository.get_by_cor(cor_triagem)


def listar_por_funcionario(id_func: int):
    return triagem_repository.get_by_funcionario(id_func)


def criar_triagem(data: dict):
    try:
        return triagem_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar triagem: {str(e)}")


def atualizar_triagem(cod_ep_urgenc: int, data: dict):
    result = triagem_repository.update(cod_ep_urgenc, data)
    if not result:
        raise HTTPException(status_code=404, detail="Triagem não encontrada para atualização.")
    return result


def remover_triagem(cod_ep_urgenc: int):
    result = triagem_repository.delete(cod_ep_urgenc)
    if not result:
        raise HTTPException(status_code=404, detail="Triagem não encontrada para remoção.")
    return {"detail": "Triagem removida com sucesso."}