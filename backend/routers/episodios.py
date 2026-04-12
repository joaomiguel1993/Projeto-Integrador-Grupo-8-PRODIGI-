from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/episodios",
    tags=["Episodios"]
)

@router.get("/")
def get_episodios():
    query = """
        SELECT
            CodEpUrgenc,
            NomeHosp,
            NumUtent,
            DataHoraEntrada,
            DataHoraSaida
        FROM EpisodiosUrgencia
        ORDER BY CodEpUrgenc;
    """
    return run_query(query)

@router.get("/{cod_ep_urgenc}/{nome_hosp}")
def get_episodio(cod_ep_urgenc: int, nome_hosp: str):
    query = """
        SELECT
            CodEpUrgenc,
            NomeHosp,
            NumUtent,
            DataHoraEntrada,
            DataHoraSaida
        FROM EpisodiosUrgencia
        WHERE CodEpUrgenc = %s AND NomeHosp = %s;
    """
    resultado = run_query(query, (cod_ep_urgenc, nome_hosp))
    if not resultado:
        raise HTTPException(status_code=404, detail="Episódio não encontrado")
    return resultado

@router.post("/")
def criar_episodio(cod_ep_urgenc: int, nome_hosp: str, num_utent: int, data_hora_entrada: str):
    query = """
        INSERT INTO EpisodiosUrgencia (CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntrada)
        VALUES (%s, %s, %s, %s);
    """
    run_query(query, (cod_ep_urgenc, nome_hosp, num_utent, data_hora_entrada))
    return {"message": "Episódio criado com sucesso"}