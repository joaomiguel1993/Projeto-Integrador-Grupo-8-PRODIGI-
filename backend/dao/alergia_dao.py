from backend.db import run_query


def select_all_alergias():
    return run_query("""
        SELECT codalergia, nif, substancia, classeterapeutica, nivelgravidade,
               reacao, dataregisto
        FROM alergia
        ORDER BY dataregisto DESC, codalergia DESC
    """)


def select_alergia_by_id(cod_alergia: int):
    return run_query("""
        SELECT codalergia, nif, substancia, classeterapeutica, nivelgravidade,
               reacao, dataregisto
        FROM alergia
        WHERE codalergia = %s
    """, (cod_alergia,))


def select_alergias_by_nif(nif: str):
    return run_query("""
        SELECT codalergia, nif, substancia, classeterapeutica, nivelgravidade,
               reacao, dataregisto
        FROM alergia
        WHERE nif = %s
        ORDER BY dataregisto DESC, codalergia DESC
    """, (nif,))


def select_alergias_by_classe(classe_terapeutica: str):
    return run_query("""
        SELECT codalergia, nif, substancia, classeterapeutica, nivelgravidade,
               reacao, dataregisto
        FROM alergia
        WHERE classeterapeutica = %s
        ORDER BY dataregisto DESC, codalergia DESC
    """, (classe_terapeutica,))


def insert_alergia(
    nif, substancia, classe_terapeutica, nivel_gravidade=None,
    reacao=None, data_registo=None
):
    return run_query("""
        INSERT INTO alergia (
            nif, substancia, classeterapeutica, nivelgravidade, reacao, dataregisto
        )
        VALUES (
            %s, %s, %s, %s, %s, COALESCE(%s, CURRENT_DATE)
        )
        RETURNING codalergia, nif, substancia, classeterapeutica, nivelgravidade,
                  reacao, dataregisto
    """, (
        nif, substancia, classe_terapeutica, nivel_gravidade, reacao, data_registo
    ))


def update_alergia(cod_alergia: int, **data):
    campos = []
    valores = []

    mapping = {
        "nif": "nif",
        "substancia": "substancia",
        "classe_terapeutica": "classeterapeutica",
        "nivel_gravidade": "nivelgravidade",
        "reacao": "reacao",
        "data_registo": "dataregisto",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_alergia_by_id(cod_alergia)

    valores.append(cod_alergia)

    query = f"""
        UPDATE alergia
        SET {', '.join(campos)}
        WHERE codalergia = %s
        RETURNING codalergia, nif, substancia, classeterapeutica, nivelgravidade,
                  reacao, dataregisto
    """
    return run_query(query, tuple(valores))


def delete_alergia(cod_alergia: int):
    return run_query("""
        DELETE FROM alergia
        WHERE codalergia = %s
        RETURNING codalergia
    """, (cod_alergia,))