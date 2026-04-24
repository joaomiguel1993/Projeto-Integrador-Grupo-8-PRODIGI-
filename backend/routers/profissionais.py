from fastapi import APIRouter, HTTPException
from backend.schemas.profissional import ProfissionalResponse
from backend.services.profissionais_service import get_profissionais_service, get_profissional_service

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])

@router.get("/", response_model=list[ProfissionalResponse])
def get_profissionais():
    return get_profissionais_service()

@router.get("/{id_func}", response_model=ProfissionalResponse)
def get_profissional(id_func: int):
    resultado = get_profissional_service(id_func)
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    return resultado