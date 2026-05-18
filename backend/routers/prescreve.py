from typing import List
from fastapi import APIRouter
from backend.schemas.prescreve import PrescreveCreate, PrescreveUpdate, PrescreveOut
from backend.services import prescreve_service

router = APIRouter(prefix="/api/v1/prescreve", tags=["Prescreve"])


@router.get("/", response_model=List[PrescreveOut])
def listar():
    return prescreve_service.listar_prescricoes()


@router.get("/ato/{id_ato}", response_model=List[PrescreveOut])
def listar_ato(id_ato: int):
    return prescreve_service.listar_por_ato(id_ato)


@router.get("/medicamento/{cod_medicamento}", response_model=List[PrescreveOut])
def listar_medicamento(cod_medicamento: int):
    return prescreve_service.listar_por_medicamento(cod_medicamento)


@router.get("/estado/{estado_prescricao}", response_model=List[PrescreveOut])
def listar_estado(estado_prescricao: str):
    return prescreve_service.listar_por_estado(estado_prescricao)


@router.get("/{id_prescricao}", response_model=PrescreveOut)
def obter(id_prescricao: int):
    return prescreve_service.obter_prescricao(id_prescricao)


@router.post("/", response_model=PrescreveOut, status_code=201)
def criar(data: PrescreveCreate):
    return prescreve_service.criar_prescricao(data.model_dump())


@router.put("/{id_prescricao}", response_model=PrescreveOut)
def atualizar(id_prescricao: int, data: PrescreveUpdate):
    return prescreve_service.atualizar_prescricao(
        id_prescricao,
        data.model_dump(exclude_unset=True)
    )


@router.delete("/{id_prescricao}")
def remover(id_prescricao: int):
    return prescreve_service.remover_prescricao(id_prescricao)