from backend.db import run_query, get_connection


def select_all_prescricoes():
    return run_query("""
        SELECT idprescricao, idato, descricao, datahorapresc
        FROM prescreve
        ORDER BY datahorapresc DESC
    """)


def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, descricao, datahorapresc
        FROM prescreve
        WHERE idprescricao = %s
    """, (id_prescricao,))


def insert_prescricao(id_ato: int, descricao: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO prescreve (idato, descricao)
            VALUES (%s, %s)
            RETURNING idprescricao, idato, descricao, datahorapresc
        """, (id_ato, descricao))

        created = cur.fetchone()

        if not created:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idprescricao": created[0],
            "idato": created[1],
            "descricao": created[2],
            "datahorapresc": created[3]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_prescricao(id_prescricao: int, id_ato: int, descricao: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE prescreve
            SET idato = %s,
                descricao = %s
            WHERE idprescricao = %s
            RETURNING idprescricao, idato, descricao, datahorapresc
        """, (id_ato, descricao, id_prescricao))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idprescricao": updated[0],
            "idato": updated[1],
            "descricao": updated[2],
            "datahorapresc": updated[3]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()