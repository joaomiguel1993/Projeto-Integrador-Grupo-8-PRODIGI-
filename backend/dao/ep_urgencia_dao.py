from backend.db import run_query


def select_all_ep_urgencia():
    return run_query("""
        SELECT codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
               datahorasaida, estado, prioridadeatual, tempoesperaatual,
               emobservacao, destinofinal
        FROM epurgencia
        ORDER BY datahoraentr DESC, codepurgenc DESC
    """)


def select_ep_urgencia_by_id(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
               datahorasaida, estado, prioridadeatual, tempoesperaatual,
               emobservacao, destinofinal
        FROM epurgencia
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))


def select_ep_urgencia_by_nif(nif: str):
    return run_query("""
        SELECT codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
               datahorasaida, estado, prioridadeatual, tempoesperaatual,
               emobservacao, destinofinal
        FROM epurgencia
        WHERE nif = %s
        ORDER BY datahoraentr DESC, codepurgenc DESC
    """, (nif,))


def select_ep_urgencia_by_hospital(id_hosp: int):
    return run_query("""
        SELECT codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
               datahorasaida, estado, prioridadeatual, tempoesperaatual,
               emobservacao, destinofinal
        FROM epurgencia
        WHERE idhosp = %s
        ORDER BY datahoraentr DESC, codepurgenc DESC
    """, (id_hosp,))


def select_ep_urgencia_by_estado(estado: str):
    return run_query("""
        SELECT codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
               datahorasaida, estado, prioridadeatual, tempoesperaatual,
               emobservacao, destinofinal
        FROM epurgencia
        WHERE estado = %s
        ORDER BY datahoraentr DESC, codepurgenc DESC
    """, (estado,))


def insert_ep_urgencia(
    nif, id_hosp, data_hora_entr=None, data_hora_atendimento=None,
    data_hora_saida=None, estado="aberto", prioridade_atual=None,
    tempo_espera_atual=None, em_observacao=False, destino_final=None
):
    return run_query("""
        INSERT INTO epurgencia (
            nif, idhosp, datahoraentr, datahoraatendimento, datahorasaida,
            estado, prioridadeatual, tempoesperaatual, emobservacao, destinofinal
        )
        VALUES (
            %s, %s, COALESCE(%s, NOW()), %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
                  datahorasaida, estado, prioridadeatual, tempoesperaatual,
                  emobservacao, destinofinal
    """, (
        nif, id_hosp, data_hora_entr, data_hora_atendimento, data_hora_saida,
        estado, prioridade_atual, tempo_espera_atual, em_observacao, destino_final
    ))


def update_ep_urgencia(cod_ep_urgenc: int, **data):
    campos = []
    valores = []

    mapping = {
        "nif": "nif",
        "id_hosp": "idhosp",
        "data_hora_entr": "datahoraentr",
        "data_hora_atendimento": "datahoraatendimento",
        "data_hora_saida": "datahorasaida",
        "estado": "estado",
        "prioridade_atual": "prioridadeatual",
        "tempo_espera_atual": "tempoesperaatual",
        "em_observacao": "emobservacao",
        "destino_final": "destinofinal",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_ep_urgencia_by_id(cod_ep_urgenc)

    valores.append(cod_ep_urgenc)

    query = f"""
        UPDATE epurgencia
        SET {', '.join(campos)}
        WHERE codepurgenc = %s
        RETURNING codepurgenc, nif, idhosp, datahoraentr, datahoraatendimento,
                  datahorasaida, estado, prioridadeatual, tempoesperaatual,
                  emobservacao, destinofinal
    """
    return run_query(query, tuple(valores))


def delete_ep_urgencia(cod_ep_urgenc: int):
    return run_query("""
        DELETE FROM epurgencia
        WHERE codepurgenc = %s
        RETURNING codepurgenc
    """, (cod_ep_urgenc,))