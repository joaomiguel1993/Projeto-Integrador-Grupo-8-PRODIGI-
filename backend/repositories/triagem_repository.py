from backend.dao import triagem_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "cod_ep_urgenc": row["codepurgenc"],
        "data_hora_inicio": row["datahorainicio"],
        "data_hora_fim": row["datahorafim"],
        "cor_triagem": row["cortriagem"],
        "queixa_principal": row["queixaprincipal"],
        "via_aerea": row["viaaerea"],
        "respiracao_circulacao": row["respiracaocirculacao"],
        "hemorragia": row["hemorragia"],
        "consciencia": row["consciencia"],
        "estado_pele": row["estadopele"],
        "mobilidade": row["mobilidade"],
        "tipo_dor": row["tipodor"],
        "dor_localizacao": row["dorlocalizacao"],
        "sintomas": row["sintomas"],
        "observacoes_clinicas": row["observacoesclinicas"],
        "tempo_inicio_sintomas": row["tempoiniciosintomas"],
        "escala_glasgow": row["escalaglasgow"],
        "isolamento": row["isolamento"],
        "gravida": row["gravida"],
        "temperatura": row["temperatura"],
        "freq_card": row["freqcard"],
        "freq_resp": row["freqresp"],
        "sp_o2": row["spo2"],
        "sistolica": row["sistolica"],
        "diastolica": row["diastolica"],
        "nivel_dor": row["niveldor"],
        "tempo_espera_previsto": row["tempoesperaprevisto"],
        "id_func": row["idfunc"],
    }


def get_all():
    rows = triagem_dao.select_all_triagens()
    return [_map_row(row) for row in rows] if rows else []


def get_by_ep(cod_ep_urgenc: int):
    return _map_row(_first_or_none(triagem_dao.select_triagem_by_ep(cod_ep_urgenc)))


def get_by_cor(cor_triagem: str):
    rows = triagem_dao.select_triagens_by_cor(cor_triagem)
    return [_map_row(row) for row in rows] if rows else []


def get_by_funcionario(id_func: int):
    rows = triagem_dao.select_triagens_by_funcionario(id_func)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = triagem_dao.insert_triagem(
        data["cod_ep_urgenc"],
        data["data_hora_inicio"],
        data.get("data_hora_fim"),
        data["cor_triagem"],
        data["queixa_principal"],
        data["via_aerea"],
        data["respiracao_circulacao"],
        data["hemorragia"],
        data["consciencia"],
        data.get("estado_pele"),
        data.get("mobilidade"),
        data.get("tipo_dor"),
        data.get("dor_localizacao"),
        data["sintomas"],
        data.get("observacoes_clinicas"),
        data.get("tempo_inicio_sintomas"),
        data.get("escala_glasgow"),
        data.get("isolamento", False),
        data.get("gravida", False),
        data.get("temperatura"),
        data.get("freq_card"),
        data.get("freq_resp"),
        data.get("sp_o2"),
        data.get("sistolica"),
        data.get("diastolica"),
        data.get("nivel_dor"),
        data.get("tempo_espera_previsto"),
        data.get("id_func"),
    )
    return _map_row(_first_or_none(rows))


def update(cod_ep_urgenc: int, data: dict):
    rows = triagem_dao.update_triagem(cod_ep_urgenc, **data)
    return _map_row(_first_or_none(rows))


def delete(cod_ep_urgenc: int):
    rows = triagem_dao.delete_triagem(cod_ep_urgenc)
    row = _first_or_none(rows)
    return row["codepurgenc"] if row else None