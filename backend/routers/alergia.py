from fastapi import APIRouter
from backend.schemas.alergia import (
    AlergiaCreate,
    AlergiaUpdate,
    AlergiaOut,
    AlergiaEstatisticasOut,
)
from backend.services import alergias_service
from typing import List

router = APIRouter(prefix="/alergias", tags=["Alergias"])

@router.get("/estatisticas/ia", response_model=List[AlergiaEstatisticasOut])
def estatisticas_para_ia():
    """Endpoint para a IA ler parâmetros e fazer médias/estimativas"""
    return alergias_service.obter_dados_treino_ia()

@router.get("/utente/{num_utent}", response_model=List[AlergiaOut])
def listar_por_utente(num_utent: int):
    return alergias_service.listar_por_utente(num_utent)

@router.get("/{cod_alergia}", response_model=AlergiaOut)
def obter(cod_alergia: int):
    return alergias_service.obter_alergia(cod_alergia)

@router.post("/", response_model=AlergiaOut, status_code=201)
def criar(data: AlergiaCreate):
    return alergias_service.criar_alergia(data.model_dump())

@router.put("/{cod_alergia}", response_model=AlergiaOut)
def atualizar(cod_alergia: int, data: AlergiaUpdate):
    return alergias_service.atualizar_alergia(cod_alergia, data.model_dump(exclude_unset=True))

@router.delete("/{cod_alergia}")
def remover(cod_alergia: int):
    return alergias_service.remover_alergia(cod_alergia)