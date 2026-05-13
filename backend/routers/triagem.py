from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.triagem import TriagemResponse, TriagemCreate, TriagemUpdate
from backend.services.triagens_service import (
    get_triagens_service,
    get_triagem_service,
    criar_triagem_service,
    update_triagem_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/triagens", tags=["Triagens"])

def get_client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None

@router.get("/", response_model=list[TriagemResponse])
def get_triagens(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_triagens_service()

    insert_log(
        username=username,
        acao="LISTAR_TRIAGENS",
        detalhe="Listagem de triagens consultada.",
        ip=get_client_ip(request)
    )

    return resultado

@router.get("/{cod_ep_urgenc}", response_model=TriagemResponse)
def get_triagem(cod_ep_urgenc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    res = get_triagem_service(cod_ep_urgenc)
    if not res:
        raise HTTPException(status_code=404, detail="Triagem não encontrada")
    return res

@router.post("/", status_code=status.HTTP_201_CREATED)
def post_triagem(data: TriagemCreate, request: Request):
    return criar_triagem_service(data)

@router.put("/{cod_ep_urgenc}")
def put_triagem(cod_ep_urgenc: int, data: TriagemUpdate, request: Request):
    return update_triagem_service(cod_ep_urgenc, data)