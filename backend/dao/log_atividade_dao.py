from backend.db import run_query


def select_all_logs_atividade():
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        ORDER BY criado_em DESC, idlog DESC
    """)


def select_log_atividade_by_id(id_log: int):
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        WHERE idlog = %s
    """, (id_log,))


def select_logs_atividade_by_username(username: str):
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        WHERE username = %s
        ORDER BY criado_em DESC, idlog DESC
    """, (username,))


def select_logs_atividade_by_acao(acao: str):
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        WHERE acao = %s
        ORDER BY criado_em DESC, idlog DESC
    """, (acao,))


def select_logs_atividade_by_ip(ip: str):
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        WHERE ip = %s
        ORDER BY criado_em DESC, idlog DESC
    """, (ip,))


def insert_log_atividade(
    username=None, acao=None, detalhe=None, ip=None, criado_em=None
):
    return run_query("""
        INSERT INTO log_atividade (
            username, acao, detalhe, ip, criado_em
        )
        VALUES (
            %s, %s, %s, %s, COALESCE(%s, NOW())
        )
        RETURNING idlog, username, acao, detalhe, ip, criado_em
    """, (
        username, acao, detalhe, ip, criado_em
    ))


def update_log_atividade(id_log: int, **data):
    campos = []
    valores = []

    mapping = {
        "username": "username",
        "acao": "acao",
        "detalhe": "detalhe",
        "ip": "ip",
        "criado_em": "criado_em",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_log_atividade_by_id(id_log)

    valores.append(id_log)

    query = f"""
        UPDATE log_atividade
        SET {', '.join(campos)}
        WHERE idlog = %s
        RETURNING idlog, username, acao, detalhe, ip, criado_em
    """
    return run_query(query, tuple(valores))


def delete_log_atividade(id_log: int):
    return run_query("""
        DELETE FROM log_atividade
        WHERE idlog = %s
        RETURNING idlog
    """, (id_log,))