from backend.db import run_query


def listar_hospitais():
    result = run_query("""
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        ORDER BY Nome
    """)
    return result if result else []


def obter_hospital(id_hosp: int):
    result = run_query("""
        SELECT IdHosp, Nome, Localizacao
        FROM Hospital
        WHERE IdHosp = %s
    """, (id_hosp,))
    return result if result else []


def listar_episodios_hospital(id_hosp: int):
    result = run_query("""
        SELECT CodEpUrgenc, NumUtent, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        WHERE IdHosp = %s
        ORDER BY DataHoraEntr DESC
    """, (id_hosp,))
    return result if result else []