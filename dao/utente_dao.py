from backend.db import run_query

def get_utentes():
    return run_query("SELECT NumUtent, Sexo, Localidade, IdadeAtual FROM Utente")

def get_utente(numutent: int):
    return run_query("SELECT * FROM Utente WHERE NumUtent = %s", (numutent,))

def insert_utente(numutent: int, sexo: str, localidade: str, idadeatual: int):
    return run_query("""
        INSERT INTO Utente (NumUtent, Sexo, Localidade, IdadeAtual)
        VALUES (%s, %s, %s, %s)
    """, (numutent, sexo, localidade, idadeatual))