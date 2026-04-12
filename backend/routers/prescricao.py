from fastapi import APIRouter, HTTPException
from backend.db import run_query

router = APIRouter(
    prefix="/prescricoes",
    tags=["Prescricoes"]
)

@router.get("/")
def get_prescricoes():
    query = """
        SELECT CodPrescricao, CodEpUrgenc, NomeHosp, NumFuncPresc, DataHoraPresc,
               Medicamento, Dose, Frequencia, Duracao
        FROM Prescreve ORDER BY CodPrescricao;
    """
    return run_query(query)

@router.get("/{cod}/{nome_hosp}")
def get_prescricoes_episodio(cod: int, nome_hosp: str):
    query = """
        SELECT CodPrescricao, CodEpUrgenc, NomeHosp, NumFuncPresc, DataHoraPresc,
               Medicamento, Dose, Frequencia, Duracao
        FROM Prescreve WHERE CodEpUrgenc = %s AND NomeHosp = %s ORDER BY DataHoraPresc;
    """
    resultado = run_query(query, (cod, nome_hosp))
    if not resultado:
        raise HTTPException(status_code=404, detail="Prescrições não encontradas")
    return resultado