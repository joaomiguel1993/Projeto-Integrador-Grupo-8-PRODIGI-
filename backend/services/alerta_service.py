from fastapi import HTTPException
from backend.repositories import alerta_repository


def listar_alertas():
    return alerta_repository.listar_alertas()


def obter_alerta(cod_alerta: int):
    alerta = alerta_repository.obter_alerta_por_id(cod_alerta)
    if alerta is None:
        raise HTTPException(status_code=404, detail="Alerta não encontrado.")
    return alerta


def obter_alertas_por_prescricao(id_prescricao: int):
    return alerta_repository.obter_alertas_por_prescricao(id_prescricao)


def criar_alerta(data: dict):
    try:
        resultado = alerta_repository.criar_alerta(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o alerta.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar alerta: {str(e)}")


def atualizar_alerta(cod_alerta: int, data: dict):
    try:
        resultado = alerta_repository.atualizar_alerta(cod_alerta, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Alerta não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar alerta: {str(e)}")


def marcar_alerta_resolvido(cod_alerta: int, resolvido_por: int):
    try:
        resultado = alerta_repository.marcar_alerta_resolvido(cod_alerta, resolvido_por)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Alerta não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao resolver alerta: {str(e)}")


def remover_alerta(cod_alerta: int):
    try:
        resultado = alerta_repository.remover_alerta(cod_alerta)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Alerta não encontrado.")
        return {"detail": "Alerta removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover alerta: {str(e)}")