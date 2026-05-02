from fastapi import HTTPException

from backend.repositories.internamentos_repository import (
    listar_internamentos,
    obter_internamento,
    criar_internamento,
    atualizar_internamento
)


TIPOS_ALTA_VALIDOS = {"clinica", "voluntaria", "transferencia", "obito"}


def get_internamentos_service():
    return listar_internamentos()


def get_internamento_service(cod_internamento: int):
    return obter_internamento(cod_internamento)


def create_internamento_service(data):
    if data.codepurgenc <= 0:
        raise HTTPException(status_code=400, detail="Código de episódio inválido.")

    if not data.motivoint or not data.motivoint.strip():
        raise HTTPException(status_code=400, detail="Motivo de internamento é obrigatório.")

    criado = criar_internamento(
        codepurgenc=data.codepurgenc,
        idfunc=data.idfunc,
        datahoraint=data.datahoraint,
        motivoint=data.motivoint.strip(),
        numerocama=data.numerocama,
        servico=data.servico
    )

    if not criado:
        raise HTTPException(status_code=500, detail="Erro ao criar internamento.")

    return criado


def update_internamento_service(cod_internamento: int, data):
    existente = obter_internamento(cod_internamento)
    if not existente:
        raise HTTPException(status_code=404, detail="Internamento não encontrado.")

    if not data.motivoint or not data.motivoint.strip():
        raise HTTPException(status_code=400, detail="Motivo de internamento é obrigatório.")

    if (data.datahoraalta is None and data.tipoalta is not None) or (data.datahoraalta is not None and data.tipoalta is None):
        raise HTTPException(
            status_code=400,
            detail="DataHoraAlta e TipoAlta devem ser ambos preenchidos ou ambos nulos."
        )

    if data.tipoalta is not None and data.tipoalta not in TIPOS_ALTA_VALIDOS:
        raise HTTPException(status_code=400, detail="Tipo de alta inválido.")

    atualizado = atualizar_internamento(
        cod_internamento=cod_internamento,
        codepurgenc=data.codepurgenc,
        idfunc=data.idfunc,
        datahoraconsulta=data.datahoraconsulta,
        datahoraalta=data.datahoraalta,
        motivoint=data.motivoint.strip(),
        numerocama=data.numerocama,
        servico=data.servico,
        tipoalta=data.tipoalta
    )

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar internamento.")

    return atualizado