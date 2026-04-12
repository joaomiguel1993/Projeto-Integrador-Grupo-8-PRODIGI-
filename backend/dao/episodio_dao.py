from backend.db import run_query

def get_episodios_todos():
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida
        FROM EpUrgencia ORDER BY DataHoraEntr DESC
    """)
    return result if result else []

def get_episodios_hospital(nomehosp: str):
    result = run_query("""
        SELECT CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr, DataHoraSaida
        FROM EpUrgencia WHERE NomeHosp = %s ORDER BY DataHoraEntr DESC
    """, (nomehosp,))
    return result if result else []

def get_episodio(cod: int, nomehosp: str):
    result = run_query("SELECT ... WHERE CodEpUrgenc = %s AND NomeHosp = %s", (cod, nomehosp))
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return None

def insert_episodio(cod: int, nomehosp: str, numutent: int, datahoraentr: str):
    return run_query("""
        INSERT INTO EpUrgencia (CodEpUrgenc, NomeHosp, NumUtent, DataHoraEntr)
        VALUES (%s, %s, %s, %s)
    """, (cod, nomehosp, numutent, datahoraentr))

def update_episodio_saida(cod: int, nomehosp: str, datahorasaida: str):
    return run_query("""
        UPDATE EpUrgencia SET DataHoraSaida = %s
        WHERE CodEpUrgenc = %s AND NomeHosp = %s
    """, (datahorasaida, cod, nomehosp))