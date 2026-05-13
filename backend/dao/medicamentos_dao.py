from backend.db import run_query, get_connection

def select_all_medicamentos():
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classeterapeuticaid 
        FROM medicamento 
        ORDER BY nome
    """)

def select_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classeterapeuticaid 
        FROM medicamento 
        WHERE codmedicamento = %s
    """, (cod_medicamento,))

def insert_medicamento(nome: str, principioativo: str, classeterapeuticaid: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO medicamento (nome, principioativo, classeterapeuticaid)
            VALUES (%s, %s, %s)
            RETURNING codmedicamento, nome, principioativo, classeterapeuticaid
        """, (nome, principioativo, classeterapeuticaid))
        created = cur.fetchone()
        conn.commit()
        return {
            "codmedicamento": created[0],
            "nome": created[1],
            "principioativo": created[2],
            "classeterapeuticaid": created[3]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()

def update_medicamento(cod_medicamento: int, nome: str, principioativo: str, classeterapeuticaid: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE medicamento
            SET nome = %s, principioativo = %s, classeterapeuticaid = %s
            WHERE codmedicamento = %s
            RETURNING codmedicamento, nome, principioativo, classeterapeuticaid
        """, (nome, principioativo, classeterapeuticaid, cod_medicamento))
        updated = cur.fetchone()
        conn.commit()
        return {
            "codmedicamento": updated[0],
            "nome": updated[1],
            "principioativo": updated[2],
            "classeterapeuticaid": updated[3]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()