from typing import List
from fastapi import APIRouter
from backend.schemas.utente import UtenteCreate, UtenteUpdate, UtenteOut
from backend.services import utentes_service

router = APIRouter(prefix="/api/v1/utentes", tags=["Utentes"])


@router.get("/", response_model=List[UtenteOut])
def listar():
    return utentes_service.listar_utentes()


@router.get("/nif/{nif}", response_model=UtenteOut)
def obter_por_nif(nif: str):
    return utentes_service.obter_utente(nif)


@router.get("/{nif}", response_model=UtenteOut)
def obter(nif: str):
    return utentes_service.obter_utente(nif)


@router.post("/", response_model=UtenteOut, status_code=201)
def criar(data: UtenteCreate):
    return utentes_service.criar_utente(data.model_dump())


@router.put("/{nif}", response_model=UtenteOut)
def atualizar(nif: str, data: UtenteUpdate):
    return utentes_service.atualizar_utente(nif, data.model_dump(exclude_unset=True))


@router.delete("/{nif}")
def remover(nif: str):
    return utentes_service.remover_utente(nif)