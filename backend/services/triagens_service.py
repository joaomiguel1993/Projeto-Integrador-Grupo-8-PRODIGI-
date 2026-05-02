from fastapi import HTTPException
from backend.repositories.triagens_repository import (
    listar_triagens,
    obter_triagem,
    criar_triagem,
    atualizar_triagem
)


def get_triagens_service():
    return listar_triagens()


def get_triagem_service(cod_ep_urgenc: int):
    return obter_triagem(cod_ep_urgenc)


def criar_triagem_service(data):
    if not criar_triagem(data):
        raise HTTPException(status_code=500, detail="Erro ao criar triagem.")
    return {"message": "Triagem criada com sucesso."}


def update_triagem_service(cod_ep_urgenc: int, data):
    if not obter_triagem(cod_ep_urgenc):
        raise HTTPException(status_code=404, detail="Triagem não encontrada.")
    
    if not atualizar_triagem(cod_ep_urgenc, data):
        raise HTTPException(status_code=500, detail="Erro ao atualizar triagem.")
    
    return {"message": "Triagem atualizada com sucesso."}