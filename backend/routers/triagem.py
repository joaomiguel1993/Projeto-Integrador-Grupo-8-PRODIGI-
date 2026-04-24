from fastapi import APIRouter, HTTPException
from backend.schemas.triagem import TriagemResponse
from backend.services.triagens_service import get_triagens_service, get_triagem_service

router = APIRouter(prefix="/triagens", tags=["Triagens"])

@router.get("/", response_model=list[TriagemResponse])
def get_triagens():
    return get_triagens_service()

@router.get("/{cod_ep_urgenc}", response_model=TriagemResponse)
def get_triagem(cod_ep_urgenc: int):
    resultado = get_triagem_service(cod_ep_urgenc)
    if not resultado:
        raise HTTPException(status_code=404, detail="Triagem não encontrada")
    return resultado