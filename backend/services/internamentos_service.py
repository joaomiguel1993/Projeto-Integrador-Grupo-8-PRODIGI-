from fastapi import HTTPException
from backend.repositories import internamentos_repository, episodios_repository


def listar_internamentos():
    return internamentos_repository.listar_internamentos()


def obter_internamento(cod_internamento: int):
    internamento = internamentos_repository.obter_internamento_por_id(cod_internamento)
    if internamento is None:
        raise HTTPException(status_code=404, detail="Internamento não encontrado.")
    return internamento


def obter_internamento_por_episodio(cod_ep_urgenc: int):
    internamento = internamentos_repository.obter_internamento_por_episodio(cod_ep_urgenc)
    if internamento is None:
        raise HTTPException(status_code=404, detail="Internamento não encontrado para o episódio.")
    return internamento


def criar_internamento(data: dict):
    try:
        cod_ep_urgenc = data.get("cod_ep_urgenc")
        episodio = episodios_repository.obter_episodio_por_id(cod_ep_urgenc)

        if episodio is None:
            raise HTTPException(status_code=404, detail="Episódio não encontrado.")

        estado = episodio.get("estado")
        if estado not in {"aberto", "em_triagem", "em_atendimento"}:
            raise HTTPException(
                status_code=400,
                detail=f"Não é possível criar internamento para episódio com estado '{estado}'."
            )

        resultado = internamentos_repository.criar_internamento(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar o internamento.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar internamento: {str(e)}")


def atualizar_internamento(cod_internamento: int, data: dict):
    try:
        resultado = internamentos_repository.atualizar_internamento(cod_internamento, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Internamento não encontrado.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar internamento: {str(e)}")


def remover_internamento(cod_internamento: int):
    try:
        resultado = internamentos_repository.remover_internamento(cod_internamento)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Internamento não encontrado.")
        return {"detail": "Internamento removido com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover internamento: {str(e)}")


def listar_internamentos_por_hospital(idhosp: int):
    return internamentos_repository.listar_internamentos_por_hospital(idhosp)