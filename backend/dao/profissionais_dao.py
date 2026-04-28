from backend.db import run_query, get_connection


def select_all_profissionais():
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo
        FROM funcionario
        ORDER BY nome
    """)


def select_profissional_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo
        FROM funcionario
        WHERE idfunc = %s
    """, (id_func,))


def insert_profissional(nome: str, tipofunc: str, sexo: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO funcionario (nome, tipofunc, sexo)
            VALUES (%s, %s, %s)
            RETURNING idfunc, nome, tipofunc, sexo
        """, (nome, tipofunc, sexo))

        new_profissional = cur.fetchone()

        if not new_profissional:
            raise Exception("Não foi possível obter o profissional criado.")

        conn.commit()

        return {
            "idfunc": new_profissional[0],
            "nome": new_profissional[1],
            "tipofunc": new_profissional[2],
            "sexo": new_profissional[3]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()