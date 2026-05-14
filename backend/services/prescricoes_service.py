from datetime import datetime
from fastapi import HTTPException
from backend.repositories import prescricoes_repository
from backend.services import ai_prescricao_service


def listar_prescricoes():
    return prescricoes_repository.listar_prescricoes()


def obter_prescricao(id_prescricao: int):
    prescricao = prescricoes_repository.obter_prescricao_por_id(id_prescricao)
    if prescricao is None:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
    return prescricao


def obter_prescricoes_por_ato(id_ato: int):
    return prescricoes_repository.obter_prescricoes_por_ato(id_ato)


def criar_prescricao(data: dict):
    try:
        resultado = prescricoes_repository.criar_prescricao(data)
        if resultado is None:
            raise HTTPException(status_code=400, detail="Não foi possível criar a prescrição.")

        # Chamar IA para avaliar risco medicamentoso (não bloqueia se falhar)
        try:
            ai_prescricao_service.avaliar_risco_prescricao(resultado["id_prescricao"])
        except Exception as e:
            print(f"[IA] Aviso: avaliação de risco medicamentoso falhou — {e}")

        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar prescrição: {str(e)}")


def atualizar_prescricao(id_prescricao: int, data: dict):
    try:
        resultado = prescricoes_repository.atualizar_prescricao(id_prescricao, data)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar prescrição: {str(e)}")


def atualizar_estado_ia_prescricao(
    id_prescricao: int,
    estado_prescricao: str,
    score_risco_ia: float,
    validado_por_ia: bool = True,
    data_hora_validacao_ia=None,
):
    if data_hora_validacao_ia is None:
        data_hora_validacao_ia = datetime.now()

    try:
        resultado = prescricoes_repository.atualizar_estado_ia_prescricao(
            id_prescricao,
            estado_prescricao,
            score_risco_ia,
            validado_por_ia,
            data_hora_validacao_ia,
        )
        if resultado is None:
            raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
        return resultado
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar estado IA da prescrição: {str(e)}")


def remover_prescricao(id_prescricao: int):
    try:
        resultado = prescricoes_repository.remover_prescricao(id_prescricao)
        if resultado is None:
            raise HTTPException(status_code=404, detail="Prescrição não encontrada.")
        return {"detail": "Prescrição removida com sucesso."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao remover prescrição: {str(e)}")