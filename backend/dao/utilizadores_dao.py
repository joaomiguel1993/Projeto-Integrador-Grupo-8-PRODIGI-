from backend.db import run_query, get_connection


def select_all_utilizadores():
    return run_query("""
        SELECT u.idfunc, u.username, f.nome, f.tipofunc
        FROM utilizador u
        JOIN funcionario f ON u.idfunc = f.idfunc
        ORDER BY f.nome
    """)


def select_utilizador_by_idfunc(idfunc: int):
    return run_query("""
        SELECT u.idfunc, u.username, f.nome, f.tipofunc
        FROM utilizador u
        JOIN funcionario f ON u.idfunc = f.idfunc
        WHERE u.idfunc = %s
    """, (idfunc,))


def insert_utilizador(idfunc: int, username: str, password: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO utilizador (idfunc, username, password)
            VALUES (%s, %s, %s)
            RETURNING idfunc, username
        """, (idfunc, username, password))

        created = cur.fetchone()

        if not created:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idfunc": created[0],
            "username": created[1]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_utilizador_by_idfunc(idfunc: int, username: str, password: str | None = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        if password and password.strip():
            cur.execute("""
                UPDATE utilizador
                SET username = %s,
                    password = %s
                WHERE idfunc = %s
                RETURNING idfunc, username
            """, (username, password, idfunc))
        else:
            cur.execute("""
                UPDATE utilizador
                SET username = %s
                WHERE idfunc = %s
                RETURNING idfunc, username
            """, (username, idfunc))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idfunc": updated[0],
            "username": updated[1]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def select_hospitais_by_idfunc(idfunc: int):
    return run_query("""
        SELECT h.idhosp, h.nome
        FROM trabalha t
        JOIN hospital h ON h.idhosp = t.idhosp
        WHERE t.idfunc = %s AND t.ativo = TRUE
        ORDER BY h.nome
    """, (idfunc,))


def replace_hospitais_utilizador(idfunc: int, hospitais: list[int]):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM trabalha WHERE idfunc = %s", (idfunc,))

        for idhosp in hospitais:
            cur.execute("""
                INSERT INTO trabalha (idfunc, idhosp, ativo)
                VALUES (%s, %s, TRUE)
            """, (idfunc, idhosp))

        conn.commit()
        return True

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()