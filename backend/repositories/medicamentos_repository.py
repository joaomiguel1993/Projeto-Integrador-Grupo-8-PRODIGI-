from backend.dao import medicamentos_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_medicamento": row["codmedicamento"],
        "nome": row["nome"],
        "principio_ativo": row["principioativo"],
        "classe_terapeutica_id": row["classeterapeuticaid"],
    }


def listar_medicamentos():
    rows = medicamentos_dao.select_all_medicamentos()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_medicamento_por_id(cod_medicamento: int):
    rows = medicamentos_dao.select_medicamento_by_id(cod_medicamento)
    row = _first_or_none(rows)
    return _map_row(row)


def criar_medicamento(data: dict):
    nome = data["nome"]
    principio_ativo = data["principio_ativo"]
    classe_terapeutica_id = data["classe_terapeutica_id"]

    rows = medicamentos_dao.insert_medicamento(
        nome,
        principio_ativo,
        classe_terapeutica_id,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_medicamento(cod_medicamento: int, data: dict):
    rows = medicamentos_dao.update_medicamento(
        cod_medicamento,
        data.get("nome"),
        data.get("principio_ativo"),
        data.get("classe_terapeutica_id"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_medicamento(cod_medicamento: int):
    rows = medicamentos_dao.delete_medicamento(cod_medicamento)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codmedicamento"]