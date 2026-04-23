from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.db import run_query

router = APIRouter(
    prefix="/medicamentos",
    tags=["Medicamentos"]
)


class MedicamentoCreate(BaseModel):
    nome: str
    principioativo: str


@router.get("/")
def get_medicamentos():
    query = """
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        ORDER BY Nome;
    """
    return run_query(query)


@router.get("/{cod_medicamento}")
def get_medicamento(cod_medicamento: int):
    query = """
        SELECT CodMedicamento, Nome, PrincipioAtivo
        FROM Medicamento
        WHERE CodMedicamento = %s;
    """
    resultado = run_query(query, (cod_medicamento,))
    if not resultado:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado")
    return resultado


@router.post("/")
def criar_medicamento(data: MedicamentoCreate):
    query = """
        INSERT INTO Medicamento (Nome, PrincipioAtivo)
        VALUES (%s, %s)
        RETURNING CodMedicamento;
    """
    resultado = run_query(query, (data.nome, data.principioativo))
    return {
        "message": "Medicamento criado com sucesso",
        "codmedicamento": resultado[0]["codmedicamento"]
    }