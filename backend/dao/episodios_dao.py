from backend.db import run_query, get_connection


def select_all_episodios():
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahorasaida, estado
        FROM epurgencia
        ORDER BY datahoraentr DESC
    """)


def select_episodio_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, numutent, idhosp, datahoraentr, datahorasaida, estado
        FROM epurgencia
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))


def insert_episodio(num_utente: int, id_hosp: int):
    return run_query("""
        INSERT INTO epurgencia (numutent, idhosp)
        VALUES (%s, %s)
        RETURNING codepurgenc, numutent, idhosp, datahoraentr, datahorasaida, estado
    """, (num_utente, id_hosp))


def update_episodio(cod_ep_urgenc: int, num_utente: int, id_hosp: int, datahora_saida, estado: str):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE epurgencia
            SET numutent = %s,
                idhosp = %s,
                datahorasaida = %s,
                estado = %s
            WHERE codepurgenc = %s
            RETURNING codepurgenc, numutent, idhosp, datahoraentr, datahorasaida, estado
        """, (num_utente, id_hosp, datahora_saida, estado, cod_ep_urgenc))

        updated = cur.fetchone()

        if not updated:
            conn.rollback()
            return None

        conn.commit()

        return {
            "codepurgenc": updated[0],
            "numutent": updated[1],
            "idhosp": updated[2],
            "datahoraentr": updated[3],
            "datahorasaida": updated[4],
            "estado": updated[5]
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def update_estado_episodio(cod_ep_urgenc: int, novo_estado: str):
    """
    Função utilitária rápida para mudar o estado e refletir na IA imediatamente.
    """
    return run_query("""
        UPDATE epurgencia
        SET estado = %s,
            datahorasaida = CASE WHEN %s = 'terminado' THEN NOW() ELSE datahorasaida END,
            datahoraatendimento = CASE WHEN %s = 'em_atendimento' AND datahoraatendimento IS NULL 
                                       THEN NOW() ELSE datahoraatendimento END
        WHERE codepurgenc = %s
        RETURNING codepurgenc, estado
    """, (novo_estado, novo_estado, novo_estado, cod_ep_urgenc))