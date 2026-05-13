from backend.dao import atos_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_ato": row["idato"],
        "cod_ep_urgenc": row["codepurgenc"],
        "tipo": row["tipo"],
        "descricao": row["descricao"],
        "data_hora_inicio": row["datahorainicio"],
        "data_hora_fim": row["datahorafim"],
    }


def listar_atos():
    rows = atos_dao.select_all_atos()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_ato_por_id(id_ato: int):
    rows = atos_dao.select_ato_by_id(id_ato)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_atos_por_episodio(cod_ep_urgenc: int):
    rows = atos_dao.select_atos_by_episodio(cod_ep_urgenc)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_ato(data: dict):
    cod_ep_urgenc = data["cod_ep_urgenc"]
    tipo = data["tipo"]
    data_hora_inicio = data["data_hora_inicio"]

    descricao = None
    if "descricao" in data:
        descricao = data["descricao"]

    data_hora_fim = None
    if "data_hora_fim" in data:
        data_hora_fim = data["data_hora_fim"]

    rows = atos_dao.insert_ato(
        cod_ep_urgenc,
        tipo,
        descricao,
        data_hora_inicio,
        data_hora_fim,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_ato(id_ato: int, data: dict):
    tipo = None
    descricao = None
    data_hora_inicio = None
    data_hora_fim = None

    if "tipo" in data:
        tipo = data["tipo"]

    if "descricao" in data:
        descricao = data["descricao"]

    if "data_hora_inicio" in data:
        data_hora_inicio = data["data_hora_inicio"]

    if "data_hora_fim" in data:
        data_hora_fim = data["data_hora_fim"]

    rows = atos_dao.update_ato(
        id_ato,
        tipo,
        descricao,
        data_hora_inicio,
        data_hora_fim,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_ato(id_ato: int):
    rows = atos_dao.delete_ato(id_ato)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["idato"]