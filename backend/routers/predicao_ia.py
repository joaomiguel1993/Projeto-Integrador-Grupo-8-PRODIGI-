from typing import List
from fastapi import APIRouter
from backend.schemas.predicao_ia import (
    PredicaoIACreate,
    PredicaoIAUpdate,
    PredicaoIAOut,
    TipoModeloIAEnum,
    EntidadeIAEnum,
)
from backend.services import predicao_ia_service

router = APIRouter(prefix="/api/v1/predicao-ia", tags=["Predição IA"])


@router.get("/", response_model=List[PredicaoIAOut])
def listar():
    return predicao_ia_service.listar_predicoes()


@router.get("/tipo-modelo/{tipo_modelo}", response_model=List[PredicaoIAOut])
def listar_tipo_modelo(tipo_modelo: TipoModeloIAEnum):
    return predicao_ia_service.listar_por_tipo_modelo(tipo_modelo.value)


@router.get("/entidade/{entidade}", response_model=List[PredicaoIAOut])
def listar_entidade(entidade: EntidadeIAEnum):
    return predicao_ia_service.listar_por_entidade(entidade.value)


@router.get("/entidade/{entidade}/{entidade_id}", response_model=List[PredicaoIAOut])
def listar_entidade_id(entidade: EntidadeIAEnum, entidade_id: int):
    return predicao_ia_service.listar_por_entidade_id(entidade.value, entidade_id)


@router.get("/sucesso/{sucesso}", response_model=List[PredicaoIAOut])
def listar_sucesso(sucesso: bool):
    return predicao_ia_service.listar_por_sucesso(sucesso)


@router.get("/{id_predicao}", response_model=PredicaoIAOut)
def obter(id_predicao: int):
    return predicao_ia_service.obter_predicao(id_predicao)


@router.post("/", response_model=PredicaoIAOut, status_code=201)
def criar(data: PredicaoIACreate):
    return predicao_ia_service.criar_predicao(data.model_dump())


@router.put("/{id_predicao}", response_model=PredicaoIAOut)
def atualizar(id_predicao: int, data: PredicaoIAUpdate):
    return predicao_ia_service.atualizar_predicao(
        id_predicao,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_predicao}")
def remover(id_predicao: int):
    return predicao_ia_service.remover_predicao(id_predicao)