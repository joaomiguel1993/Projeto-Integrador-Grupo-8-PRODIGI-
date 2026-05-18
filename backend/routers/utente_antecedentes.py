from typing import List
from fastapi import APIRouter
from backend.schemas.utente_antecedente import (
    UtenteAntecedenteCreate,
    UtenteAntecedenteUpdate,
    UtenteAntecedenteOut,
)
from backend.services import utente_antecedentes_service

router = APIRouter(prefix="/api/v1/utente-antecedentes", tags=["UtenteAntecedentes"])


@router.get("/", response_model=List[UtenteAntecedenteOut])
def listar():
    return utente_antecedentes_service.listar()


@router.get("/nif/{nif}", response_model=List[UtenteAntecedenteOut])
def listar_nif(nif: str):
    return utente_antecedentes_service.listar_por_nif(nif)


@router.get("/antecedente/{cod_antecedente}", response_model=List[UtenteAntecedenteOut])
def listar_antecedente(cod_antecedente: int):
    return utente_antecedentes_service.listar_por_antecedente(cod_antecedente)


@router.get("/{nif}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def obter(nif: str, cod_antecedente: int):
    return utente_antecedentes_service.obter(nif, cod_antecedente)


@router.post("/", response_model=UtenteAntecedenteOut, status_code=201)
def criar(data: UtenteAntecedenteCreate):
    return utente_antecedentes_service.criar(data.model_dump())


@router.put("/{nif}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def atualizar(nif: str, cod_antecedente: int, data: UtenteAntecedenteUpdate):
    return utente_antecedentes_service.atualizar(nif, cod_antecedente, data.model_dump(exclude_unset=True))


@router.delete("/{nif}/{cod_antecedente}")
def remover(nif: str, cod_antecedente: int):
    return utente_antecedentes_service.remover(nif, cod_antecedente)