from fastapi import APIRouter
from typing import List

from backend.schemas.utente import (
    UtenteCreate,
    UtenteUpdate,
    UtenteOut,
)
from backend.services import utentes_service

router = APIRouter(prefix="/v1/utentes", tags=["Utentes"])


@router.get("/", response_model=List[UtenteOut])
def listar_utentes():
    return utentes_service.listar_utentes()


@router.get("/nif/{nif}", response_model=UtenteOut)
def obter_utente_por_nif(nif: str):
    return utentes_service.obter_utente_por_nif(nif)


@router.get("/{num_utent}", response_model=UtenteOut)
def obter_utente(num_utent: int):
    return utentes_service.obter_utente(num_utent)


@router.post("/", response_model=UtenteOut, status_code=201)
def criar_utente(data: UtenteCreate):
    return utentes_service.criar_utente(data.model_dump())


@router.put("/{num_utent}", response_model=UtenteOut)
def atualizar_utente(num_utent: int, data: UtenteUpdate):
    return utentes_service.atualizar_utente(
        num_utent,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{num_utent}")
def remover_utente(num_utent: int):
    return utentes_service.remover_utente(num_utent)