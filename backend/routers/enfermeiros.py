from typing import List
from fastapi import APIRouter
from backend.schemas.enfermeiro import EnfermeiroCreate, EnfermeiroOut
from backend.services import enfermeiros_service

router = APIRouter(prefix="/api/v1/enfermeiros", tags=["Enfermeiros"])


@router.get("/", response_model=List[EnfermeiroOut])
def listar():
    return enfermeiros_service.listar_enfermeiros()


@router.get("/{id_func}", response_model=EnfermeiroOut)
def obter(id_func: int):
    return enfermeiros_service.obter_enfermeiro(id_func)


@router.post("/", response_model=EnfermeiroOut, status_code=201)
def criar(data: EnfermeiroCreate):
    return enfermeiros_service.criar_enfermeiro(data.model_dump())


@router.delete("/{id_func}")
def remover(id_func: int):
    return enfermeiros_service.remover_enfermeiro(id_func)