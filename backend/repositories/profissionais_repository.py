from backend.db import run_query


def listar_profissionais():
    result = run_query("""
        SELECT IdFunc, NumFunc, Nome, TipoFunc, Sexo
        FROM Funcionario
        ORDER BY Nome
    """)
    return result if result else []


def obter_profissional(id_func: int):
    result = run_query("""
        SELECT IdFunc, NumFunc, Nome, TipoFunc, Sexo
        FROM Funcionario
        WHERE IdFunc = %s
    """, (id_func,))
    return result if result else []


def listar_medicos():
    result = run_query("""
        SELECT m.IdFunc, f.NumFunc, f.Nome, f.TipoFunc, f.Sexo,
               m.Especialidade, m.Estagiario
        FROM Medico m
        JOIN Funcionario f ON m.IdFunc = f.IdFunc
        ORDER BY f.Nome
    """)
    return result if result else []


def listar_enfermeiros():
    result = run_query("""
        SELECT e.IdFunc, f.NumFunc, f.Nome, f.TipoFunc, f.Sexo
        FROM Enfermeiro e
        JOIN Funcionario f ON e.IdFunc = f.IdFunc
        ORDER BY f.Nome
    """)
    return result if result else []


def obter_utilizador_profissional(id_func: int):
    result = run_query("""
        SELECT IdUtilizador, IdFunc, UserName, Funcao
        FROM Utilizador
        WHERE IdFunc = %s
    """, (id_func,))
    return result if result else []