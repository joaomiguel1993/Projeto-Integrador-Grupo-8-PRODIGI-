from typing import List
from fastapi import APIRouter
from backend.schemas.funcionario import FuncionarioCreate, FuncionarioUpdate, FuncionarioOut
from backend.services import funcionarios_service

router = APIRouter(prefix="/api/v1/funcionarios", tags=["Funcionários"])


@router.get("/", response_model=List[FuncionarioOut])
def listar():
    return funcionarios_service.listar_funcionarios()


@router.get("/{id_func}", response_model=FuncionarioOut)
def obter(id_func: int):
    return funcionarios_service.obter_funcionario(id_func)


@router.post("/", response_model=FuncionarioOut, status_code=201)
def criar(data: FuncionarioCreate):
    return funcionarios_service.criar_funcionario(data.model_dump())


@router.put("/{id_func}", response_model=FuncionarioOut)
def atualizar(id_func: int, data: FuncionarioUpdate):
    return funcionarios_service.atualizar_funcionario(id_func, data.model_dump(exclude_unset=True))


@router.delete("/{id_func}")
def remover(id_func: int):
    return funcionarios_service.remover_funcionario(id_func)