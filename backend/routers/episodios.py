from fastapi import APIRouter
from typing import List, Optional

from backend.schemas.episodio import EpisodioCreate, EpisodioUpdate, EpisodioOut
from backend.services import episodios_service

router = APIRouter(prefix="/v1/episodios", tags=["Episódios"])


@router.get("/", response_model=List[EpisodioOut])
def listar_episodios():
    return episodios_service.listar_episodios()


@router.get("/utente/{num_utent}", response_model=List[EpisodioOut])
def listar_episodios_por_utente(num_utent: int):
    return episodios_service.listar_episodios_por_utente(num_utent)


@router.get("/hospital/{id_hosp}", response_model=List[EpisodioOut])
def listar_episodios_por_hospital(id_hosp: int):
    return episodios_service.listar_episodios_por_hospital(id_hosp)


@router.get("/sem-triagem", response_model=List[EpisodioOut])
def listar_episodios_sem_triagem(id_hosp: Optional[int] = None):
    return episodios_service.listar_episodios_sem_triagem(id_hosp)


@router.get("/{cod_ep_urgenc}", response_model=EpisodioOut)
def obter_episodio(cod_ep_urgenc: int):
    return episodios_service.obter_episodio(cod_ep_urgenc)


@router.post("/", response_model=EpisodioOut, status_code=201)
def criar_episodio(data: EpisodioCreate):
    return episodios_service.criar_episodio(data.model_dump())


@router.put("/{cod_ep_urgenc}", response_model=EpisodioOut)
def atualizar_episodio(cod_ep_urgenc: int, data: EpisodioUpdate):
    return episodios_service.atualizar_episodio(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_ep_urgenc}")
def remover_episodio(cod_ep_urgenc: int):
    return episodios_service.remover_episodio(cod_ep_urgenc)