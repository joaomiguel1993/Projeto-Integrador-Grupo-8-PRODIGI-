from backend.dao import estatisticas_ia_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_hosp": row["idhosp"],
        "hospital_nome": row["hospitalnome"],
        "facility_size_beds": row["facility_size_beds"],
        "contagem_enfermeiros": row["contagem_enfermeiros"],
        "contagem_medicos": row["contagem_medicos"],
        "pacientes_ativos": row["pacientes_ativos"],
    }


def get_all():
    rows = estatisticas_ia_dao.select_all_estatisticas_ia()
    return [_map_row(row) for row in rows] if rows else []


def get_by_hospital(id_hosp: int):
    return _map_row(_first_or_none(
        estatisticas_ia_dao.select_estatisticas_ia_by_hospital(id_hosp)
    ))