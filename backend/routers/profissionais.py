from fastapi import APIRouter, HTTPException
from backend.schemas.profissional import (
    ProfissionalResponse,
    ProfissionalCreate,
    ProfissionalUpdate
)
from backend.services.profissionais_service import (
    get_profissionais_service,
    get_profissional_service,
    create_profissional_service,
    update_profissional_service
)

router = APIRouter(prefix="/profissionais", tags=["Profissionais"])


@router.get("/", response_model=list[ProfissionalResponse])
def get_profissionais():
    return get_profissionais_service()


@router.get("/{id_func}", response_model=ProfissionalResponse)
def get_profissional(id_func: int):
    resultado = get_profissional_service(id_func)
    if not resultado:
        raise HTTPException(status_code=404, detail="Profissional não encontrado")
    return resultado


@router.post("/", response_model=ProfissionalResponse)
def create_profissional(data: ProfissionalCreate):
    return create_profissional_service(
        nome=data.nome,
        tipofunc=data.tipofunc,
        sexo=data.sexo
    )


@router.put("/{id_func}", response_model=ProfissionalResponse)
def update_profissional(id_func: int, data: ProfissionalUpdate):
    return update_profissional_service(
        id_func=id_func,
        nome=data.nome,
        tipofunc=data.tipofunc,
        sexo=data.sexo
    )