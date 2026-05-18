from backend.db import run_query


def select_all_funcionarios():
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        ORDER BY nome
    """)


def select_funcionario_by_id(id_func: int):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        WHERE idfunc = %s
    """, (id_func,))


def select_funcionario_by_email(email: str):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        WHERE email = %s
    """, (email,))


def insert_funcionario(nome: str, tipo_func: str, sexo: str, email=None, telefone=None, biografia=None, foto_url=None):
    return run_query("""
        INSERT INTO funcionario (nome, tipofunc, sexo, email, telefone, biografia, foto_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
    """, (nome, tipo_func, sexo, email, telefone, biografia, foto_url))


def update_funcionario(id_func: int, nome=None, tipo_func=None, sexo=None, email=None, telefone=None, biografia=None, foto_url=None):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)
    if tipo_func is not None:
        campos.append("tipofunc = %s")
        valores.append(tipo_func)
    if sexo is not None:
        campos.append("sexo = %s")
        valores.append(sexo)
    if email is not None:
        campos.append("email = %s")
        valores.append(email)
    if telefone is not None:
        campos.append("telefone = %s")
        valores.append(telefone)
    if biografia is not None:
        campos.append("biografia = %s")
        valores.append(biografia)
    if foto_url is not None:
        campos.append("foto_url = %s")
        valores.append(foto_url)

    if not campos:
        return select_funcionario_by_id(id_func)

    valores.append(id_func)

    query = f"""
        UPDATE funcionario
        SET {', '.join(campos)}
        WHERE idfunc = %s
        RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
    """
    return run_query(query, tuple(valores))


def delete_funcionario(id_func: int):
    return run_query("""
        DELETE FROM funcionario
        WHERE idfunc = %s
        RETURNING idfunc
    """, (id_func,))