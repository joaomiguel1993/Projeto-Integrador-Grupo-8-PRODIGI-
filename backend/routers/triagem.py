from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db import run_query, get_connection

router = APIRouter(
    prefix="/triagem",
    tags=["Triagem de Urgência"],
    responses={404: {"description": "Triagem não encontrada"}}
)


class TriagemCreate(BaseModel):
    codepurgenc: int
    cortriagem: str
    sintomas: str
    datahorainicio: Optional[datetime] = None
    datahorafim: Optional[datetime] = None
    temperatura: Optional[float] = None
    freqcardiaca: Optional[int] = None
    freqrespiratoria: Optional[int] = None
    spo2: Optional[float] = None
    sistolica: Optional[int] = None
    diastolica: Optional[int] = None


@router.get("/")
def get_triagens():
    query = """
        SELECT
            CodEpUrgenc,
            DataHoraInicio,
            DataHoraFim,
            CorTriagem,
            Sintomas,
            Temperatura,
            FreqCardiaca,
            FreqRespiratoria,
            SpO2,
            Sistolica,
            Diastolica
        FROM Triagem
        ORDER BY DataHoraInicio DESC;
    """
    return run_query(query)


@router.get("/{cod_epurgenc}")
def get_triagem(cod_epurgenc: int):
    query = """
        SELECT
            CodEpUrgenc,
            DataHoraInicio,
            DataHoraFim,
            CorTriagem,
            Sintomas,
            Temperatura,
            FreqCardiaca,
            FreqRespiratoria,
            SpO2,
            Sistolica,
            Diastolica
        FROM Triagem
        WHERE CodEpUrgenc = %s;
    """
    triagem = run_query(query, (cod_epurgenc,))
    if not triagem:
        raise HTTPException(
            status_code=404,
            detail="Episódio sem triagem associada"
        )
    return triagem


@router.post("/")
def create_triagem(data: TriagemCreate):
    allowed_cores = {"vermelho", "laranja", "amarelo", "verde", "azul"}
    if data.cortriagem not in allowed_cores:
        raise HTTPException(
            status_code=400,
            detail=f"CorTriagem inválida. Valores aceites: {allowed_cores}"
        )

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO Triagem (
                CodEpUrgenc, DataHoraInicio, DataHoraFim,
                CorTriagem, Sintomas, Temperatura,
                FreqCardiaca, FreqRespiratoria, SpO2,
                Sistolica, Diastolica
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING CodEpUrgenc;
            """,
            (
                data.codepurgenc,
                data.datahorainicio,
                data.datahorafim,
                data.cortriagem,
                data.sintomas,
                data.temperatura,
                data.freqcardiaca,
                data.freqrespiratoria,
                data.spo2,
                data.sistolica,
                data.diastolica
            )
        )
        conn.commit()
        return {
            "message": "Triagem criada com sucesso",
            "codepurgenc": data.codepurgenc
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()