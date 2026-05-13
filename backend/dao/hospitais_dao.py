from backend.db import run_query, get_connection

def select_all_hospitais():
    """
    Lê da VIEW v_estatisticas_ia para garantir que o Frontend recebe
    as contagens necessárias para a predição da IA.
    """
    return run_query("""
        SELECT idhosp, hospitalnome as nome, localizacao, facility_size_beds, 
               contagem_enfermeiros, contagem_medicos, pacientes_ativos
        FROM v_estatisticas_ia
        ORDER BY hospitalnome
    """)

def select_hospital_by_id(id_hosp: int):
    """
    Lê os detalhes e métricas de IA de um hospital específico via VIEW.
    """
    return run_query("""
        SELECT idhosp, hospitalnome as nome, localizacao, facility_size_beds, 
               contagem_enfermeiros, contagem_medicos, pacientes_ativos
        FROM v_estatisticas_ia
        WHERE idhosp = %s
    """, (id_hosp,))

def insert_hospital(nome: str, localizacao: str, email: str | None = None, telefone: str | None = None, totalcamas: int = 100):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO hospital (nome, localizacao, email, telefone, totalcamas)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao, email, telefone, totalcamas))
        novo = cur.fetchone()
        conn.commit()
        return {
            "idhosp": novo[0],
            "nome": novo[1],
            "localizacao": novo[2],
            "email": novo[3],
            "telefone": novo[4],
            "totalcamas": novo[5]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def update_hospital_by_id(id_hosp: int, nome: str, localizacao: str, email: str | None = None, telefone: str | None = None, totalcamas: int = 100):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE hospital
            SET nome = %s,
                localizacao = %s,
                email = %s,
                telefone = %s,
                totalcamas = %s
            WHERE idhosp = %s
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao, email, telefone, totalcamas, id_hosp))
        atualizado = cur.fetchone()
        if not atualizado:
            conn.rollback()
            return None
        conn.commit()
        return {
            "idhosp": atualizado[0],
            "nome": atualizado[1],
            "localizacao": atualizado[2],
            "email": atualizado[3],
            "telefone": atualizado[4],
            "totalcamas": atualizado[5]
        }
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def delete_hospital_by_id(id_hosp: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM hospital WHERE idhosp = %s RETURNING idhosp", (id_hosp,))
        apagado = cur.fetchone()
        conn.commit()
        return apagado is not None
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()