from backend.db import run_query


def insert_log(username, acao, detalhe=None, ip=None):
    return run_query("""
        INSERT INTO log_atividade (username, acao, detalhe, ip)
        VALUES (%s, %s, %s, %s)
    """, (username, acao, detalhe, ip))


def select_all_logs():
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        ORDER BY criado_em DESC
    """)


def select_logs_by_username(username):
    return run_query("""
        SELECT idlog, username, acao, detalhe, ip, criado_em
        FROM log_atividade
        WHERE username = %s
        ORDER BY criado_em DESC
    """, (username,))