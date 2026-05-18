from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...schemas.medicine_risk import (
    MedicineRiskInput,
    MedicineRiskPrediction,
)
from ...schemas.predicao import PredicaoCreate
from ...services.medicine_risk_service import prever_risco_medicamentoso
from ...db.repositories import create_predicao
from ..deps import get_db
from ...core.config import settings

router = APIRouter(
    prefix="/api/v1/ia/medicine-risk",
    tags=["IA - Risco Medicamentoso"],
)


@router.post("/", response_model=MedicineRiskPrediction)
def ia_risco_medicamentoso(
    payload: MedicineRiskInput,
    entidade_id: int,  # por ex: IdPrescricao
    db: Session = Depends(get_db),
):
    try:
        result = prever_risco_medicamentoso(payload)
    except Exception as e:
        create_predicao(
            db,
            PredicaoCreate(
                tipo_modelo="risco_medicamentoso",
                entidade="prescricao",
                entidade_id=entidade_id,
                input_json=payload.dict(),
                output_json={"erro": str(e)},
                score=0.0,
                modelo_versao=settings.MEDICINE_RISK_MODEL_VERSION,
                sucesso=False,
                erro_mensagem=str(e),
            ),
        )
        raise HTTPException(status_code=500, detail="Erro ao executar modelo de risco medicamentoso")

    create_predicao(
        db,
        PredicaoCreate(
            tipo_modelo="risco_medicamentoso",
            entidade="prescricao",
            entidade_id=entidade_id,
            input_json=payload.dict(),
            output_json=result.dict(),
            score=float(result.risco_score),
            modelo_versao=result.modelo_versao,
            sucesso=True,
            erro_mensagem=None,
        ),
    )

    return result