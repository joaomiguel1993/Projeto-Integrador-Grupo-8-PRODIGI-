from fastapi import APIRouter, HTTPException
from backend.schemas.utilizador import UtilizadorDetalheResponse
from backend.services.utilizadores_service import (
    get_utilizadores_service,
    get_utilizador_service
)
 
router = APIRouter(prefix="/utilizadores", tags=["Utilizadores"])
 
@router.get("/", response_model=list[UtilizadorDetalheResponse])
def get_utilizadores():
    return get_utilizadores_service()
 
@router.get("/{idfunc}", response_model=UtilizadorDetalheResponse)
def get_utilizador(idfunc: int):
    resultado = get_utilizador_service(idfunc)
    if not resultado:
        raise HTTPException(status_code=404, detail="Utilizador não encontrado")
    return resultado
 