from backend.db import run_query, get_connection


def select_all_internamentos():
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        ORDER BY datahoraint DESC
    """)


def select_internamento_by_id(cod_internamento: int):
    return run_query("""
        SELECT codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
               datahoraalta, motivoint, numerocama, servico, tipoalta
        FROM internamento
        WHERE codinternamento = %s
    """, (cod_internamento,))


def insert_internamento(codepurgenc: int, idfunc: int | None, datahoraint, motivoint: str,
                        numerocama: str | None = None, servico: str | None = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO internamento (
                codepurgenc, idfunc, datahoraint, motivoint, numerocama, servico
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                      datahoraalta, motivoint, numerocama, servico, tipoalta
        """, (codepurgenc, idfunc, datahoraint, motivoint, numerocama, servico))

        created = cur.fetchone()

        if not created:
            conn.rollback()
            return None

        conn.commit()

        return {
            "codinternamento": created[0],
            "codepurgenc": created[1],
            "idfunc": created[2],
            "datahoraint": created[3],
            "datahoraconsulta": created[4],
            "datahoraalta": created[5],
            "motivoint": created[6],
            "numerocama": created[7],
            "servico": created[8],
            "tipoalta": created[9]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_internamento(cod_internamento: int, codepurgenc: int, idfunc: int | None, datahoraconsulta,
                        datahoraalta, motivoint: str, numerocama: str | None,
                        servico: str | None, tipoalta: str | None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE internamento
            SET codepurgenc = %s,
                idfunc = %s,
                datahoraconsulta = %s,
                datahoraalta = %s,
                motivoint = %s,
                numerocama = %s,
                servico = %s,
                tipoalta = %s
            WHERE codinternamento = %s
            RETURNING codinternamento, codepurgenc, idfunc, datahoraint, datahoraconsulta,
                      datahoraalta, motivoint, numerocama, servico, tipoalta
        """, (
            codepurgenc, idfunc, datahoraconsulta, datahoraalta,
            motivoint, numerocama, servico, tipoalta, cod_internamento
        ))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "codinternamento": updated[0],
            "codepurgenc": updated[1],
            "idfunc": updated[2],
            "datahoraint": updated[3],
            "datahoraconsulta": updated[4],
            "datahoraalta": updated[5],
            "motivoint": updated[6],
            "numerocama": updated[7],
            "servico": updated[8],
            "tipoalta": updated[9]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def count_internados_por_servico():
    return run_query("""
        SELECT servico, COUNT(*) as total 
        FROM internamento 
        WHERE datahoraalta IS NULL 
        GROUP BY servico
    """)