# backend/routers/episodios.py

from fastapi import APIRouter, HTTPException
from backend.db import run_query
from backend.db import get_connection

router = APIRouter(
    prefix="/episodios",
    tags=["Episódios de Urgência"],
    responses={404: {"description": "Episódio não encontrado"}}
)


@router.get("/")
def get_episodios():
    """
    Lista todos os episódios de urgência.
    """
    query = """
        SELECT
            CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida
        FROM EpUrgencia;
    """
    episodios = run_query(query)
    return episodios


@router.get("/{cod_epurgenc}")
def get_episodio(cod_epurgenc: int):
    """
    Retorna um episódio de urgência específico.
    """
    query = """
        SELECT
            CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida
        FROM EpUrgencia
        WHERE CodEpUrgenc = %s;
    """
    episodio = run_query(query, params=(cod_epurgenc,))
    if not episodio:
        raise HTTPException(
            status_code=404,
            detail="Episódio de urgência não encontrado"
        )
    return episodio[0]


@router.post("/")
def create_episodio(
    num_utent: int,
    nome_hosp: str,
    data_hora_entr: str,
    data_hora_saida: str = None
):
    """
    Cria um novo episódio de urgência.

    - `num_utent`: número do utente
    - `nome_hosp`: nome do hospital
    - `data_hora_entr`: data e hora de entrada
    - `data_hora_saida`: data e hora de saída (opcional)
    """
    conn = get_connection()
    cur = conn.cursor()
    try:
        if data_hora_saida is None:
            data_hora_saida = "NULL"

        query = f"""
            INSERT INTO EpUrgencia (CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida)
            VALUES (DEFAULT, '{nome_hosp}', {num_utent},
                    '{data_hora_entr}', {data_hora_saida})
            RETURNING CodEpUrgenc;
        """
        cur.execute(query)
        cod = cur.fetchone()[0]
        conn.commit()
        return {"cod_epurgenc": cod}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    finally:
        cur.close()
        conn.close()