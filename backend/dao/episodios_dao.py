from backend.db import run_query

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
