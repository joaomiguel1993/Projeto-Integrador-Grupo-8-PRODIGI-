from backend.db import run_query

def select_all_episodios():
    return run_query("""
        SELECT CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        ORDER BY DataHoraEntr DESC
    """)

def select_episodio_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        WHERE CodEpUrgenc = %s
    """, (cod_ep_urgenc,))

def insert_episodio(num_utente: int, id_hosp: int):
    return run_query("""
        INSERT INTO EpUrgencia (NumUtent, IdHosp)
        VALUES (%s, %s)
        RETURNING CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
    """, (num_utente, id_hosp))