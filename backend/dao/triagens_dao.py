from backend.db import run_query, get_connection

def select_all_triagens():
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
               niveldor, consciencia, tempoesperaprevisto
        FROM triagem
        ORDER BY datahorainicio DESC
    """)

def select_triagem_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
               temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
               niveldor, consciencia, tempoesperaprevisto
        FROM triagem
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))

def insert_triagem(cod_ep_urgenc: int, datahorainicio, cortriagem: str, sintomas: str, 
                   temperatura: float = None, freqcard: int = None, 
                   freqresp: int = None, spo2: float = None, 
                   sistolica: int = None, diastolica: int = None,
                   niveldor: int = None, consciencia: str = None, 
                   tempoesperaprevisto: int = None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO triagem (
                codepurgenc, datahorainicio, cortriagem, sintomas, 
                temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
                niveldor, consciencia, tempoesperaprevisto
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING codepurgenc
        """, (cod_ep_urgenc, datahorainicio, cortriagem, sintomas, 
              temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
              niveldor, consciencia, tempoesperaprevisto))
        
        created = cur.fetchone()
        conn.commit()
        return created is not None
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()

def update_triagem(cod_ep_urgenc: int, cortriagem: str, sintomas: str, 
                   temperatura: float = None, freqcard: int = None, 
                   freqresp: int = None, spo2: float = None, 
                   sistolica: int = None, diastolica: int = None,
                   niveldor: int = None, consciencia: str = None,
                   tempoesperaprevisto: int = None, datahorafim = None):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE triagem
            SET cortriagem = %s, sintomas = %s, temperatura = %s,
                freqcard = %s, freqresp = %s, spo2 = %s,
                sistolica = %s, diastolica = %s, niveldor = %s,
                consciencia = %s, tempoesperaprevisto = %s, datahorafim = %s
            WHERE codepurgenc = %s
            RETURNING codepurgenc
        """, (cortriagem, sintomas, temperatura, freqcard, freqresp, spo2, 
              sistolica, diastolica, niveldor, consciencia, 
              tempoesperaprevisto, datahorafim, cod_ep_urgenc))

        updated = cur.fetchone()
        conn.commit()
        return updated is not None
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close(); conn.close()