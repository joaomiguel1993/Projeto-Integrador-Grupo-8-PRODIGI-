from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db import run_query

router = APIRouter(
    prefix="/prescricoes",
    tags=["Prescricoes"]
)


class PrescricaoCreate(BaseModel):
    idato: int
    descricao: str
    datahorapresc: Optional[datetime] = None


@router.get("/")
def get_prescricoes():
    query = """
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        ORDER BY IdPrescricao;
    """
    return run_query(query)


@router.get("/{id_prescricao}")
def get_prescricao(id_prescricao: int):
    query = """
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdPrescricao = %s;
    """
    resultado = run_query(query, (id_prescricao,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrição não encontrada")
    return resultado


@router.get("/ato/{id_ato}")
def get_prescricoes_por_ato(id_ato: int):
    query = """
        SELECT IdPrescricao, IdAto, Descricao, DataHoraPresc
        FROM Prescreve
        WHERE IdAto = %s
        ORDER BY DataHoraPresc;
    """
    resultado = run_query(query, (id_ato,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrições não encontradas")
    return resultado


@router.post("/")
def criar_prescricao(data: PrescricaoCreate):
    query = """
        INSERT INTO Prescreve (IdAto, Descricao, DataHoraPresc)
        VALUES (%s, %s, %s)
        RETURNING IdPrescricao;
    """
    resultado = run_query(query, (
        data.idato,
        data.descricao,
        data.datahorapresc
    ))
    return {
        "message": "Prescrição criada com sucesso",
        "idprescricao": resultado[0]["idprescricao"]
    }