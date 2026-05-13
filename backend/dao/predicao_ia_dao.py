from backend.db import run_query
import json


def select_all_predicoes():
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        ORDER BY idpredicao DESC
    """)


def select_predicao_by_id(id_predicao: int):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE idpredicao = %s
    """, (id_predicao,))


def select_predicoes_by_entidade(entidade: str, entidade_id: int):
    return run_query("""
        SELECT idpredicao, tipomodelo, entidade, entidadeid, inputjson, outputjson,
               score, modeloversao, sucesso, erromensagem, criadoem
        FROM predicaoia
        WHERE entidade = %s AND entidadeid = %s
        ORDER BY idpredicao DESC
    """, (entidade, entidade_id))


def insert_predicao(
    tipo_modelo: str,
    entidade: str,
    entidade_id: int,
    input_json: dict,
    output_json: dict,
    score,
    modelo_versao: str,
    sucesso: bool = True,
    erro_mensagem=None,
):
    return run_query("""
        INSERT INTO predicaoia (
            tipomodelo, entidade, entidadeid, inputjson, outputjson,
            score, modeloversao, sucesso, erromensagem
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
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
    ))