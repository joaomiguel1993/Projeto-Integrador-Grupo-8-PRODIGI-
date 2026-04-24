from fastapi import APIRouter, HTTPException
from backend.schemas.internamento import InternamentoResponse
from backend.services.internamentos_service import get_internamentos_service, get_internamento_service

router = APIRouter(prefix="/internamentos", tags=["Internamentos"])

@router.get("/", response_model=list[InternamentoResponse])
def get_internamentos():
    return get_internamentos_service()

@router.get("/{cod_internamento}", response_model=InternamentoResponse)
def get_internamento(cod_internamento: int):
    resultado = get_internamento_service(cod_internamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado