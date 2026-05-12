import psycopg2
from backend.db import run_query, get_connection


def select_all_utentes():
    return run_query("""
        SELECT numutent, nome, nif, datanasc, sexo, localidade, telefone, email
        FROM utente
        ORDER BY nome
    """)


def select_utente_by_id(num_utente: int):
    return run_query("""
        SELECT numutent, nome, nif, datanasc, sexo, localidade, telefone, email
        FROM utente
        WHERE numutent = %s
    """, (num_utente,))


def insert_utente(
    nome: str,
    nif: str,
    datanasc,
    sexo: str,
    localidade: str | None = None,
    telefone: str | None = None,
    email: str | None = None
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO utente (nome, nif, datanasc, sexo, localidade, telefone, email)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING numutent, nome, nif, datanasc, sexo, localidade, telefone, email
        """, (nome, nif, datanasc, sexo, localidade, telefone, email))

        created = cur.fetchone()

        if not created:
            conn.rollback()
            return None

        conn.commit()

        return {
            "numutent": created[0],
            "nome": created[1],
            "nif": created[2],
            "datanasc": created[3],
            "sexo": created[4],
            "localidade": created[5],
            "telefone": created[6],
            "email": created[7]
        }

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_utente_by_id(
    num_utente: int,
    nome: str,
    nif: str,
    datanasc,
    sexo: str,
    localidade: str | None = None,
    telefone: str | None = None,
    email: str | None = None
):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE utente
            SET nome = %s,
                nif = %s,
                datanasc = %s,
                sexo = %s,
                localidade = %s,
                telefone = %s,
                email = %s
            WHERE numutent = %s
            RETURNING numutent, nome, nif, datanasc, sexo, localidade, telefone, email
        """, (nome, nif, datanasc, sexo, localidade, telefone, email, num_utente))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "numutent": updated[0],
            "nome": updated[1],
            "nif": updated[2],
            "datanasc": updated[3],
            "sexo": updated[4],
            "localidade": updated[5],
            "telefone": updated[6],
            "email": updated[7]
        }

    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()