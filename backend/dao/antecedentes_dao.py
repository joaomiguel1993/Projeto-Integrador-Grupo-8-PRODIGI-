from backend.db import run_query

def select_all_antecedentes():
    return run_query("SELECT codantecedente, nome, tipo FROM antecedente ORDER BY nome")