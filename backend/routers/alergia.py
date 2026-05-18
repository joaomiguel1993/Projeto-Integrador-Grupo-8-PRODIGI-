from typing import List
from fastapi import APIRouter
from backend.schemas.alergia import AlergiaCreate, AlergiaUpdate, AlergiaOut
from backend.services import alergia_service

router = APIRouter(prefix="/api/v1/alergia", tags=["Alergia"])


@router.get("/", response_model=List[AlergiaOut])
def listar():
    return alergia_service.listar_alergias()


@router.get("/utente/{nif}", response_model=List[AlergiaOut])
def listar_nif(nif: str):
    return alergia_service.listar_por_nif(nif)


@router.get("/classe/{classe_terapeutica}", response_model=List[AlergiaOut])
def listar_classe(classe_terapeutica: str):
    return alergia_service.listar_por_classe(classe_terapeutica)


@router.get("/{cod_alergia}", response_model=AlergiaOut)
def obter(cod_alergia: int):
    return alergia_service.obter_alergia(cod_alergia)


@router.post("/", response_model=AlergiaOut, status_code=201)
def criar(data: AlergiaCreate):
    return alergia_service.criar_alergia(data.model_dump())


@router.put("/{cod_alergia}", response_model=AlergiaOut)
def atualizar(cod_alergia: int, data: AlergiaUpdate):
    return alergia_service.atualizar_alergia(
        cod_alergia,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_alergia}")
def remover(cod_alergia: int):
    return alergia_service.remover_alergia(cod_alergia)