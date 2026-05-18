from backend.dao import alerta_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_alerta": row["codalerta"],
        "id_prescricao": row["idprescricao"],
        "id_func": row["idfunc"],
        "tipo": row["tipo"],
        "data_hor_alerta": row["datahoralerta"],
        "ignorado": row["ignorado"],
        "justificacao": row["justificacao"],
        "severidade": row["severidade"],
        "score_risco": row["scorerisco"],
        "resolvido": row["resolvido"],
        "resolvido_em": row["resolvidoem"],
        "resolvido_por": row["resolvidopor"],
        "mensagem_ia": row["mensagemia"],
        "recomendacao": row["recomendacao"],
    }


def get_all():
    rows = alerta_dao.select_all_alertas()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(cod_alerta: int):
    return _map_row(_first_or_none(alerta_dao.select_alerta_by_id(cod_alerta)))


def get_by_prescricao(id_prescricao: int):
    rows = alerta_dao.select_alertas_by_prescricao(id_prescricao)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = alerta_dao.select_alertas_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def get_by_severidade(severidade: str):
    rows = alerta_dao.select_alertas_by_severidade(severidade)
    return [_map_row(row) for row in rows] if rows else []


def get_by_resolvido(resolvido: bool):
    rows = alerta_dao.select_alertas_resolvidos(resolvido)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = alerta_dao.insert_alerta(
        data["id_prescricao"],
        data.get("id_func"),
        data["tipo"],
        data.get("data_hor_alerta"),
        data.get("ignorado", False),
        data.get("justificacao"),
        data.get("severidade", "moderado"),
        data.get("score_risco"),
        data.get("resolvido", False),
        data.get("resolvido_em"),
        data.get("resolvido_por"),
        data.get("mensagem_ia"),
        data.get("recomendacao"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_alerta: int, data: dict):
    rows = alerta_dao.update_alerta(cod_alerta, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_alerta: int):
    rows = alerta_dao.delete_alerta(cod_alerta)
    row = _first_or_none(rows)
    return row["codalerta"] if row else None