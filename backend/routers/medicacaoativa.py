from fastapi import APIRouter, HTTPException, status
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

router = APIRouter(prefix="/medicacaoativa", tags=["Medicação Ativa"])


@router.get("/", response_model=list[MedicacaoAtivaResponse])
def get_medicacaoativa():
    return get_medicacaoativa_service()


@router.get("/utente/{numutent}", response_model=list[MedicacaoAtivaDetalheResponse])
def get_medicacaoativa_por_utente(numutent: int):
    return get_medicacaoativa_por_utente_service(numutent)


@router.post("/", response_model=MedicacaoAtivaResponse, status_code=status.HTTP_201_CREATED)
def post_medicacaoativa(data: MedicacaoAtivaCreate):
    resultado = criar_medicacaoativa_service(data)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível registar a medicação")
    return resultado


@router.put("/{codmedicacaoativa}", response_model=MedicacaoAtivaResponse)
def put_medicacaoativa(codmedicacaoativa: int, data: MedicacaoAtivaUpdate):
    resultado = atualizar_medicacaoativa_service(codmedicacaoativa, data)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")
    return resultado


@router.delete("/{codmedicacaoativa}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medicacaoativa(codmedicacaoativa: int):
    resultado = remover_medicacaoativa_service(codmedicacaoativa)
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicação não encontrada")