from typing import Optional
from backend.db import run_query


def select_all_alergias(num_utent: int):
    return run_query("""
        SELECT codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
        FROM alergia
        WHERE numutent = %s
        ORDER BY dataregisto DESC
    """, (num_utent,))


def select_alergia_by_id(codalergia: int):
    return run_query("""
        SELECT codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
        FROM alergia
        WHERE codalergia = %s
    """, (codalergia,))


def select_alergias_by_classe(classeterapeuticaid: int):
    return run_query("""
        SELECT codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
        FROM alergia
        WHERE classeterapeuticaid = %s
        ORDER BY nivelgravidade
    """, (classeterapeuticaid,))


def select_alergias_stats():
    return run_query("""
        SELECT 
            classeterapeuticaid,
            nivelgravidade,
            COUNT(*) AS total,
            COUNT(DISTINCT numutent) AS utentes_afetados
        FROM alergia
        GROUP BY classeterapeuticaid, nivelgravidade
        ORDER BY classeterapeuticaid, nivelgravidade
    """)


def insert_alergia(num_utent: int, substancia: str, classeterapeuticaid: int, nivelgravidade: Optional[str] = None):
    # Se o nível de gravidade for None, retiramos a coluna do INSERT
    if nivelgravidade is None:
        return run_query("""
            INSERT INTO alergia (numutent, substancia, classeterapeuticaid)
            VALUES (%s, %s, %s)
            RETURNING codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
        """, (num_utent, substancia, classeterapeuticaid))
    
    # Se trouxer nível de gravidade, inserimos normalmente
    return run_query("""
        INSERT INTO alergia (numutent, substancia, classeterapeuticaid, nivelgravidade)
        VALUES (%s, %s, %s, %s)
        RETURNING codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
    """, (num_utent, substancia, classeterapeuticaid, nivelgravidade))


def update_alergia(codalergia: int, substancia: Optional[str] = None, classeterapeuticaid: Optional[int] = None, nivelgravidade: Optional[str] = None):
    campos = []
    valores = []
    
    # Só adicionamos ao UPDATE os valores que NÃO são None
    if substancia is not None:
        campos.append("substancia = %s")
        valores.append(substancia)
        
    if classeterapeuticaid is not None:
        campos.append("classeterapeuticaid = %s")
        valores.append(classeterapeuticaid)
        
    if nivelgravidade is not None:
        campos.append("nivelgravidade = %s")
        valores.append(nivelgravidade)
        
    # Se não há nada para atualizar, devolvemos a alergia atual chamando o select
    if not campos:
        return select_alergia_by_id(codalergia)

    # Adicionamos o ID apenas no fim, para o WHERE
    valores.append(codalergia)
    
    # Montamos a query dinamicamente
    query = f"""
        UPDATE alergia
        SET {', '.join(campos)}
        WHERE codalergia = %s
        RETURNING codalergia, numutent, substancia, classeterapeuticaid, nivelgravidade, dataregisto
    """
    
    return run_query(query, tuple(valores))


def delete_alergia(codalergia: int):
    return run_query("""
        DELETE FROM alergia
        WHERE codalergia = %s
        RETURNING codalergia
    """, (codalergia,))