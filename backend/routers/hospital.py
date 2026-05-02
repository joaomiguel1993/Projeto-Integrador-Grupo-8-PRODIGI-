from fastapi import APIRouter, HTTPException, Request
from backend.schemas.hospital import HospitalCreate, HospitalResponse, HospitalDeleteResponse
from backend.services.hospitais_service import (
    get_hospitais_service,
    get_hospital_service,
    criar_hospital_service,
    remover_hospital_service
)
from backend.dao.logs_dao import insert_log

router = APIRouter(prefix="/hospitais", tags=["Hospitais"])

@router.get("/", response_model=list[HospitalResponse])
def get_hospitais(request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_hospitais_service()
    insert_log(
        username=username,
        acao="LISTAR_HOSPITAIS",
        detalhe="Listagem de hospitais consultada.",
        ip=request.client.host
    )
    return resultado

@router.get("/{id_hosp}", response_model=HospitalResponse)
def get_hospital(id_hosp: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = get_hospital_service(id_hosp)
    if not resultado:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    insert_log(
        username=username,
        acao="CONSULTAR_HOSPITAL",
        detalhe=f"Hospital {id_hosp} consultado.",
        ip=request.client.host
    )
    return resultado

@router.post("/", status_code=201)
def criar_hospital(data: HospitalCreate, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    resultado = criar_hospital_service(data.nome, data.localizacao)
    if isinstance(resultado, dict) and "erro" in resultado:
        raise HTTPException(status_code=500, detail="Erro ao criar hospital")
    insert_log(
        username=username,
        acao="CRIAR_HOSPITAL",
        detalhe=f"Hospital {data.nome} criado.",
        ip=request.client.host
    )
    return {"message": "Hospital criado com sucesso"}

@router.delete("/{id_hosp}", response_model=HospitalDeleteResponse)
def deletar_hospital(id_hosp: int, request: Request):
    username = request.headers.get("X-Username", "desconhecido")
    hospital = get_hospital_service(id_hosp)
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital não encontrado")
    remover_hospital_service(id_hosp)
    insert_log(
        username=username,
        acao="APAGAR_HOSPITAL",
        detalhe=f"Hospital {id_hosp} removido.",
        ip=request.client.host
    )
    return {"message": "Hospital removido com sucesso", "idhosp": id_hosp}