from fastapi import APIRouter
from backend.services import ai_medicacao_service, ai_triagem_service, ai_espera_service, predicao_ia_service

router = APIRouter(prefix="/ia", tags=["IA"])


@router.post("/prescricoes/{id_prescricao}/avaliar-risco")
def avaliar_risco_prescricao(id_prescricao: int, id_func_responsavel: int | None = None):
    return ai_medicacao_service.avaliar_risco_prescricao(
        id_prescricao=id_prescricao,
        id_func_responsavel=id_func_responsavel
    )


@router.post("/triagem/{cod_ep_urgenc}/prever")
def prever_triagem(cod_ep_urgenc: int):
    return ai_triagem_service.prever_triagem(cod_ep_urgenc)


@router.post("/espera/{cod_ep_urgenc}/prever")
def prever_tempo_espera(cod_ep_urgenc: int):
    return ai_espera_service.prever_tempo_espera(cod_ep_urgenc)


@router.get("/predicoes")
def listar_predicoes():
    return predicao_ia_service.listar_predicoes()


@router.get("/predicoes/{id_predicao}")
def obter_predicao(id_predicao: int):
    return predicao_ia_service.obter_predicao(id_predicao)


@router.get("/predicoes/{entidade}/{entidade_id}/historico")
def obter_historico_predicoes(entidade: str, entidade_id: int):
    return predicao_ia_service.obter_predicoes_por_entidade(entidade, entidade_id)