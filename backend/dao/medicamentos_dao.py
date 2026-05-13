from backend.db import run_query


def select_all_medicamentos():
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classeterapeuticaid
        FROM medicamento
        ORDER BY nome ASC
    """)


def select_medicamento_by_id(codmedicamento: int):
    return run_query("""
        SELECT codmedicamento, nome, principioativo, classeterapeuticaid
        FROM medicamento
        WHERE codmedicamento = %s
    """, (codmedicamento,))


def insert_medicamento(nome: str, principioativo: str, classeterapeuticaid: int):
    return run_query("""
        INSERT INTO medicamento (nome, principioativo, classeterapeuticaid)
        VALUES (%s, %s, %s)
        RETURNING codmedicamento, nome, principioativo, classeterapeuticaid
    """, (nome, principioativo, classeterapeuticaid))


def update_medicamento(codmedicamento: int, nome=None, principioativo=None, classeterapeuticaid=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if principioativo is not None:
        campos.append("principioativo = %s")
        valores.append(principioativo)

    if classeterapeuticaid is not None:
        campos.append("classeterapeuticaid = %s")
        valores.append(classeterapeuticaid)

    if len(campos) == 0:
        return select_medicamento_by_id(codmedicamento)

    valores.append(codmedicamento)

    query = f"""
        UPDATE medicamento
        SET {', '.join(campos)}
        WHERE codmedicamento = %s
        RETURNING codmedicamento, nome, principioativo, classeterapeuticaid
    """
    return run_query(query, tuple(valores))


def delete_medicamento(codmedicamento: int):
    return run_query("""
        DELETE FROM medicamento
        WHERE codmedicamento = %s
        RETURNING codmedicamento
    """, (codmedicamento,))