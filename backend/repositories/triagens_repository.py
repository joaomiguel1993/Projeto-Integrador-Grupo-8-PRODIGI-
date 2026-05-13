from backend.dao import triagens_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_ep_urgenc": row[0],
        "data_hora_inicio": row[1],
        "data_hora_fim": row[2],
        "cor_triagem": row[3],
        "sintomas": row[4],
        "temperatura": row[5],
        "freq_card": row[6],
        "freq_resp": row[7],
        "sp_o2": row[8],
        "sistolica": row[9],
        "diastolica": row[10],
        "nivel_dor": row[11],
        "consciencia": row[12],
        "tempo_espera_previsto": row[13],
    }


def listar_triagens():
    rows = triagens_dao.select_all_triagens()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_triagem_por_episodio(cod_ep_urgenc: int):
    rows = triagens_dao.select_triagem_by_episodio(cod_ep_urgenc)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_triagem(data: dict):
    rows = triagens_dao.insert_triagem(
        data["cod_ep_urgenc"],
        data["data_hora_inicio"],
        data["cor_triagem"],
        data["sintomas"],
        data.get("data_hora_fim"),
        data.get("temperatura"),
        data.get("freq_card"),
        data.get("freq_resp"),
        data.get("sp_o2"),
        data.get("sistolica"),
        data.get("diastolica"),
        data.get("nivel_dor"),
        data.get("consciencia"),
        data.get("tempo_espera_previsto"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_triagem(cod_ep_urgenc: int, data: dict):
    rows = triagens_dao.update_triagem(
        cod_ep_urgenc,
        data.get("data_hora_fim"),
        data.get("cor_triagem"),
        data.get("sintomas"),
        data.get("temperatura"),
        data.get("freq_card"),
        data.get("freq_resp"),
        data.get("sp_o2"),
        data.get("sistolica"),
        data.get("diastolica"),
        data.get("nivel_dor"),
        data.get("consciencia"),
        data.get("tempo_espera_previsto"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_triagem(cod_ep_urgenc: int):
    rows = triagens_dao.delete_triagem(cod_ep_urgenc)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row[0]