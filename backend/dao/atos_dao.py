from typing import Optional, Any
from backend.db import run_query, get_connection
from datetime import datetime

def select_all_atos():
    return run_query("SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim FROM ato ORDER BY datahorainicio DESC")

def select_ato_by_id(id_ato: int):
    return run_query("SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim FROM ato WHERE idato = %s", (id_ato,))

def select_atos_by_ep_urgencia(cod_ep_urgenc: int):
    return run_query("SELECT idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim FROM ato WHERE codepurgenc = %s ORDER BY datahorainicio DESC", (cod_ep_urgenc,))

def insert_ato(codepurgenc: int, tipo: str, descricao: Optional[str], datahorainicio: datetime):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO ato (codepurgenc, tipo, descricao, datahorainicio) VALUES (%s, %s, %s, %s) RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim", (codepurgenc, tipo, descricao, datahorainicio))
        res = cur.fetchone()
        conn.commit()
        return res
    finally: cur.close(); conn.close()

def update_ato(id_ato: int, tipo: str, descricao: Optional[str], datahorafim: Optional[datetime]):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("UPDATE ato SET tipo = %s, descricao = %s, datahorafim = %s WHERE idato = %s RETURNING idato, codepurgenc, tipo, descricao, datahorainicio, datahorafim", (tipo, descricao, datahorafim, id_ato))
        res = cur.fetchone()
        conn.commit()
        return res
    finally: cur.close(); conn.close()

def select_funcionarios_by_ato(id_ato: int):
    return run_query("SELECT f.idfunc, f.nome, f.tipofunc FROM realiza r JOIN funcionario f ON r.idfunc = f.idfunc WHERE r.idato = %s", (id_ato,))

def select_prescricoes_by_ato(id_ato: int):
    return run_query("SELECT idprescricao, idato, descricao, datahorapresc FROM prescreve WHERE idato = %s", (id_ato,))