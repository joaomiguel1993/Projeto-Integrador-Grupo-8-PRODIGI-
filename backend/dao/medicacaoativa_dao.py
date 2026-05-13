from backend.db import run_query

def select_all_medicacaoativa():
    return run_query("""
        SELECT codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
        FROM medicacaoativa
        ORDER BY datainicio DESC
    """)

def select_medicacaoativa_by_utente(numutent: int):
    return run_query("""
        SELECT ma.codmedicacaoativa, ma.numutent, ma.codmedicamento,
               ma.datainicio, ma.datafim, ma.dosagem, 
               m.nome, m.principioativo, m.classeterapeuticaid  -- Adicionado aqui
        FROM medicacaoativa ma
        JOIN medicamento m ON ma.codmedicamento = m.codmedicamento
        WHERE ma.numutent = %s
        ORDER BY ma.datainicio DESC
    """, (numutent,))

def insert_medicacaoativa(numutent: int, codmedicamento: int, datainicio, datafim, dosagem):
    return run_query("""
        INSERT INTO medicacaoativa (numutent, codmedicamento, datainicio, datafim, dosagem)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
    """, (numutent, codmedicamento, datainicio, datafim, dosagem))

def update_medicacaoativa(codmedicacaoativa: int, datafim, dosagem):
    return run_query("""
        UPDATE medicacaoativa
        SET datafim = %s, dosagem = %s
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa, numutent, codmedicamento, datainicio, datafim, dosagem
    """, (datafim, dosagem, codmedicacaoativa))

def delete_medicacaoativa(codmedicacaoativa: int):
    return run_query("""
        DELETE FROM medicacaoativa
        WHERE codmedicacaoativa = %s
        RETURNING codmedicacaoativa
    """, (codmedicacaoativa,))