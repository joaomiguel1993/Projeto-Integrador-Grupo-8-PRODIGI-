from backend.dao import log_atividade_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_log": row["idlog"],
        "username": row["username"],
        "acao": row["acao"],
        "detalhe": row["detalhe"],
        "ip": row["ip"],
        "criado_em": row["criado_em"],
    }


def get_all():
    rows = log_atividade_dao.select_all_logs_atividade()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_log: int):
    return _map_row(_first_or_none(log_atividade_dao.select_log_atividade_by_id(id_log)))


def get_by_username(username: str):
    rows = log_atividade_dao.select_logs_atividade_by_username(username)
    return [_map_row(row) for row in rows] if rows else []


def get_by_acao(acao: str):
    rows = log_atividade_dao.select_logs_atividade_by_acao(acao)
    return [_map_row(row) for row in rows] if rows else []


def get_by_ip(ip: str):
    rows = log_atividade_dao.select_logs_atividade_by_ip(ip)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = log_atividade_dao.insert_log_atividade(
        data.get("username"),
        data.get("acao"),
        data.get("detalhe"),
        data.get("ip"),
        data.get("criado_em"),
    )
    return _map_row(_first_or_none(rows))


def update(id_log: int, data: dict):
    rows = log_atividade_dao.update_log_atividade(id_log, **data)
    return _map_row(_first_or_none(rows))


def delete(id_log: int):
    rows = log_atividade_dao.delete_log_atividade(id_log)
    row = _first_or_none(rows)
    return row["idlog"] if row else None