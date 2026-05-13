from typing import Optional
from backend.db import run_query


def select_all_profissionais():
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        ORDER BY nome ASC
    """)


def select_profissional_by_id(idfunc: int):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        WHERE idfunc = %s
    """, (idfunc,))


def select_profissionais_by_tipo(tipofunc: str):
    return run_query("""
        SELECT idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
        FROM funcionario
        WHERE tipofunc = %s
        ORDER BY nome ASC
    """, (tipofunc,))


def insert_profissional(
    nome: str,
    tipofunc: str,
    sexo: str,
    email: Optional[str] = None,
    telefone: Optional[str] = None,
    biografia: Optional[str] = None,
    foto_url: Optional[str] = None,
):
    return run_query("""
        INSERT INTO funcionario (nome, tipofunc, sexo, email, telefone, biografia, foto_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
    """, (
        nome,
        tipofunc,
        sexo,
        email,
        telefone,
        biografia,
        foto_url,
    ))


def update_profissional(
    idfunc: int,
    nome=None,
    tipofunc=None,
    sexo=None,
    email=None,
    telefone=None,
    biografia=None,
    foto_url=None,
):
    campos = []
    valores = []

    if nome is not None:
        campos.append("nome = %s")
        valores.append(nome)

    if tipofunc is not None:
        campos.append("tipofunc = %s")
        valores.append(tipofunc)

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

    if len(campos) == 0:
        return select_profissional_by_id(idfunc)

    valores.append(idfunc)

    query = f"""
        UPDATE funcionario
        SET {', '.join(campos)}
        WHERE idfunc = %s
        RETURNING idfunc, nome, tipofunc, sexo, email, telefone, biografia, foto_url
    """
    return run_query(query, tuple(valores))


def delete_profissional(idfunc: int):
    return run_query("""
        DELETE FROM funcionario
        WHERE idfunc = %s
        RETURNING idfunc
    """, (idfunc,))