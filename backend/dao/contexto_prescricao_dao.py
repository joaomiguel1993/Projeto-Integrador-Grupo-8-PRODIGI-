from backend.db import run_query


def select_all_contexto_prescricao():
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        ORDER BY datahorapresc DESC, idprescricao DESC
    """)


def select_contexto_prescricao_by_id_prescricao(id_prescricao: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        WHERE idprescricao = %s
        ORDER BY substancia
    """, (id_prescricao,))


def select_contexto_prescricao_by_ato(id_ato: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        WHERE idato = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (id_ato,))


def select_contexto_prescricao_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        WHERE codepurgenc = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (cod_ep_urgenc,))


def select_contexto_prescricao_by_nif(nif: str):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        WHERE nif = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (nif,))


def select_contexto_prescricao_by_medicamento(cod_medicamento: int):
    return run_query("""
        SELECT idprescricao, idato, codmedicamento, dosagem, frequencia,
               viaadministracao, duracaodias, observacoes, datahorapresc,
               estadoprescricao, scoreriscoia, codepurgenc, nif, idhosp,
               datahoraentr, substancia, classeterapeutica, nivelgravidade
        FROM v_contexto_prescricao
        WHERE codmedicamento = %s
        ORDER BY datahorapresc DESC, idprescricao DESC
    """, (cod_medicamento,))