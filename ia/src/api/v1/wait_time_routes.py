from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...schemas.wait_time import WaitTimeInput, WaitTimePrediction
from ...schemas.predicao import PredicaoCreate
from ...services.wait_time_service import prever_tempo_espera
from ...db.repositories import create_predicao
from ..deps import get_db
from ...core.config import settings

router = APIRouter(
    prefix="/api/v1/ia/wait-time",
    tags=["IA - Tempo de Espera"],
)


@router.post("/", response_model=WaitTimePrediction)
def ia_tempo_espera(
    payload: WaitTimeInput,
    entidade_id: int,  # por ex: CodEpUrgenc
    db: Session = Depends(get_db),
):
    try:
        result = prever_tempo_espera(payload)
    except Exception as e:
        create_predicao(
            db,
            PredicaoCreate(
                tipo_modelo="tempo_espera",
                entidade="tempo_espera",
                entidade_id=entidade_id,
                input_json=payload.dict(),
                output_json={"erro": str(e)},
                score=0.0,
                modelo_versao=settings.WAIT_TIME_MODEL_VERSION,
                sucesso=False,
                erro_mensagem=str(e),
            ),
        )
        raise HTTPException(status_code=500, detail="Erro ao executar modelo de tempo de espera")

    create_predicao(
        db,
        PredicaoCreate(
            tipo_modelo="tempo_espera",
            entidade="tempo_espera",
            entidade_id=entidade_id,
            input_json=payload.dict(),
            output_json=result.dict(),
            score=float(result.tempo_espera_previsto_min),
            modelo_versao=result.modelo_versao,
            sucesso=True,
            erro_mensagem=None,
        ),
    )

    return result