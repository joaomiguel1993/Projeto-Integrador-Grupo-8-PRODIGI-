from backend.dao import alergias_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_alergia": row["codalergia"],
        "num_utent": row["numutent"],
        "substancia": row["substancia"],
        "classe_terapeutica_id": row["classeterapeuticaid"],
        "nivel_gravidade": row["nivelgravidade"],
        "data_registo": row["dataregisto"],
    }


def get_todas_utente(num_utent: int):
    rows = alergias_dao.select_all_alergias(num_utent)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def get_por_id(cod_alergia: int):
    rows = alergias_dao.select_alergia_by_id(cod_alergia)
    row = _first_or_none(rows)
    return _map_row(row)


def get_estatisticas_ia():
    rows = alergias_dao.select_alergias_stats()
    if rows is None:
        return []

    resultado = []
    for row in rows:
        resultado.append({
            "classe_terapeutica_id": row["classeterapeuticaid"],
            "nivel_gravidade": row["nivelgravidade"],
            "total": row["total"],
            "utentes_afetados": row["utentes_afetados"],
        })
    return resultado


def create(data: dict):
    num_utent = data["num_utent"]
    substancia = data["substancia"]
    classe_terapeutica_id = data["classe_terapeutica_id"]
    nivel_gravidade = None
    if "nivel_gravidade" in data:
        nivel_gravidade = data["nivel_gravidade"]

    rows = alergias_dao.insert_alergia(
        num_utent,
        substancia,
        classe_terapeutica_id,
        nivel_gravidade,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def update(cod_alergia: int, data: dict):
    substancia = None
    classeterapeuticaid = None
    nivelgravidade = None

    if "substancia" in data:
        substancia = data["substancia"]

    if "classe_terapeutica_id" in data:
        classeterapeuticaid = data["classe_terapeutica_id"]

    if "nivel_gravidade" in data:
        nivelgravidade = data["nivel_gravidade"]

    rows = alergias_dao.update_alergia(
        cod_alergia,
        substancia,
        classeterapeuticaid,
        nivelgravidade,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def delete(cod_alergia: int):
    rows = alergias_dao.delete_alergia(cod_alergia)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codalergia"]