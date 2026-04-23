from fastapi import APIRouter, HTTPException
from backend.repositories.triagens_repository import listar_triagens, obter_triagem

router = APIRouter(
    prefix="/triagem",
    tags=["Triagem"],
    responses={404: {"description": "Triagem não encontrada"}}
)

@router.get("/")
def get_triagens():
    return listar_triagens()

@router.get("/{cod_ep}")
def get_triagem(cod_ep: int):
    resultado = obter_triagem(cod_ep)
    if not resultado:
        raise HTTPException(status_code=404, detail="Triagem não encontrada")
    return resultado