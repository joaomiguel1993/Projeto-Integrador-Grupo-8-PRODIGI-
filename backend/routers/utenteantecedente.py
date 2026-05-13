from fastapi import APIRouter
from typing import List

from backend.schemas.utenteantecedente import (
    UtenteAntecedenteCreate,
    UtenteAntecedenteUpdate,
    UtenteAntecedenteOut,
)
from backend.services import utenteantecedente_service

router = APIRouter(prefix="/utente-antecedentes", tags=["Utente Antecedentes"])


@router.get("/", response_model=List[UtenteAntecedenteOut])
def listar_utente_antecedentes():
    return utenteantecedente_service.listar_utente_antecedentes()


@router.get("/utente/{num_utent}", response_model=List[UtenteAntecedenteOut])
def listar_antecedentes_por_utente(num_utent: int):
    return utenteantecedente_service.listar_antecedentes_por_utente(num_utent)


@router.get("/antecedente/{cod_antecedente}", response_model=List[UtenteAntecedenteOut])
def listar_utentes_por_antecedente(cod_antecedente: int):
    return utenteantecedente_service.listar_utentes_por_antecedente(cod_antecedente)


@router.get("/{num_utent}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def obter_utente_antecedente(num_utent: int, cod_antecedente: int):
    return utenteantecedente_service.obter_utente_antecedente(num_utent, cod_antecedente)


@router.post("/", response_model=UtenteAntecedenteOut, status_code=201)
def criar_utente_antecedente(data: UtenteAntecedenteCreate):
    return utenteantecedente_service.criar_utente_antecedente(data.model_dump())


@router.put("/{num_utent}/{cod_antecedente}", response_model=UtenteAntecedenteOut)
def atualizar_utente_antecedente(num_utent: int, cod_antecedente: int, data: UtenteAntecedenteUpdate):
    return utenteantecedente_service.atualizar_utente_antecedente(
        num_utent,
        cod_antecedente,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{num_utent}/{cod_antecedente}")
def remover_utente_antecedente(num_utent: int, cod_antecedente: int):
    return utenteantecedente_service.remover_utente_antecedente(num_utent, cod_antecedente)