from fastapi import APIRouter, HTTPException, status
from backend.schemas.ato import (
    AtoCreate,
    AtoResponse,
    FuncionarioAtoResponse,
    PrescricaoAtoResponse
)
from backend.services.atos_service import (
    get_atos_service,
    get_ato_service,
    get_atos_por_episodio_service,
    criar_ato_service,
    get_funcionarios_do_ato_service,
    get_prescricoes_do_ato_service
)

router = APIRouter(
    prefix="/atos",
    tags=["Atos"]
)

@router.get("/", response_model=list[AtoResponse])
def get_atos():
    return get_atos_service()

@router.get("/episodio/{cod_ep_urgenc}", response_model=list[AtoResponse])
def get_atos_por_episodio(cod_ep_urgenc: int):
    return get_atos_por_episodio_service(cod_ep_urgenc)

@router.get("/{id_ato}", response_model=AtoResponse)
def get_ato(id_ato: int):
    resultado = get_ato_service(id_ato)
    if not resultado:
        raise HTTPException(status_code=404, detail="Ato não encontrado")
    return resultado

@router.post("/", response_model=AtoResponse, status_code=status.HTTP_201_CREATED)
def post_ato(data: AtoCreate):
    resultado = criar_ato_service(data)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar o ato")
    return resultado

@router.get("/{id_ato}/funcionarios", response_model=list[FuncionarioAtoResponse])
def get_funcionarios_ato(id_ato: int):
    return get_funcionarios_do_ato_service(id_ato)

@router.get("/{id_ato}/prescricoes", response_model=list[PrescricaoAtoResponse])
def get_prescricoes_ato(id_ato: int):
    return get_prescricoes_do_ato_service(id_ato)