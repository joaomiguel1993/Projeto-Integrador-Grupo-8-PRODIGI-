from backend.dao import hospitais_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "id_hosp": row[0],
        "nome": row[1],
        "localizacao": row[2],
        "email": row[3],
        "telefone": row[4],
        "total_camas": row[5],
    }


def listar_hospitais():
    rows = hospitais_dao.select_all_hospitais()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_hospital_por_id(id_hosp: int):
    rows = hospitais_dao.select_hospital_by_id(id_hosp)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_hospital(data: dict):
    nome = data["nome"]
    localizacao = data["localizacao"]

    email = None
    if "email" in data:
        email = data["email"]

    telefone = None
    if "telefone" in data:
        telefone = data["telefone"]

    total_camas = None
    if "total_camas" in data:
        total_camas = data["total_camas"]

    rows = hospitais_dao.insert_hospital(
        nome,
        localizacao,
        email,
        telefone,
        total_camas,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_hospital(id_hosp: int, data: dict):
    nome = None
    localizacao = None
    email = None
    telefone = None
    total_camas = None

    if "nome" in data:
        nome = data["nome"]

    if "localizacao" in data:
        localizacao = data["localizacao"]

    if "email" in data:
        email = data["email"]

    if "telefone" in data:
        telefone = data["telefone"]

    if "total_camas" in data:
        total_camas = data["total_camas"]

    rows = hospitais_dao.update_hospital(
        id_hosp,
        nome,
        localizacao,
        email,
        telefone,
        total_camas,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_hospital(id_hosp: int):
    rows = hospitais_dao.delete_hospital(id_hosp)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row[0]