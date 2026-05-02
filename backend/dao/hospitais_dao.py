from backend.db import run_query, get_connection


def select_all_hospitais():
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone
        FROM hospital
        ORDER BY nome
    """)


def select_hospital_by_id(id_hosp: int):
    return run_query("""
        SELECT idhosp, nome, localizacao, email, telefone
        FROM hospital
        WHERE idhosp = %s
    """, (id_hosp,))


def insert_hospital(nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO hospital (nome, localizacao, email, telefone)
            VALUES (%s, %s, %s, %s)
            RETURNING idhosp, nome, localizacao, email, telefone
        """, (nome, localizacao, email, telefone))

        novo = cur.fetchone()

        if not novo:
            raise Exception("Não foi possível obter o hospital criado.")

        conn.commit()

        return {
            "idhosp": novo[0],
            "nome": novo[1],
            "localidade": novo[2],
            "email": novo[3],
            "telefone": novo[4]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_hospital_by_id(id_hosp: int, nome: str, localizacao: str, email: str | None = None, telefone: str | None = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE hospital
            SET nome = %s,
                localizacao = %s,
                email = %s,
                telefone = %s
            WHERE idhosp = %s
            RETURNING idhosp, nome, localizacao, email, telefone
        """, (nome, localizacao, email, telefone, id_hosp))

        atualizado = cur.fetchone()

        if not atualizado:
            conn.rollback()
            return None

        conn.commit()

        return {
            "idhosp": atualizado[0],
            "nome": atualizado[1],
            "localidade": atualizado[2],
            "email": atualizado[3],
            "telefone": atualizado[4]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def delete_hospital_by_id(id_hosp: int):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            DELETE FROM hospital
            WHERE idhosp = %s
            RETURNING idhosp
        """, (id_hosp,))

        apagado = cur.fetchone()
        conn.commit()
        return apagado is not None

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()