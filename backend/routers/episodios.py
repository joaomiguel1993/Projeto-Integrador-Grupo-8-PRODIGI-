from fastapi import APIRouter, HTTPException
from backend.repositories.episodios_repository import (
    listar_episodios,
    obter_episodio,
    obter_triagem_episodio,
    obter_internamento_episodio,
    listar_profissionais_episodio
)
from backend.repositories.atos_repository import listar_atos_episodio

router = APIRouter(
    prefix="/episodios",
    tags=["Episódios"],
    responses={404: {"description": "Episódio não encontrado"}}
)

@router.get("/")
def get_episodios():
    return listar_episodios()

@router.get("/{cod_ep}")
def get_episodio(cod_ep: int):
    resultado = obter_episodio(cod_ep)
    if not resultado:
        raise HTTPException(status_code=404, detail="Episódio não encontrado")
    return resultado

@router.get("/{cod_ep}/triagem")
def get_triagem_episodio(cod_ep: int):
    return obter_triagem_episodio(cod_ep)

@router.get("/{cod_ep}/atos")
def get_atos_episodio(cod_ep: int):
    return listar_atos_episodio(cod_ep)

@router.get("/{cod_ep}/internamento")
def get_internamento_episodio(cod_ep: int):
    return obter_internamento_episodio(cod_ep)

@router.get("/{cod_ep}/profissionais")
def get_profissionais_episodio(cod_ep: int):
    return listar_profissionais_episodio(cod_ep)