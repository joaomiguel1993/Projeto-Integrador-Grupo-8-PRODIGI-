from backend.db import run_query, get_connection


def insert_log(username, acao, detalhe=None, ip=None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO log_atividade (username, acao, detalhe, ip)
            VALUES (%s, %s, %s, %s)
        """, (username, acao, detalhe, ip))

        conn.commit()
        return True

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


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