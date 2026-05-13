from fastapi import HTTPException
from backend.repositories import medicacaoativa_repository


def listar_medicacoes_ativas():
    return medicacaoativa_repository.listar_medicacoes_ativas()


def obter_medicacao_ativa(cod_medicacao_ativa: int):
    medicacao = medicacaoativa_repository.obter_medicacao_ativa_por_id(cod_medicacao_ativa)
    if medicacao is None:
        raise HTTPException(status_code=404, detail="Medicação ativa não encontrada.")
    return medicacao


def listar_medicacoes_ativas_por_utente(num_utent: int):
    return medicacaoativa_repository.listar_medicacoes_ativas_por_utente(num_utent)


def criar_medicacao_ativa(data: dict):
    try:
        resultado = medicacaoativa_repository.criar_medicacao_ativa(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a medicação ativa.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar medicação ativa: {str(e)}")


def atualizar_medicacao_ativa(cod_medicacao_ativa: int, data: dict):
    try:
        resultado = medicacaoativa_repository.atualizar_medicacao_ativa(cod_medicacao_ativa, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Medicação ativa não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar medicação ativa: {str(e)}")


def remover_medicacao_ativa(cod_medicacao_ativa: int):
    try:
        resultado = medicacaoativa_repository.remover_medicacao_ativa(cod_medicacao_ativa)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Medicação ativa não encontrada.")
        return {"detail": "Medicação ativa removida com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover medicação ativa: {str(e)}")