from backend.dao import trabalha_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_func": row.get("id_func", row.get("idfunc")),
        "id_hosp": row.get("id_hosp", row.get("idhosp")),
        "ativo": row.get("ativo"),
    }


def listar_trabalhos():
    rows = trabalha_dao.select_all_trabalhos()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_trabalho(id_func: int, id_hosp: int):
    rows = trabalha_dao.select_trabalho_by_ids(id_func, id_hosp)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_trabalhos_por_funcionario(id_func: int):
    rows = trabalha_dao.select_trabalhos_by_funcionario(id_func)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def listar_trabalhos_por_hospital(id_hosp: int):
    rows = trabalha_dao.select_trabalhos_by_hospital(id_hosp)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_trabalho(data: dict):
    id_func = data["id_func"]
    id_hosp = data["id_hosp"]
    ativo = data.get("ativo", True)

    rows = trabalha_dao.insert_trabalho(id_func, id_hosp, ativo)
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_trabalho(id_func: int, id_hosp: int, data: dict):
    rows = trabalha_dao.update_trabalho(
        id_func,
        id_hosp,
        data.get("ativo"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_trabalho(id_func: int, id_hosp: int):
    rows = trabalha_dao.delete_trabalho(id_func, id_hosp)
    row = _first_or_none(rows)

    if row is None:
        return None

    return {
        "id_func": row["id_func"],
        "id_hosp": row["id_hosp"],
    }