from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.episodio import EpisodioCreate, EpisodioResponse
from backend.services.episodios_service import (
    get_episodios_service,
    get_episodio_service,
    criar_episodio_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/episodios", tags=["Episódios"])

@router.get("/", response_model=list[EpisodioResponse])
def get_episodios(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_episodios_service()
    insert_log(
        username=username,
        acao="LISTAR_EPISODIOS",
        detalhe="Listagem de episódios consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{cod_ep_urgenc}", response_model=EpisodioResponse)
def get_episodio(cod_ep_urgenc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_episodio_service(cod_ep_urgenc)
    if not resultado:
        raise HTTPException(status_code=404, detail="Episódio não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_EPISODIO",
        detalhe=f"Episódio {cod_ep_urgenc} consultado.",
        ip=request.client.host
    )
    return resultado

@router.post("/", response_model=EpisodioResponse, status_code=status.HTTP_201_CREATED)
def post_episodio(data: EpisodioCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_episodio_service(data)
    insert_log(
        username=username,
        acao="CRIAR_EPISODIO",
        detalhe=f"Episódio criado para utente {data.numutent} no hospital {data.idhosp}.",
        ip=request.client.host
    )
    return resultado