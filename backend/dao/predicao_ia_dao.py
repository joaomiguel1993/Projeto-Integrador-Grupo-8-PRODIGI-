import json
from backend.db import run_query


def select_all_predicoes():
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        ORDER BY criadoem DESC, idpredicao DESC
    """)


def select_predicao_by_id(id_predicao: int):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE idpredicao = %s
    """, (id_predicao,))


def select_predicoes_by_tipo_modelo(tipo_modelo: str):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE tipomodelo = %s
        ORDER BY criadoem DESC, idpredicao DESC
    """, (tipo_modelo,))


def select_predicoes_by_entidade(entidade: str):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE entidade = %s
        ORDER BY criadoem DESC, idpredicao DESC
    """, (entidade,))


def select_predicoes_by_entidade_id(entidade: str, entidade_id: int):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE entidade = %s AND entidadeid = %s
        ORDER BY criadoem DESC, idpredicao DESC
    """, (entidade, entidade_id))


def select_predicoes_by_sucesso(sucesso: bool):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE sucesso = %s
        ORDER BY criadoem DESC, idpredicao DESC
    """, (sucesso,))


def insert_predicao_ia(
    tipo_modelo, entidade, entidade_id, input_json, output_json, score=None,
    modelo_versao=None, sucesso=True, erro_mensagem=None, criado_em=None
):
    return run_query("""
        INSERT INTO predicaoia (
            tipomodelo, entidade, entidadeid, inputjson, outputjson, score,
            modeloversao, sucesso, erromensagem, criadoem
        )
        VALUES (
            %s, %s, %s, %s::jsonb, %s::jsonb, %s, %s, %s, %s, COALESCE(%s, NOW())
        )
        RETURNING idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
                  score, modeloversao, sucesso, erromensagem, criadoem
    """, (
        tipo_modelo,
        entidade,
        entidade_id,
        json.dumps(input_json),
        json.dumps(output_json),
        score,
        modelo_versao,
        sucesso,
        erro_mensagem,
        criado_em
    ))


def update_predicao_ia(id_predicao: int, **data):
    campos = []
    valores = []

    mapping = {
        "tipo_modelo": "tipomodelo",
        "entidade": "entidade",
        "entidade_id": "entidadeid",
        "score": "score",
        "modelo_versao": "modeloversao",
        "sucesso": "sucesso",
        "erro_mensagem": "erromensagem",
        "criado_em": "criadoem",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if "input_json" in data and data["input_json"] is not None:
        campos.append("inputjson = %s::jsonb")
        valores.append(json.dumps(data["input_json"]))

    if "output_json" in data and data["output_json"] is not None:
        campos.append("outputjson = %s::jsonb")
        valores.append(json.dumps(data["output_json"]))

    if not campos:
        return select_predicao_by_id(id_predicao)

    valores.append(id_predicao)

    query = f"""
        UPDATE predicaoia
        SET {', '.join(campos)}
        WHERE idpredicao = %s
        RETURNING idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
                  score, modeloversao, sucesso, erromensagem, criadoem
    """
    return run_query(query, tuple(valores))


def delete_predicao_ia(id_predicao: int):
    return run_query("""
        DELETE FROM predicaoia
        WHERE idpredicao = %s
        RETURNING idpredicao
    """, (id_predicao,))