# backend/routers/triagem.py

from fastapi import APIRouter, HTTPException
from backend.db import run_query, get_connection


router = APIRouter(
    prefix="/triagem",
    tags=["Triagem de Urgência"],
    responses={404: {"description": "Triagem não encontrada"}}
)


@router.get("/")
def get_triagens():
    """
    Lista todas as triagens (atos do tipo 'Triagem').
    """
    query = """
        SELECT
            CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim,
            Tipo
        FROM Ato
        WHERE Tipo = 'Triagem';
    """
    triagens = run_query(query)
    return triagens


@router.get("/{cod_epurgenc}")
def get_triagem(cod_epurgenc: int):
    """
    Lista a triagem associada a um episódio de urgência.
    """
    query = """
        SELECT
            CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim,
            Tipo
        FROM Ato
        WHERE
            Tipo = 'Triagem'
            AND CodEpUrgenc = %s;
    """
    triagem = run_query(query, params=(cod_epurgenc,))
    if not triagem:
        raise HTTPException(
            status_code=404,
            detail="Episódio sem triagem associada"
        )
    return triagem


@router.post("/")
def create_triagem(
    cod_epurgenc: int,
    nome_hosp: str,
    data_hora_inicio: str,
    data_hora_fim: str = None,
    prioridade: str = "Media"
):
    """
    Cria um registo de triagem associado a um episódio de urgência.

    - `cod_epurgenc`: código do episódio
    - `nome_hosp`: nome do hospital
    - `data_hora_inicio`: início da triagem
    - `data_hora_fim`: fim (opcional)
    - `prioridade`: nível de prioridade (ex: Baixa, Media, Alta)
    """
    conn = get_connection()
    cur = conn.cursor()
    try:
        if data_hora_fim is None:
            data_hora_fim = "NULL"

        query = f"""
            INSERT INTO Ato (
                CodEpUrgenc, NomeHosp, DataHoraInicio, DataHoraFim,
                Tipo
            )
            VALUES (
                {cod_epurgenc}, '{nome_hosp}', '{data_hora_inicio}',
                {data_hora_fim}, 'Triagem'
            )
            RETURNING CodEpUrgenc;
        """
        cur.execute(query)
        conn.commit()
        return {"cod_epurgenc": cod_epurgenc}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    finally:
        cur.close()
        conn.close()