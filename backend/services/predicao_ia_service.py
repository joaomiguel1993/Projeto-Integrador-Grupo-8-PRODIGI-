from backend.db import run_query


def criar_predicao(data: dict) -> None:
    """
    Grava um registo de auditoria na tabela PredicaoIA.

    data = {
        "tipo_modelo":   "tempo_espera" | "triagem" | "risco_medicamentoso",
        "entidade":      "triagem" | "prescricao",
        "entidade_id":   int,
        "input_json":    dict,
        "output_json":   dict,
        "score":         float | None,
        "modelo_versao": str,
        "sucesso":       bool,
        "erro_mensagem": str | None,
    }
    """
    import json

    run_query("""
        INSERT INTO PredicaoIA (
            TipoModelo, Entidade, EntidadeId,
            InputJson, OutputJson,
            Score, ModeloVersao,
            Sucesso, ErroMensagem
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data["tipo_modelo"],
        data["entidade"],
        data["entidade_id"],
        json.dumps(data["input_json"]),
        json.dumps(data["output_json"]),
        data.get("score"),
        data["modelo_versao"],
        data.get("sucesso", True),
        data.get("erro_mensagem"),
    ))