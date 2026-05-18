from backend.dao import contexto_prescricao_dao


def _map_row(row):
    if row is None:
        return None
    return {
        "id_prescricao": row["idprescricao"],
        "id_ato": row["idato"],
        "cod_medicamento": row["codmedicamento"],
        "dosagem": row["dosagem"],
        "frequencia": row["frequencia"],
        "via_administracao": row["viaadministracao"],
        "duracao_dias": row["duracaodias"],
        "observacoes": row["observacoes"],
        "data_hora_presc": row["datahorapresc"],
        "estado_prescricao": row["estadoprescricao"],
        "score_risco_ia": row["scoreriscoia"],
        "cod_ep_urgenc": row["codepurgenc"],
        "nif": row["nif"],
        "id_hosp": row["idhosp"],
        "data_hora_entr": row["datahoraentr"],
        "substancia": row["substancia"],
        "classe_terapeutica": row["classeterapeutica"],
        "nivel_gravidade": row["nivelgravidade"],
    }


def get_all():
    rows = contexto_prescricao_dao.select_all_contexto_prescricao()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id_prescricao(id_prescricao: int):
    rows = contexto_prescricao_dao.select_contexto_prescricao_by_id_prescricao(id_prescricao)
    return [_map_row(row) for row in rows] if rows else []


def get_by_ato(id_ato: int):
    rows = contexto_prescricao_dao.select_contexto_prescricao_by_ato(id_ato)
    return [_map_row(row) for row in rows] if rows else []


def get_by_ep(cod_ep_urgenc: int):
    rows = contexto_prescricao_dao.select_contexto_prescricao_by_ep(cod_ep_urgenc)
    return [_map_row(row) for row in rows] if rows else []


def get_by_nif(nif: str):
    rows = contexto_prescricao_dao.select_contexto_prescricao_by_nif(nif)
    return [_map_row(row) for row in rows] if rows else []


def get_by_medicamento(cod_medicamento: int):
    rows = contexto_prescricao_dao.select_contexto_prescricao_by_medicamento(cod_medicamento)
    return [_map_row(row) for row in rows] if rows else []