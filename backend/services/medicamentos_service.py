from fastapi import HTTPException

from backend.repositories.medicamentos_repository import (
    listar_medicamentos,
    obter_medicamento,
    criar_medicamento,
    atualizar_medicamento
)


def get_medicamentos_service():
    return listar_medicamentos()


def get_medicamento_service(cod_medicamento: int):
    return obter_medicamento(cod_medicamento)


def create_medicamento_service(nome: str, principioativo: str):
    if not nome or not nome.strip():
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")

    if not principioativo or not principioativo.strip():
        raise HTTPException(status_code=400, detail="Princípio ativo é obrigatório.")

    criado = criar_medicamento(
        nome=nome.strip(),
        principioativo=principioativo.strip()
    )

    if not criado:
        raise HTTPException(status_code=500, detail="Erro ao criar medicamento.")

    return criado


def update_medicamento_service(cod_medicamento: int, nome: str, principioativo: str):
    existente = obter_medicamento(cod_medicamento)
    if not existente:
        raise HTTPException(status_code=404, detail="Medicamento não encontrado.")

    if not nome or not nome.strip():
        raise HTTPException(status_code=400, detail="Nome é obrigatório.")

    if not principioativo or not principioativo.strip():
        raise HTTPException(status_code=400, detail="Princípio ativo é obrigatório.")

    atualizado = atualizar_medicamento(
        cod_medicamento=cod_medicamento,
        nome=nome.strip(),
        principioativo=principioativo.strip()
    )

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar medicamento.")

    return atualizado