from fastapi import APIRouter, HTTPException, status
from backend.schemas.trabalha import (
    TrabalhaCreate,
    TrabalhaUpdate,
    TrabalhaResponse,
    FuncionarioHospitalResponse,
    HospitalFuncionarioResponse
)
from backend.services.trabalha_service import (
    get_funcionarios_hospital_service,
    get_hospitais_funcionario_service,
    criar_trabalha_service,
    atualizar_trabalha_service,
    remover_trabalha_service
)

router = APIRouter(prefix="/trabalha", tags=["Trabalha"])


@router.get("/hospital/{idhosp}", response_model=list[FuncionarioHospitalResponse])
def get_funcionarios_hospital(idhosp: int):
    return get_funcionarios_hospital_service(idhosp)


@router.get("/funcionario/{idfunc}", response_model=list[HospitalFuncionarioResponse])
def get_hospitais_funcionario(idfunc: int):
    return get_hospitais_funcionario_service(idfunc)


@router.post("/", response_model=TrabalhaResponse, status_code=status.HTTP_201_CREATED)
def post_trabalha(data: TrabalhaCreate):
    resultado = criar_trabalha_service(data.idfunc, data.idhosp)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar a associação")
    return resultado


@router.put("/{idfunc}/{idhosp}", response_model=TrabalhaResponse)
def put_trabalha(idfunc: int, idhosp: int, data: TrabalhaUpdate):
    resultado = atualizar_trabalha_service(idfunc, idhosp, data.ativo)
    if not resultado:
        raise HTTPException(status_code=404, detail="Associação não encontrada")
    return resultado


@router.delete("/{idfunc}/{idhosp}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trabalha(idfunc: int, idhosp: int):
    resultado = remover_trabalha_service(idfunc, idhosp)
    if not resultado:
        raise HTTPException(status_code=404, detail="Associação não encontrada")