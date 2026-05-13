from backend.dao import alerta_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


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
    }


def listar_alertas():
    rows = alerta_dao.select_all_alertas()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_alerta_por_id(cod_alerta: int):
    rows = alerta_dao.select_alerta_by_id(cod_alerta)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_alertas_por_prescricao(id_prescricao: int):
    rows = alerta_dao.select_alertas_by_prescricao(id_prescricao)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_alerta(data: dict):
    rows = alerta_dao.insert_alerta(
        data["id_prescricao"],
        data.get("id_func"),
        data["tipo"],
        data.get("justificacao"),
        data.get("severidade", "moderado"),
        data.get("score_risco"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_alerta(cod_alerta: int, data: dict):
    rows = alerta_dao.update_alerta(
        cod_alerta,
        data.get("id_func"),
        data.get("tipo"),
        data.get("ignorado"),
        data.get("justificacao"),
        data.get("severidade"),
        data.get("score_risco"),
        data.get("resolvido"),
        data.get("resolvido_em"),
        data.get("resolvido_por"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def marcar_alerta_resolvido(cod_alerta: int, resolvido_por: int):
    rows = alerta_dao.resolver_alerta(cod_alerta, resolvido_por)
    row = _first_or_none(rows)
    return _map_row(row)


def remover_alerta(cod_alerta: int):
    rows = alerta_dao.delete_alerta(cod_alerta)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codalerta"]