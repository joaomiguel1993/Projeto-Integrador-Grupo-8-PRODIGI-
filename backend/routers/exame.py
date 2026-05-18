from typing import List
from fastapi import APIRouter
from backend.schemas.exame import ExameCreate, ExameUpdate, ExameOut
from backend.services import exame_service

router = APIRouter(prefix="/api/v1/exame", tags=["Exame"])


@router.get("/", response_model=List[ExameOut])
def listar():
    return exame_service.listar_exames()


@router.get("/episodio/{cod_ep_urgenc}", response_model=List[ExameOut])
def listar_ep(cod_ep_urgenc: int):
    return exame_service.listar_por_ep(cod_ep_urgenc)


@router.get("/estado/{estado}", response_model=List[ExameOut])
def listar_estado(estado: str):
    return exame_service.listar_por_estado(estado)


@router.get("/tipo/{tipo}", response_model=List[ExameOut])
def listar_tipo(tipo: str):
    return exame_service.listar_por_tipo(tipo)


@router.get("/funcionario/{id_func}", response_model=List[ExameOut])
def listar_funcionario(id_func: int):
    return exame_service.listar_por_funcionario(id_func)


@router.get("/{cod_exame}", response_model=ExameOut)
def obter(cod_exame: int):
    return exame_service.obter_exame(cod_exame)


@router.post("/", response_model=ExameOut, status_code=201)
def criar(data: ExameCreate):
    return exame_service.criar_exame(data.model_dump())


@router.put("/{cod_exame}", response_model=ExameOut)
def atualizar(cod_exame: int, data: ExameUpdate):
    return exame_service.atualizar_exame(
        cod_exame,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{cod_exame}")
def remover(cod_exame: int):
    return exame_service.remover_exame(cod_exame)