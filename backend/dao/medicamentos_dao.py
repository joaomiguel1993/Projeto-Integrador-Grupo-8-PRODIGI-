from backend.db import run_query, get_connection


def select_all_medicamentos():
    return run_query("""
        SELECT codmedicamento, nome, principioativo
        FROM medicamento
        ORDER BY nome
    """)


def select_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT codmedicamento, nome, principioativo
        FROM medicamento
        WHERE codmedicamento = %s
    """, (cod_medicamento,))


def insert_medicamento(nome: str, principioativo: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO medicamento (nome, principioativo)
            VALUES (%s, %s)
            RETURNING codmedicamento, nome, principioativo
        """, (nome, principioativo))

        created = cur.fetchone()

        if not created:
            conn.rollback()
            return None

        conn.commit()

        return {
            "codmedicamento": created[0],
            "nome": created[1],
            "principioativo": created[2]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_medicamento(cod_medicamento: int, nome: str, principioativo: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE medicamento
            SET nome = %s,
                principioativo = %s
            WHERE codmedicamento = %s
            RETURNING codmedicamento, nome, principioativo
        """, (nome, principioativo, cod_medicamento))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "codmedicamento": updated[0],
            "nome": updated[1],
            "principioativo": updated[2]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()