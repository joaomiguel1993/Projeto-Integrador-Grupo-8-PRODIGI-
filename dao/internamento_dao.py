from backend.db import run_query

def get_internados_todos():
    result = run_query("""
        SELECT NumUtent, NomeHosp, DataInternamento, DataAlta
        FROM Internados ORDER BY DataInternamento DESC
    """)
    return result if result else []

def get_internados_hospital(nomehosp: str):
    result = run_query("""
        SELECT NumUtent, NomeHosp, DataInternamento, DataAlta
        FROM Internados WHERE NomeHosp = %s ORDER BY DataInternamento DESC
    """, (nomehosp,))
    return result if result else []

def get_internamento(numutent: int, data_internamento: str):
    result = run_query("SELECT ... WHERE NumUtent = %s AND DataInternamento = %s", (numutent, data_internamento))
    if isinstance(result, list) and len(result) > 0:
        return result[0]
    return None

def insert_internamento(numutent: int, nomehosp: str, data_internamento: str):
    return run_query("""
        INSERT INTO Internados (NumUtent, NomeHosp, DataInternamento)
        VALUES (%s, %s, %s)
    """, (numutent, nomehosp, data_internamento))

def update_internamento_alta(numutent: int, data_internamento: str, data_alta: str):
    return run_query("""
        UPDATE Internados SET DataAlta = %s
        WHERE NumUtent = %s AND DataInternamento = %s
    """, (data_alta, numutent, data_internamento))