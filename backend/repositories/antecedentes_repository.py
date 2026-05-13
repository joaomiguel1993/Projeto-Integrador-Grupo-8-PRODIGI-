from backend.dao import antecedentes_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_antecedente": row["codantecedente"],
        "nome": row["nome"],
        "tipo": row["tipo"],
    }


def listar_antecedentes():
    rows = antecedentes_dao.select_all_antecedentes()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_antecedente_por_id(cod_antecedente: int):
    rows = antecedentes_dao.select_antecedente_by_id(cod_antecedente)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_antecedente(data: dict):
    nome = data["nome"]

    tipo = None
    if "tipo" in data:
        tipo = data["tipo"]

    rows = antecedentes_dao.insert_antecedente(nome, tipo)
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_antecedente(cod_antecedente: int, data: dict):
    nome = None
    tipo = None

    if "nome" in data:
        nome = data["nome"]

    if "tipo" in data:
        tipo = data["tipo"]

    rows = antecedentes_dao.update_antecedente(cod_antecedente, nome, tipo)
    row = _first_or_none(rows)
    return _map_row(row)


def remover_antecedente(cod_antecedente: int):
    rows = antecedentes_dao.delete_antecedente(cod_antecedente)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codantecedente"]