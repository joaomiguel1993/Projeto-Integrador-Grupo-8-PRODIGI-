from fastapi import APIRouter, HTTPException, Request, status
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
from backend.dao.logs_dao import insert_log


router = APIRouter(prefix="/trabalha", tags=["Trabalha"])


def get_client_ip(request: Request):
    return request.client.host if request.client else None


@router.get("/hospital/{idhosp}", response_model=list[FuncionarioHospitalResponse])
def get_funcionarios_hospital(idhosp: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_funcionarios_hospital_service(idhosp)
    insert_log(
        username=username,
        acao="LISTAR_FUNCIONARIOS_HOSPITAL",
        detalhe=f"Funcionários do hospital {idhosp} consultados.",
        ip=get_client_ip(request)
    )
    return resultado


@router.get("/funcionario/{idfunc}", response_model=list[HospitalFuncionarioResponse])
def get_hospitais_funcionario(idfunc: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_hospitais_funcionario_service(idfunc)
    insert_log(
        username=username,
        acao="LISTAR_HOSPITAIS_FUNCIONARIO",
        detalhe=f"Hospitais do funcionário {idfunc} consultados.",
        ip=get_client_ip(request)
    )
    return resultado


@router.post("/", response_model=TrabalhaResponse, status_code=status.HTTP_201_CREATED)
def post_trabalha(data: TrabalhaCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_trabalha_service(data.idfunc, data.idhosp)
    if not resultado:
        raise HTTPException(status_code=400, detail="Não foi possível criar a associação")
    insert_log(
        username=username,
        acao="CRIAR_TRABALHA",
        detalhe=f"Funcionário {data.idfunc} associado ao hospital {data.idhosp}.",
        ip=get_client_ip(request)
    )
    return resultado


@router.put("/{idfunc}/{idhosp}", response_model=TrabalhaResponse)
def put_trabalha(idfunc: int, idhosp: int, data: TrabalhaUpdate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = atualizar_trabalha_service(idfunc, idhosp, data.ativo)
    if not resultado:
        raise HTTPException(status_code=404, detail="Associação não encontrada")
    insert_log(
        username=username,
        acao="ATUALIZAR_TRABALHA",
        detalhe=f"Associação funcionário {idfunc} / hospital {idhosp} atualizada.",
        ip=get_client_ip(request)
    )
    return resultado


@router.delete("/{idfunc}/{idhosp}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trabalha(idfunc: int, idhosp: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = remover_trabalha_service(idfunc, idhosp)
    if not resultado:
        raise HTTPException(status_code=404, detail="Associação não encontrada")
    insert_log(
        username=username,
        acao="APAGAR_TRABALHA",
        detalhe=f"Associação funcionário {idfunc} / hospital {idhosp} removida.",
        ip=get_client_ip(request)
    )