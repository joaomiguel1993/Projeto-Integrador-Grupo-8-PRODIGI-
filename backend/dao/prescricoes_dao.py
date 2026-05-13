from backend.db import run_query, get_connection

def select_all_prescricoes():
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc
        FROM prescreve
        ORDER BY datahorapresc DESC
    """)

def select_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc
        FROM prescreve
        WHERE idprescricao = %s
    """, (id_prescricao,))

def insert_prescricao(id_ato: int, codmedicamento: int, dosagem: str, observacoes: str = None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO prescreve (idato, codmedicamento, dosagem, observacoes)
            VALUES (%s, %s, %s, %s)
            RETURNING idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc
        """, (id_ato, codmedicamento, dosagem, observacoes))
        created = cur.fetchone()
        conn.commit()
        return {
            "idprescricao": created[0],
            "idato": created[1],
            "codmedicamento": created[2],
            "dosagem": created[3],
            "observacoes": created[4],
            "datahorapresc": created[5]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()

def update_prescricao(id_prescricao: int, id_ato: int, codmedicamento: int, dosagem: str, observacoes: str = None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE prescreve
            SET idato = %s, codmedicamento = %s, dosagem = %s, observacoes = %s
            WHERE idprescricao = %s
            RETURNING idprescricao, idato, codmedicamento, dosagem, observacoes, datahorapresc
        """, (id_ato, codmedicamento, dosagem, observacoes, id_prescricao))
        updated = cur.fetchone()
        conn.commit()
        return {
            "idprescricao": updated[0],
            "idato": updated[1],
            "codmedicamento": updated[2],
            "dosagem": updated[3],
            "observacoes": updated[4],
            "datahorapresc": updated[5]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()