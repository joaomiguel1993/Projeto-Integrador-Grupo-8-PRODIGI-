from fastapi import APIRouter, HTTPException, Request, status
from backend.schemas.medicacaoativa import (
    MedicacaoAtivaCreate,
    MedicacaoAtivaUpdate,
    MedicacaoAtivaResponse,
    MedicacaoAtivaDetalheResponse
)
from backend.services.medicacaoativa_service import (
    get_medicacaoativa_service,
    get_medicacaoativa_por_utente_service,
    criar_medicacaoativa_service,
    atualizar_medicacaoativa_service,
    remover_medicacaoativa_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/medicacaoativa", tags=["Medicação Ativa"])


@router.get("/", response_model=list[MedicacaoAtivaResponse])
def get_medicacaoativa(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicacaoativa_service()
    insert_log(
        username=username,
        acao="LISTAR_MEDICACAO_ATIVA",
        detalhe="Listagem de medicação ativa consultada.",
        ip=request.client.host
    )
    return resultado


@router.get("/utente/{numutent}", response_model=list[MedicacaoAtivaDetalheResponse])
def get_medicacaoativa_por_utente(numutent: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_medicacaoativa_por_utente_service(numutent)
    insert_log(
        username=username,
        acao="LISTAR_MEDICACAO_ATIVA_UTENTE",
        detalhe=f"Medicação ativa do utente {numutent} consultada.",
        ip=request.client.host
    )
    return resultado


@router.post("/", response_model=MedicacaoAtivaResponse, status_code=status.HTTP_201_CREATED)
def post_medicacaoativa(data: MedicacaoAtivaCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_medicacaoativa_service(data)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível registar a medicação")
    insert_log(
        username=username,
        acao="CRIAR_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa registada para utente {data.numutent}.",
        ip=request.client.host
    )
    return resultado


@router.put("/{codmedicacaoativa}", response_model=MedicacaoAtivaResponse)
def put_medicacaoativa(codmedicacaoativa: int, data: MedicacaoAtivaUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = atualizar_medicacaoativa_service(codmedicacaoativa, data)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    insert_log(
        username=username,
        acao="ATUALIZAR_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa {codmedicacaoativa} atualizada.",
        ip=request.client.host
    )
    return resultado


@router.delete("/{codmedicacaoativa}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicacaoativa(codmedicacaoativa: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = remover_medicacaoativa_service(codmedicacaoativa)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    insert_log(
        username=username,
        acao="APAGAR_MEDICACAO_ATIVA",
        detalhe=f"Medicação ativa {codmedicacaoativa} removida.",
        ip=request.client.host
    )