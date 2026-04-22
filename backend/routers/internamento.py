from typing import Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.db import run_query

router = APIRouter(
    prefix="/internamentos",
    tags=["Internamentos"]
)


class InternamentoCreate(BaseModel):
    codepurgenc: int
    idfunc: int
    motivoint: str
    datahoraconsulta: Optional[datetime] = None
    datahoraalta: Optional[datetime] = None
    numerocama: Optional[str] = None
    servico: Optional[str] = None
    tipoalta: Optional[str] = None


@router.get("/")
def get_internamentos():
    query = """
        SELECT
            CodInternamento,
            CodEpUrgenc,
            IdFunc,
            DataHoraInt,
            DataHoraConsulta,
            DataHoraAlta,
            MotivoInt,
            NumeroCama,
            Servico,
            TipoAlta
        FROM Internamento
        ORDER BY DataHoraInt DESC;
    """
    return run_query(query)


@router.get("/{cod_internamento}")
def get_internamento(cod_internamento: int):
    query = """
        SELECT
            CodInternamento,
            CodEpUrgenc,
            IdFunc,
            DataHoraInt,
            DataHoraConsulta,
            DataHoraAlta,
            MotivoInt,
            NumeroCama,
            Servico,
            TipoAlta
        FROM Internamento
        WHERE CodInternamento = %s;
    """
    resultado = run_query(query, (cod_internamento,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado


@router.get("/episodio/{cod_ep_urgenc}")
def get_internamento_por_episodio(cod_ep_urgenc: int):
    query = """
        SELECT
            CodInternamento,
            CodEpUrgenc,
            IdFunc,
            DataHoraInt,
            DataHoraConsulta,
            DataHoraAlta,
            MotivoInt,
            NumeroCama,
            Servico,
            TipoAlta
        FROM Internamento
        WHERE CodEpUrgenc = %s;
    """
    resultado = run_query(query, (cod_ep_urgenc,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Internamento não encontrado")
    return resultado


@router.post("/")
def criar_internamento(data: InternamentoCreate):
    query = """
        INSERT INTO Internamento (
            CodEpUrgenc, IdFunc, MotivoInt,
            DataHoraConsulta, DataHoraAlta,
            NumeroCama, Servico, TipoAlta
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING CodInternamento;
    """
    resultado = run_query(query, (
        data.codepurgenc,
        data.idfunc,
        data.motivoint,
        data.datahoraconsulta,
        data.datahoraalta,
        data.numerocama,
        data.servico,
        data.tipoalta
    ))
    return {
        "message": "Internamento criado com sucesso",
        "codinternamento": resultado[0]["codinternamento"]
    }