from fastapi import APIRouter, HTTPException
from backend.repositories.internamentos_repository import listar_internamentos, obter_internamento

router = APIRouter(
    prefix="/internamentos",
    tags=["Internamentos"],
    responses={404: {"description": "Internamento não encontrado"}}
)

@router.get("/")
def get_internamentos():
    return listar_internamentos()

@router.get("/{cod_internamento}")
def get_internamento(cod_internamento: int):
    resultado = obter_internamento(cod_internamento)
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado