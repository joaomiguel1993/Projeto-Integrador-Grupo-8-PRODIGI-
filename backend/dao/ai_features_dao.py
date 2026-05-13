from backend.db import run_query


def get_contexto_prescricao_by_id(id_prescricao: int):
    return run_query("""
        SELECT
            p.idprescricao,
            p.idato,
            p.codmedicamento,
            a.codepurgenc,
            e.numutent,
            e.idhosp,
            e.datahoraentr
        FROM prescreve p
        JOIN ato a ON a.idato = p.idato
        JOIN epurgencia e ON e.codepurgenc = a.codepurgenc
        WHERE p.idprescricao = %s
    """, (id_prescricao,))


def get_alergias_utente(num_utent: int):
    return run_query("""
        SELECT
            codalergia,
            numutent,
            substancia,
            classeterapeuticaid,
            nivelgravidade,
            dataregisto
        FROM alergia
        WHERE numutent = %s
        ORDER BY codalergia ASC
    """, (num_utent,))


def get_medicacao_ativa_utente(num_utent: int):
    return run_query("""
        SELECT
            ma.codmedicacaoativa,
            ma.numutent,
            ma.codmedicamento,
            ma.datainicio,
            ma.datafim,
            ma.dosagem,
            m.classeterapeuticaid
        FROM medicacaoativa ma
        JOIN medicamento m ON m.codmedicamento = ma.codmedicamento
        WHERE ma.numutent = %s
          AND ma.datafim IS NULL
        ORDER BY ma.codmedicacaoativa ASC
    """, (num_utent,))


def get_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT
            codmedicamento,
            nome,
            principioativo,
            classeterapeuticaid
        FROM medicamento
        WHERE codmedicamento = %s
    """, (cod_medicamento,))