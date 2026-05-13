from backend.dao import predicao_ia_dao
import json


def _first_or_none(rows):
    if rows is None or len(rows) == 0:
        return None
    return rows[0]


def _parse_json_field(value):
    if value is None:
        return None

    if isinstance(value, dict):
        return value

    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return value

    return value


def _map_row(row):
    if row is None:
        return None

    return {
        "id_predicao": row[0],
        "tipo_modelo": row[1],
        "entidade": row[2],
        "entidade_id": row[3],
        "input_json": _parse_json_field(row[4]),
        "output_json": _parse_json_field(row[5]),
        "score": row[6],
        "modelo_versao": row[7],
        "sucesso": row[8],
        "erro_mensagem": row[9],
        "criado_em": row[10],
    }


def listar_predicoes():
    rows = predicao_ia_dao.select_all_predicoes()
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def obter_predicao_por_id(id_predicao: int):
    rows = predicao_ia_dao.select_predicao_by_id(id_predicao)
    row = _first_or_none(rows)
    return _map_row(row)


def obter_predicoes_por_entidade(entidade: str, entidade_id: int):
    rows = predicao_ia_dao.select_predicoes_by_entidade(entidade, entidade_id)
    if rows is None:
        return []
    return [_map_row(row) for row in rows]


def criar_predicao(data: dict):
    rows = predicao_ia_dao.insert_predicao(
        data["tipo_modelo"],
        data["entidade"],
        data["entidade_id"],
        data["input_json"],
        data["output_json"],
        data.get("score"),
        data["modelo_versao"],
        data.get("sucesso", True),
        data.get("erro_mensagem"),
    )
    row = _first_or_none(rows)
    return _map_row(row)