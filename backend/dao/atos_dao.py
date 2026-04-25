from typing import Optional
from backend.db import run_query

def select_all_atos():
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        ORDER BY datahorainicio DESC
    """)

def select_ato_by_id(id_ato: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE idato = %s
    """, (id_ato,))

def select_atos_by_ep_urgencia(cod_ep_urgenc: int):
    return run_query("""
        SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
        FROM ato
        WHERE codepurgenc = %s
        ORDER BY datahorainicio DESC
    """, (cod_ep_urgenc,))

def insert_ato(cod_ep_urgenc: int, tipo: str, descricao: Optional[str], data_hora_inicio):
    return run_query("""
        INSERT INTO ato (codepurgenc, tipo, descricao, datahorainicio)
        VALUES (%s, %s, %s, %s)
        RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim
    """, (cod_ep_urgenc, tipo, descricao, data_hora_inicio))

def select_funcionarios_by_ato(id_ato: int):
    return run_query("""
        SELECT f.idfunc, f.nome, f.tipofunc
        FROM realiza r
        JOIN funcionario f ON r.idfunc = f.idfunc
        WHERE r.idato = %s
        ORDER BY f.nome
    """, (id_ato,))

def select_prescricoes_by_ato(id_ato: int):
    return run_query("""
        SELECT idprescricao, idato, descricao, datahorapresc
        FROM prescreve
        WHERE idato = %s
        ORDER BY datahorapresc DESC
    """, (id_ato,))
