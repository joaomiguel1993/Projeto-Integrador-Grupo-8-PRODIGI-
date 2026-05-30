from fastapi import APIRouter, Request, Depends
from typing import List, Optional

from backend.schemas.episodio import EpisodioCreate, EpisodioUpdate, EpisodioOut
from backend.services import episodios_service
from backend.auth.jwt_utils import get_current_user
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/v1/episodios", tags=["Episódios"])


def get_client_ip(request: Request) -> str:
    if hasattr(request, "client") and request.client is not None:
        return request.client.host
    return "127.0.0.1"


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
def criar_episodio(
    data: EpisodioCreate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = episodios_service.criar_episodio(data.model_dump())

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="CRIAR_EPISODIO",
        detalhe=f"Episódio criado para utente {data.num_utent}.",
        ip=get_client_ip(request),
    )

    return result


@router.put("/{cod_ep_urgenc}", response_model=EpisodioOut)
def atualizar_episodio(
    cod_ep_urgenc: int,
    data: EpisodioUpdate,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = episodios_service.atualizar_episodio(
        cod_ep_urgenc,
        data.model_dump(exclude_unset=True)
    )

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="ATUALIZAR_EPISODIO",
        detalhe=f"Episódio {cod_ep_urgenc} atualizado — estado: {data.model_dump(exclude_unset=True).get('estado', '?')}.",
        ip=get_client_ip(request),
    )

    return result


@router.delete("/{cod_ep_urgenc}")
def remover_episodio(
    cod_ep_urgenc: int,
    request: Request,
    current_user = Depends(get_current_user),
):
    result = episodios_service.remover_episodio(cod_ep_urgenc)

    insert_log(
        username=current_user.get("username") or current_user.get("sub", "sistema"),
        acao="REMOVER_EPISODIO",
        detalhe=f"Episódio {cod_ep_urgenc} removido.",
        ip=get_client_ip(request),
    )

    return result