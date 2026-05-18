from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ...schemas.triage import TriageInput, TriagePrediction
from ...schemas.predicao import PredicaoCreate
from ...services.triage_service import prever_triagem
from ...services.predicao_service import create_predicao
from ..deps import get_db

router = APIRouter(prefix="/api/v1/ia/triagem", tags=["IA - Triagem"])

@router.post("/", response_model=TriagePrediction)
def ia_triagem(
    payload: TriageInput,
    entidade_id: int,          # cod_ep_urgenc vindo do backend principal
    db: Session = Depends(get_db),
):
    try:
        result = prever_triagem(payload)
    except Exception as e:
        # opcional: gravar predição falhada
        create_predicao(
            db,
            PredicaoCreate(
                tipo_modelo="triagem",
                entidade="triagem",
                entidade_id=entidade_id,
                input_json=payload.dict(),
                output_json={"erro": str(e)},
                score=0.0,
                modelo_versao="1.0.0",
                sucesso=False,
                erro_mensagem=str(e),
            ),
        )
        raise HTTPException(status_code=500, detail="Erro ao executar modelo de triagem")

    # gravar na tabela PredicaoIA
    create_predicao(
        db,
        PredicaoCreate(
            tipo_modelo="triagem",
            entidade="triagem",
            entidade_id=entidade_id,
            input_json=payload.dict(),
            output_json=result.dict(),
            score=result.score,
            modelo_versao=result.modelo_versao,
        ),
    )

    return result