from fastapi import HTTPException
from backend.repositories import predicao_ia_repository


def listar_predicoes():
    return predicao_ia_repository.get_all()


def obter_predicao(id_predicao: int):
    item = predicao_ia_repository.get_by_id(id_predicao)
    if not item:
        raise HTTPException(status_code=404, detail="Predição IA não encontrada.")
    return item


def listar_por_tipo_modelo(tipo_modelo: str):
    return predicao_ia_repository.get_by_tipo_modelo(tipo_modelo)


def listar_por_entidade(entidade: str):
    return predicao_ia_repository.get_by_entidade(entidade)


def listar_por_entidade_id(entidade: str, entidade_id: int):
    return predicao_ia_repository.get_by_entidade_id(entidade, entidade_id)


def listar_por_sucesso(sucesso: bool):
    return predicao_ia_repository.get_by_sucesso(sucesso)


def criar_predicao(data: dict):
    try:
        return predicao_ia_repository.create(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar predição IA: {str(e)}")


def atualizar_predicao(id_predicao: int, data: dict):
    result = predicao_ia_repository.update(id_predicao, data)
    if not result:
        raise HTTPException(status_code=404, detail="Predição IA não encontrada para atualização.")
    return result


def remover_predicao(id_predicao: int):
    result = predicao_ia_repository.delete(id_predicao)
    if not result:
        raise HTTPException(status_code=404, detail="Predição IA não encontrada para remoção.")
    return {"detail": "Predição IA removida com sucesso."}