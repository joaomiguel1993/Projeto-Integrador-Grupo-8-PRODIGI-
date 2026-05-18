from backend.dao import reavaliacao_triagem_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_reavaliacao": row["idreavaliacao"],
        "cod_ep_urgenc": row["codepurgenc"],
        "data_hora": row["datahora"],
        "temperatura": row["temperatura"],
        "freq_card": row["freqcard"],
        "freq_resp": row["freqresp"],
        "sp_o2": row["spo2"],
        "nivel_dor": row["niveldor"],
        "observacoes": row["observacoes"],
        "nova_cor_triagem": row["novacortriagem"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = reavaliacao_triagem_dao.select_all_reavaliacoes()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_reavaliacao: int):
    return _map_row(_first_or_none(reavaliacao_triagem_dao.select_reavaliacao_by_id(id_reavaliacao)))


def get_by_ep(cod_ep_urgenc: int):
    rows = reavaliacao_triagem_dao.select_reavaliacoes_by_ep(cod_ep_urgenc)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = reavaliacao_triagem_dao.select_reavaliacoes_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = reavaliacao_triagem_dao.insert_reavaliacao_triagem(
        data["cod_ep_urgenc"],
        data.get("data_hora"),
        data.get("temperatura"),
        data.get("freq_card"),
        data.get("freq_resp"),
        data.get("sp_o2"),
        data.get("nivel_dor"),
        data.get("observacoes"),
        data.get("nova_cor_triagem"),
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def update(id_reavaliacao: int, data: dict):
    rows = reavaliacao_triagem_dao.update_reavaliacao_triagem(id_reavaliacao, **data)
    return _map_row(_first_or_none(rows))


def delete(id_reavaliacao: int):
    rows = reavaliacao_triagem_dao.delete_reavaliacao_triagem(id_reavaliacao)
    row = _first_or_none(rows)
    return row["idreavaliacao"] if row else None