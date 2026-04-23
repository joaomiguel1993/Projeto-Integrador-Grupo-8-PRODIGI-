from typing import Optional
from backend.db import run_query


def listar_episodios():
    result = run_query("""
        SELECT CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        ORDER BY DataHoraEntr DESC
    """)
    return result if result else []


def obter_episodio(cod_epurgenc: int):
    result = run_query("""
        SELECT CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        WHERE CodEpUrgenc = %s
    """, (cod_epurgenc,))
    return result if result else []


def listar_episodios_utente(num_utente: int):
    result = run_query("""
        SELECT CodEpUrgenc, NumUtent, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        WHERE NumUtent = %s
        ORDER BY DataHoraEntr DESC
    """, (num_utente,))
    return result if result else []


def criar_episodio(num_utente: int, id_hosp: int, data_hora_saida: Optional[str] = None, estado: str = "aberto"):
    return run_query("""
        INSERT INTO EpUrgencia (NumUtent, IdHosp, DataHoraSaida, Estado)
        VALUES (%s, %s, %s, %s)
    """, (num_utente, id_hosp, data_hora_saida, estado))


def obter_triagem_episodio(cod_epurgenc: int):
    result = run_query("""
        SELECT CodEpUrgenc, DataHoraInicio, DataHoraFim, CorTriagem, Sintomas,
               Temperatura, FreqCardiaca, FreqRespiratoria, SpO2, Sistolica, Diastolica
        FROM Triagem
        WHERE CodEpUrgenc = %s
    """, (cod_epurgenc,))
    return result if result else []


def obter_internamento_episodio(cod_epurgenc: int):
    result = run_query("""
        SELECT CodInternamento, CodEpUrgenc, IdFunc, DataHoraInt, DataHoraConsulta,
               DataHoraAlta, MotivoInt, NumeroCama, Servico, TipoAlta
        FROM Internamento
        WHERE CodEpUrgenc = %s
    """, (cod_epurgenc,))
    return result if result else []


def listar_profissionais_episodio(cod_epurgenc: int):
    result = run_query("""
        SELECT f.IdFunc, f.Nome, f.TipoFunc, re.DataHora
        FROM RealizaEpUrgencia re
        JOIN Funcionario f ON re.IdFunc = f.IdFunc
        WHERE re.CodEpUrgenc = %s
        ORDER BY re.DataHora DESC
    """, (cod_epurgenc,))
    return result if result else []