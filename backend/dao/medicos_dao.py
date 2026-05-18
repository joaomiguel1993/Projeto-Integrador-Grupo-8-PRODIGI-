from typing import Optional
from backend.db import run_query


def select_all_medicos():
    return run_query("""
        SELECT idfunc, estagiario, especialidade
        FROM medico
        ORDER BY idfunc
    """)


def select_medico_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, estagiario, especialidade
        FROM medico
        WHERE idfunc = %s
    """, (id_func,))


def select_medicos_by_especialidade(especialidade: str):
    return run_query("""
        SELECT idfunc, estagiario, especialidade
        FROM medico
        WHERE especialidade = %s
        ORDER BY idfunc
    """, (especialidade,))


def select_medicos_estagiarios(estagiario: bool = True):
    return run_query("""
        SELECT idfunc, estagiario, especialidade
        FROM medico
        WHERE estagiario = %s
        ORDER BY especialidade, idfunc
    """, (estagiario,))


def insert_medico(id_func: int, estagiario: bool = False, especialidade: str = ""):
    return run_query("""
        INSERT INTO medico (idfunc, estagiario, especialidade)
        VALUES (%s, %s, %s)
        RETURNING idfunc, estagiario, especialidade
    """, (id_func, estagiario, especialidade))


def update_medico(id_func: int, estagiario: Optional[bool] = None, especialidade: Optional[str] = None):
    campos = []
    valores = []

    if estagiario is not None:
        campos.append("estagiario = %s")
        valores.append(estagiario)

    if especialidade is not None:
        campos.append("especialidade = %s")
        valores.append(especialidade)

    if not campos:
        return select_medico_by_id(id_func)

    valores.append(id_func)

    query = f"""
        UPDATE medico
        SET {', '.join(campos)}
        WHERE idfunc = %s
        RETURNING idfunc, estagiario, especialidade
    """
    return run_query(query, tuple(valores))


def delete_medico(id_func: int):
    return run_query("""
        DELETE FROM medico
        WHERE idfunc = %s
        RETURNING idfunc
    """, (id_func,))