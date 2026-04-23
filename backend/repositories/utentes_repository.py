from backend.db import run_query


def listar_utentes():
    result = run_query("""
        SELECT NumUtent, NIF, Nome, DataNasc, Sexo, Localidade
        FROM Utente
        ORDER BY Nome
    """)
    return result if result else []


def obter_utente(num_utente: int):
    result = run_query("""
        SELECT NumUtent, NIF, Nome, DataNasc, Sexo, Localidade
        FROM Utente
        WHERE NumUtent = %s
    """, (num_utente,))
    return result if result else []


def listar_episodios_utente(num_utente: int):
    result = run_query("""
        SELECT CodEpUrgenc, IdHosp, DataHoraEntr, DataHoraSaida, Estado
        FROM EpUrgencia
        WHERE NumUtent = %s
        ORDER BY DataHoraEntr DESC
    """, (num_utente,))
    return result if result else []


def listar_antecedentes_utente(num_utente: int):
    result = run_query("""
        SELECT a.CodAntecedente, a.Nome, a.Tipo, ua.DataRegisto
        FROM UtenteAntecedente ua
        JOIN Antecedente a ON ua.CodAntecedente = a.CodAntecedente
        WHERE ua.NumUtent = %s
        ORDER BY a.Nome
    """, (num_utente,))
    return result if result else []


def listar_medicacao_ativa_utente(num_utente: int):
    result = run_query("""
        SELECT ma.CodMedicacaoAtiva, ma.CodMedicamento, m.Nome, m.PrincipioAtivo,
               ma.DataInicio, ma.DataFim, ma.Dosagem, ma.Ativo
        FROM MedicacaoAtiva ma
        JOIN Medicamento m ON ma.CodMedicamento = m.CodMedicamento
        WHERE ma.NumUtent = %s
        ORDER BY ma.DataInicio DESC
    """, (num_utente,))
    return result if result else []