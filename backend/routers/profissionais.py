from fastapi import APIRouter, HTTPException
from backend.repositories.profissionais_repository import (
    listar_profissionais,
    obter_profissional,
    listar_medicos,
    listar_enfermeiros,
    obter_utilizador_profissional
)

router = APIRouter(
    prefix="/profissionais",
    tags=["Profissionais"],
    responses={404: {"description": "Profissional não encontrado"}}
)

@router.get("/")
def get_profissionais():
    return listar_profissionais()

@router.get("/medicos")
def get_medicos():
    return listar_medicos()

@router.get("/enfermeiros")
def get_enfermeiros():
    return listar_enfermeiros()

@router.get("/{id_func}")
def get_profissional(id_func: int):
    resultado = obter_profissional(id_func)
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    return resultado

@router.get("/{id_func}/utilizador")
def get_utilizador_profissional_endpoint(id_func: int):
    return obter_utilizador_profissional(id_func)