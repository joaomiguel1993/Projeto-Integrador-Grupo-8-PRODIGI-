from backend.db import run_query

def get_hospitais():
    return run_query("SELECT Nome, Localizacao FROM Hospital")

def get_hospital(nome: str):
    return run_query("SELECT Nome, Localizacao FROM Hospital WHERE Nome = %s", (nome,))

def insert_hospital(nome: str, localizacao: str):
    return run_query("""
        INSERT INTO Hospital (Nome, Localizacao) VALUES (%s, %s)
    """, (nome, localizacao))