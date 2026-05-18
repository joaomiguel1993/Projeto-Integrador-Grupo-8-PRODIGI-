from backend.dao import predicao_ia_dao


def _first_or_none(rows):
    return rows[0] if rows else None


def _map_row(row):
    if row is None:
        return None
    return {
        "id_predicao": row["idpredicao"],
        "tipo_modelo": row["tipomodelo"],
        "entidade": row["entidade"],
        "entidade_id": row["entidadeid"],
        "input_json": row["inputjson"],
        "output_json": row["outputjson"],
        "score": row["score"],
        "modelo_versao": row["modeloversao"],
        "sucesso": row["sucesso"],
        "erro_mensagem": row["erromensagem"],
        "criado_em": row["criadoem"],
    }


def get_all():
    rows = predicao_ia_dao.select_all_predicoes()
    return [_map_row(row) for row in rows] if rows else []


def get_by_id(id_predicao: int):
    return _map_row(_first_or_none(predicao_ia_dao.select_predicao_by_id(id_predicao)))


def get_by_tipo_modelo(tipo_modelo: str):
    rows = predicao_ia_dao.select_predicoes_by_tipo_modelo(tipo_modelo)
    return [_map_row(row) for row in rows] if rows else []


def get_by_entidade(entidade: str):
    rows = predicao_ia_dao.select_predicoes_by_entidade(entidade)
    return [_map_row(row) for row in rows] if rows else []


def get_by_entidade_id(entidade: str, entidade_id: int):
    rows = predicao_ia_dao.select_predicoes_by_entidade_id(entidade, entidade_id)
    return [_map_row(row) for row in rows] if rows else []


def get_by_sucesso(sucesso: bool):
    rows = predicao_ia_dao.select_predicoes_by_sucesso(sucesso)
    return [_map_row(row) for row in rows] if rows else []


def create(data: dict):
    rows = predicao_ia_dao.insert_predicao_ia(
        data["tipo_modelo"],
        data["entidade"],
        data["entidade_id"],
        data["input_json"],
        data["output_json"],
        data.get("score"),
        data["modelo_versao"],
        data.get("sucesso", True),
        data.get("erro_mensagem"),
        data.get("criado_em"),
    )
    return _map_row(_first_or_none(rows))


def update(id_predicao: int, data: dict):
    rows = predicao_ia_dao.update_predicao_ia(id_predicao, **data)
    return _map_row(_first_or_none(rows))


def delete(id_predicao: int):
    rows = predicao_ia_dao.delete_predicao_ia(id_predicao)
    row = _first_or_none(rows)
    return row["idpredicao"] if row else None