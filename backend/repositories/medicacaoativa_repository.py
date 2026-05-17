from backend.dao import medicacaoativa_dao


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _map_row(row):
    if row is None:
        return None

    return {
        "cod_medicacao_ativa": row["codmedicacaoativa"],
        "num_utent":           row["numutent"],
        "cod_medicamento":     row["codmedicamento"],
        "data_inicio":         row["datainicio"],
        "data_fim":            row["datafim"],
        "dosagem":             row["dosagem"],
        "nome_medicamento":    row.get("nome_medicamento"),
        "principio_ativo":     row.get("principio_ativo"),
    }


def listar_medicacoes_ativas():
    rows = medicacaoativa_dao.select_all_medicacoes_ativas()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_medicacao_ativa_por_id(cod_medicacao_ativa: int):
    rows = medicacaoativa_dao.select_medicacao_ativa_by_id(cod_medicacao_ativa)
    row = _first_or_none(rows)
    return _map_row(row)


def listar_medicacoes_ativas_por_utente(num_utent: int):
    rows = medicacaoativa_dao.select_medicacoes_ativas_by_utente(num_utent)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_medicacao_ativa(data: dict):
    num_utent = data["num_utent"]
    cod_medicamento = data["cod_medicamento"]
    data_inicio = data["data_inicio"]

    data_fim = data.get("data_fim")
    dosagem = data.get("dosagem")

    rows = medicacaoativa_dao.insert_medicacao_ativa(
        num_utent,
        cod_medicamento,
        data_inicio,
        data_fim,
        dosagem,
    )
    row = _first_or_none(rows)
    return _map_row(row)


def atualizar_medicacao_ativa(cod_medicacao_ativa: int, data: dict):
    rows = medicacaoativa_dao.update_medicacao_ativa(
        cod_medicacao_ativa,
        data.get("data_fim"),
        data.get("dosagem"),
    )
    row = _first_or_none(rows)
    return _map_row(row)


def remover_medicacao_ativa(cod_medicacao_ativa: int):
    rows = medicacaoativa_dao.delete_medicacao_ativa(cod_medicacao_ativa)
    row = _first_or_none(rows)

    if row is None:
        return None

    return row["codmedicacaoativa"]