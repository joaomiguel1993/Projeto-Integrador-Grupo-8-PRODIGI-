from typing import List
from fastapi import APIRouter
from backend.schemas.medico import MedicoCreate, MedicoUpdate, MedicoOut
from backend.services import medicos_service

router = APIRouter(prefix="/api/v1/medicos", tags=["Médicos"])


@router.get("/", response_model=List[MedicoOut])
def listar():
    return medicos_service.listar_medicos()


@router.get("/estagiarios", response_model=List[MedicoOut])
def listar_estagiarios():
    return medicos_service.listar_estagiarios()


@router.get("/especialidade/{especialidade}", response_model=List[MedicoOut])
def listar_por_especialidade(especialidade: str):
    return medicos_service.listar_por_especialidade(especialidade)


@router.get("/{id_func}", response_model=MedicoOut)
def obter(id_func: int):
    return medicos_service.obter_medico(id_func)


@router.post("/", response_model=MedicoOut, status_code=201)
def criar(data: MedicoCreate):
    return medicos_service.criar_medico(data.model_dump())


@router.put("/{id_func}", response_model=MedicoOut)
def atualizar(id_func: int, data: MedicoUpdate):
    return medicos_service.atualizar_medico(id_func, data.model_dump(exclude_unset=True))


@router.delete("/{id_func}")
def remover(id_func: int):
    return medicos_service.remover_medico(id_func)