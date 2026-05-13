from fastapi import HTTPException
from backend.repositories import predicao_ia_repository


def listar_predicoes():
    return predicao_ia_repository.listar_predicoes()


def obter_predicao(id_predicao: int):
    predicao = predicao_ia_repository.obter_predicao_por_id(id_predicao)
    if predicao is None:
        raise HTTPException(status_code=404, detail="Predição IA não encontrada.")
    return predicao


def obter_predicoes_por_entidade(entidade: str, entidade_id: int):
    return predicao_ia_repository.obter_predicoes_por_entidade(entidade, entidade_id)


def criar_predicao(data: dict):
    try:
        resultado = predicao_ia_repository.criar_predicao(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível registar a predição IA.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao registar predição IA: {str(e)}")