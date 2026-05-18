from backend.dao import ep_urgencia_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_ep_urgenc": row["codepurgenc"],
        "nif": row["nif"],
        "id_hosp": row["idhosp"],
        "data_hora_entr": row["datahoraentr"],
        "data_hora_atendimento": row["datahoraatendimento"],
        "data_hora_saida": row["datahorasaida"],
        "estado": row["estado"],
        "prioridade_atual": row["prioridadeatual"],
        "tempo_espera_atual": row["tempoesperaatual"],
        "em_observacao": row["emobservacao"],
        "destino_final": row["destinofinal"],
    }


def get_all():
    rows = ep_urgencia_dao.select_all_ep_urgencia()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_ep_urgenc: int):
    return _map_row(_first_or_none(ep_urgencia_dao.select_ep_urgencia_by_id(cod_ep_urgenc)))


def get_by_nif(nif: str):
    rows = ep_urgencia_dao.select_ep_urgencia_by_nif(nif)
    return [_map_row(row) for row in rows] if rows else []


def get_by_hospital(id_hosp: int):
    rows = ep_urgencia_dao.select_ep_urgencia_by_hospital(id_hosp)
    return [_map_row(row) for row in rows] if rows else []


def get_by_estado(estado: str):
    rows = ep_urgencia_dao.select_ep_urgencia_by_estado(estado)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = ep_urgencia_dao.insert_ep_urgencia(
        data["nif"],
        data["id_hosp"],
        data.get("data_hora_entr"),
        data.get("data_hora_atendimento"),
        data.get("data_hora_saida"),
        data.get("estado", "aberto"),
        data.get("prioridade_atual"),
        data.get("tempo_espera_atual"),
        data.get("em_observacao", False),
        data.get("destino_final"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_ep_urgenc: int, data: dict):
    rows = ep_urgencia_dao.update_ep_urgencia(cod_ep_urgenc, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_ep_urgenc: int):
    rows = ep_urgencia_dao.delete_ep_urgencia(cod_ep_urgenc)
    row = _first_or_none(rows)
    return row["codepurgenc"] if row else None