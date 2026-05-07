from typing import Optional
from backend.db import run_query, get_connection

def select_all_profissionais():
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        ORDER BY nome
    """)

def select_profissional_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        WHERE idfunc = %s
    """, (id_func,))

def insert_profissional(nome: str, tipofunc: str, sexo: str, email: Optional[str] = None, telefone: Optional[str] = None, biografia: Optional[str] = None, foto_url: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO funcionario (nome, tipofunc, sexo, email, telefone, biografia, foto_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        """, (nome, tipofunc, sexo, email, telefone, biografia, foto_url))

        new_profissional = cur.fetchone()

        if not new_profissional:
            raise Exception("Não foi possível obter o profissional criado.")

        conn.commit()

        return {
            "idfunc": new_profissional[0],
            "nome": new_profissional[1],
            "tipofunc": new_profissional[2],
            "sexo": new_profissional[3],
            "email": new_profissional[4],
            "telefone": new_profissional[5],
            "biografia": new_profissional[6],
            "foto_url": new_profissional[7]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def update_profissional_by_id(id_func: int, nome: str, tipofunc: str, sexo: str, email: Optional[str] = None, telefone: Optional[str] = None, biografia: Optional[str] = None, foto_url: Optional[str] = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE funcionario
            SET nome = %s,
                tipofunc = %s,
                sexo = %s,
                email = %s,
                telefone = %s,
                biografia = %s,
                foto_url = %s
            WHERE idfunc = %s
            RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        """, (nome, tipofunc, sexo, email, telefone, biografia, foto_url, id_func))

        updated_profissional = cur.fetchone()

        if not updated_profissional:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idfunc": updated_profissional[0],
            "nome": updated_profissional[1],
            "tipofunc": updated_profissional[2],
            "sexo": updated_profissional[3],
            "email": updated_profissional[4],
            "telefone": updated_profissional[5],
            "biografia": updated_profissional[6],
            "foto_url": updated_profissional[7]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()