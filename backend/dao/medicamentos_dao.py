from backend.db import run_query


def select_all_medicamentos():
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classterapeutica
        FROM medicamento
        ORDER BY nome
    """)


def select_medicamento_by_id(cod_medicamento: int):
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classterapeutica
        FROM medicamento
        WHERE codmedicamento = %s
    """, (cod_medicamento,))


def select_medicamentos_by_classe(classe_terapeutica: str):
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classterapeutica
        FROM medicamento
        WHERE classterapeutica = %s
        ORDER BY nome
    """, (classe_terapeutica,))


def insert_medicamento(nome: str, principio_ativo: str, classe_terapeutica: str):
    return run_query("""
        INSERT INTO medicamento (nome, principioativo, classterapeutica)
        VALUES (%s, %s, %s)
        RETURNING codmedicamento, nome, principioativo, classterapeutica
    """, (nome, principio_ativo, classe_terapeutica))


def update_medicamento(cod_medicamento: int, nome=None, principio_ativo=None, classe_terapeutica=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if principio_ativo is not None:
        campos.append("principioativo = %s")
        valores.append(principio_ativo)

    if classe_terapeutica is not None:
        campos.append("classterapeutica = %s")
        valores.append(classe_terapeutica)

    if not campos:
        return select_medicamento_by_id(cod_medicamento)

    valores.append(cod_medicamento)

    query = f"""
        UPDATE medicamento
        SET {', '.join(campos)}
        WHERE codmedicamento = %s
        RETURNING codmedicamento, nome, principioativo, classterapeutica
    """
    return run_query(query, tuple(valores))


def delete_medicamento(cod_medicamento: int):
    return run_query("""
        DELETE FROM medicamento
        WHERE codmedicamento = %s
        RETURNING codmedicamento
    """, (cod_medicamento,))