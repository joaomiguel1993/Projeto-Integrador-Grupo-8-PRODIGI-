from backend.dao import episodios_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_ep_urgenc": row["codepurgenc"],
        "num_utent": row["numutent"],
        "id_hosp": row["idhosp"],
        "data_hora_entr": row["datahoraentr"],
        "data_hora_atendimento": row["datahoraatendimento"],
        "data_hora_saida": row["datahorasaida"],
        "estado": row["estado"],
    }


def listar_episodios():
    rows = episodios_dao.select_all_episodios()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_episodio_por_id(cod_ep_urgenc: int):
    rows = episodios_dao.select_episodio_by_id(cod_ep_urgenc)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_episodios_por_utente(num_utent: int):
    rows = episodios_dao.select_episodios_by_utente(num_utent)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def listar_episodios_por_hospital(id_hosp: int):
    rows = episodios_dao.select_episodios_by_hospital(id_hosp)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_episodio(data: dict):
    num_utent = data["num_utent"]
    id_hosp = data["id_hosp"]

    data_hora_entr = None
    if "data_hora_entr" in data:
        data_hora_entr = data["data_hora_entr"]

    estado = "aberto"
    if "estado" in data:
        estado = data["estado"]

    rows = episodios_dao.insert_episodio(
        num_utent,
        id_hosp,
        data_hora_entr,
        estado,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_episodio(cod_ep_urgenc: int, data: dict):
    id_hosp = None
    data_hora_atendimento = None
    data_hora_saida = None
    estado = None

    if "id_hosp" in data:
        id_hosp = data["id_hosp"]

    if "data_hora_atendimento" in data:
        data_hora_atendimento = data["data_hora_atendimento"]

    if "data_hora_saida" in data:
        data_hora_saida = data["data_hora_saida"]

    if "estado" in data:
        estado = data["estado"]

    rows = episodios_dao.update_episodio(
        cod_ep_urgenc,
        id_hosp,
        data_hora_atendimento,
        data_hora_saida,
        estado,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_episodio(cod_ep_urgenc: int):
    rows = episodios_dao.delete_episodio(cod_ep_urgenc)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codepurgenc"]


def listar_episodios_sem_triagem(id_hosp: int = None):
    rows = episodios_dao.select_episodios_sem_triagem(id_hosp)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]