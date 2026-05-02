from fastapi import HTTPException

from backend.repositories.episodios_repository import (
    listar_episodios,
    obter_episodio,
    criar_episodio,
    atualizar_episodio
)


ESTADOS_VALIDOS = {"aberto", "em_triagem", "em_atendimento", "internado", "terminado"}


def get_episodios_service():
    return listar_episodios()


def get_episodio_service(cod_ep_urgenc: int):
    return obter_episodio(cod_ep_urgenc)


def criar_episodio_service(data):
    if data.numutent <= 0:
        raise HTTPException(status_code=400, detail="Número de utente inválido.")

    if data.idhosp <= 0:
        raise HTTPException(status_code=400, detail="Hospital inválido.")

    criado = criar_episodio(data.numutent, data.idhosp)

    if not criado:
        raise HTTPException(status_code=500, detail="Erro ao criar episódio.")

    return criado


def atualizar_episodio_service(cod_ep_urgenc: int, data):
    existente = obter_episodio(cod_ep_urgenc)
    if not existente:
        raise HTTPException(status_code=404, detail="Episódio não encontrado.")

    if data.numutent <= 0:
        raise HTTPException(status_code=400, detail="Número de utente inválido.")

    if data.idhosp <= 0:
        raise HTTPException(status_code=400, detail="Hospital inválido.")

    if data.estado not in ESTADOS_VALIDOS:
        raise HTTPException(status_code=400, detail="Estado de episódio inválido.")

    atualizado = atualizar_episodio(
        cod_ep_urgenc=cod_ep_urgenc,
        num_utente=data.numutent,
        id_hosp=data.idhosp,
        datahora_saida=data.datahorasaida,
        estado=data.estado
    )

    if not atualizado:
        raise HTTPException(status_code=500, detail="Erro ao atualizar episódio.")

    return atualizado