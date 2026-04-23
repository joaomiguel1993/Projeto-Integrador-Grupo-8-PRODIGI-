from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db import run_query

router = APIRouter(
    prefix="/episodios",
    tags=["Episodios"]
)


class EpisodioCreate(BaseModel):
    numutent: int
    idhosp: int
    datahoraentr: Optional[datetime] = None
    estado: Optional[str] = "aberto"


@router.get("/")
def get_episodios():
    query = """
        SELECT
            CodEpUrgenc,
            IdHosp,
            NumUtent,
            DataHoraEntr,
            DataHoraSaida,
            Estado
        FROM EpUrgencia
        ORDER BY CodEpUrgenc;
    """
    return run_query(query)


@router.get("/{cod_ep_urgenc}")
def get_episodio(cod_ep_urgenc: int):
    query = """
        SELECT
            CodEpUrgenc,
            IdHosp,
            NumUtent,
            DataHoraEntr,
            DataHoraSaida,
            Estado
        FROM EpUrgencia
        WHERE CodEpUrgenc = %s;
    """
    resultado = run_query(query, (cod_ep_urgenc,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Episódio não encontrado")
    return resultado


@router.post("/")
def criar_episodio(data: EpisodioCreate):
    query = """
        INSERT INTO EpUrgencia (NumUtent, IdHosp, DataHoraEntr, Estado)
        VALUES (%s, %s, %s, %s)
        RETURNING CodEpUrgenc;
    """
    resultado = run_query(query, (
        data.numutent,
        data.idhosp,
        data.datahoraentr,
        data.estado
    ))
    return {
        "message": "Episódio criado com sucesso",
        "codepurgenc": resultado[0]["codepurgenc"]
    }