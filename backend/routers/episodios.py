from fastapi import APIRouter, HTTPException, status
from backend.schemas.episodio import EpisodioCreate, EpisodioResponse
from backend.services.episodios_service import (
    get_episodios_service,
    get_episodio_service,
    criar_episodio_service
)

router = APIRouter(prefix="/episodios", tags=["Episódios"])

@router.get("/", response_model=list[EpisodioResponse])
def get_episodios():
    return get_episodios_service()

@router.get("/{cod_ep_urgenc}", response_model=EpisodioResponse)
def get_episodio(cod_ep_urgenc: int):
    resultado = get_episodio_service(cod_ep_urgenc)
    if not resultado:
        raise HTTPException(status_code=404, detail="Episódio não encontrado")
    return resultado

@router.post("/", response_model=EpisodioResponse, status_code=status.HTTP_201_CREATED)
def post_episodio(data: EpisodioCreate):
    return criar_episodio_service(data)