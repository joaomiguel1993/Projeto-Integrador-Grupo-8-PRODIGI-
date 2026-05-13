from backend.dao import profissionais_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row[0],
        "nome": row[1],
        "tipo_func": row[2],
        "sexo": row[3],
        "email": row[4],
        "telefone": row[5],
        "biografia": row[6],
        "foto_url": row[7],
    }


def listar_profissionais():
    rows = profissionais_dao.select_all_profissionais()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_profissional_por_id(id_func: int):
    rows = profissionais_dao.select_profissional_by_id(id_func)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_profissionais_por_tipo(tipo_func: str):
    rows = profissionais_dao.select_profissionais_by_tipo(tipo_func)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_profissional(data: dict):
    rows = profissionais_dao.insert_profissional(
        data["nome"],
        data["tipo_func"],
        data["sexo"],
        data.get("email"),
        data.get("telefone"),
        data.get("biografia"),
        data.get("foto_url"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_profissional(id_func: int, data: dict):
    rows = profissionais_dao.update_profissional(
        id_func,
        data.get("nome"),
        data.get("tipo_func"),
        data.get("sexo"),
        data.get("email"),
        data.get("telefone"),
        data.get("biografia"),
        data.get("foto_url"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_profissional(id_func: int):
    rows = profissionais_dao.delete_profissional(id_func)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row[0]