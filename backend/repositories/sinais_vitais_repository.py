from backend.dao import sinais_vitais_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_sinal": row["idsinal"],
        "cod_ep_urgenc": row["codepurgenc"],
        "temperatura": row["temperatura"],
        "freq_card": row["freqcard"],
        "freq_resp": row["freqresp"],
        "sp_o2": row["spo2"],
        "sistolica": row["sistolica"],
        "diastolica": row["diastolica"],
        "nivel_dor": row["niveldor"],
        "data_hora": row["datahora"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = sinais_vitais_dao.select_all_sinais_vitais()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_sinal: int):
    return _map_row(_first_or_none(sinais_vitais_dao.select_sinal_by_id(id_sinal)))


def get_by_ep(cod_ep_urgenc: int):
    rows = sinais_vitais_dao.select_sinais_by_ep(cod_ep_urgenc)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = sinais_vitais_dao.select_sinais_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = sinais_vitais_dao.insert_sinal_vital(
        data["cod_ep_urgenc"],
        data.get("temperatura"),
        data.get("freq_card"),
        data.get("freq_resp"),
        data.get("sp_o2"),
        data.get("sistolica"),
        data.get("diastolica"),
        data.get("nivel_dor"),
        data.get("data_hora"),
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def update(id_sinal: int, data: dict):
    rows = sinais_vitais_dao.update_sinal_vital(id_sinal, **data)
    return _map_row(_first_or_none(rows))


def delete(id_sinal: int):
    rows = sinais_vitais_dao.delete_sinal_vital(id_sinal)
    row = _first_or_none(rows)
    return row["idsinal"] if row else None