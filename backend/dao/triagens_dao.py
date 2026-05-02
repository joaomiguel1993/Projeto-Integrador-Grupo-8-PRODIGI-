from backend.db import run_query, get_connection


def select_all_triagens():
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica
        FROM triagem
        ORDER BY datahorainicio DESC
    """)


def select_triagem_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica
        FROM triagem
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))


def insert_triagem(cod_ep_urgenc: int, datahorainicio, cortriagem: str, sintomas: str, 
                   temperatura: float | None = None, freqcard: int | None = None, 
                   freqresp: int | None = None, spo2: float | None = None, 
                   sistolica: int | None = None, diastolica: int | None = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO triagem (codepurgenc, datahorainicio, cortriagem, sintomas, 
                                 temperatura, freqcard, freqresp, spo2, sistolica, diastolica)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING codepurgenc, datahorainicio, cortriagem, sintomas
        """, (cod_ep_urgenc, datahorainicio, cortriagem, sintomas, 
              temperatura, freqcard, freqresp, spo2, sistolica, diastolica))

        created = cur.fetchone()
        conn.commit()
        return created is not None

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_triagem(cod_ep_urgenc: int, cortriagem: str, sintomas: str, 
                   temperatura: float | None = None, freqcard: int | None = None, 
                   freqresp: int | None = None, spo2: float | None = None, 
                   sistolica: int | None = None, diastolica: int | None = None,
                   datahorafim = None):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE triagem
            SET cortriagem = %s,
                sintomas = %s,
                temperatura = %s,
                freqcard = %s,
                freqresp = %s,
                spo2 = %s,
                sistolica = %s,
                diastolica = %s,
                datahorafim = %s
            WHERE codepurgenc = %s
            RETURNING codepurgenc
        """, (cortriagem, sintomas, temperatura, freqcard, freqresp, spo2, sistolica, diastolica, datahorafim, cod_ep_urgenc))

        updated = cur.fetchone()
        conn.commit()
        return updated is not None

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()