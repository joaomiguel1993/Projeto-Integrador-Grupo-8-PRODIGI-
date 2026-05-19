from backend.dao import triagens_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_ep_urgenc":        row["codepurgenc"],
        "data_hora_inicio":     row["datahorainicio"],
        "data_hora_fim":        row["datahorafim"],
        "cor_triagem":          row["cortriagem"],
        "sintomas":             row["sintomas"],
        "temperatura":          row["temperatura"],
        "freq_card":            row["freqcard"],
        "freq_resp":            row["freqresp"],
        "sp_o2":                row["spo2"],
        "sistolica":            row["sistolica"],
        "diastolica":           row["diastolica"],
        "nivel_dor":            row["niveldor"],
        "consciencia":          row["consciencia"],
        "tempo_espera_previsto": row["tempoesperaprevisto"],
        "id_func":              row.get("idfunc"),
        "nome_enfermeiro":      row.get("nome_enfermeiro"),
        "nome_utente":          row.get("nome_utente"),
        "num_utent":            row.get("num_utent"),
        "estado_episodio":      row.get("estado_episodio"),
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
        data.get("id_func"),
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
        data.get("id_func"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_triagem(cod_ep_urgenc: int):
    rows = triagens_dao.delete_triagem(cod_ep_urgenc)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codepurgenc"]


def listar_triagens_por_hospital(idhosp: int):
    rows = triagens_dao.select_triagens_by_hospital(idhosp)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]