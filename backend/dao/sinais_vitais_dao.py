from backend.db import run_query


def select_all_sinais_vitais():
    return run_query("""
        SELECT idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
               sistolica, diastolica, niveldor, datahora, idfunc
        FROM sinaisvitais
        ORDER BY datahora DESC, idsinal DESC
    """)


def select_sinal_by_id(id_sinal: int):
    return run_query("""
        SELECT idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
               sistolica, diastolica, niveldor, datahora, idfunc
        FROM sinaisvitais
        WHERE idsinal = %s
    """, (id_sinal,))


def select_sinais_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
               sistolica, diastolica, niveldor, datahora, idfunc
        FROM sinaisvitais
        WHERE codepurgenc = %s
        ORDER BY datahora DESC, idsinal DESC
    """, (cod_ep_urgenc,))


def select_sinais_by_funcionario(id_func: int):
    return run_query("""
        SELECT idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
               sistolica, diastolica, niveldor, datahora, idfunc
        FROM sinaisvitais
        WHERE idfunc = %s
        ORDER BY datahora DESC, idsinal DESC
    """, (id_func,))


def insert_sinal_vital(
    cod_ep_urgenc, temperatura=None, freq_card=None, freq_resp=None, sp_o2=None,
    sistolica=None, diastolica=None, nivel_dor=None, data_hora=None, id_func=None
):
    return run_query("""
        INSERT INTO sinaisvitais (
            codepurgenc, temperatura, freqcard, freqresp, spo2, sistolica,
            diastolica, niveldor, datahora, idfunc
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, COALESCE(%s, NOW()), %s
        )
        RETURNING idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
                  sistolica, diastolica, niveldor, datahora, idfunc
    """, (
        cod_ep_urgenc, temperatura, freq_card, freq_resp, sp_o2, sistolica,
        diastolica, nivel_dor, data_hora, id_func
    ))


def update_sinal_vital(id_sinal: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_ep_urgenc": "codepurgenc",
        "temperatura": "temperatura",
        "freq_card": "freqcard",
        "freq_resp": "freqresp",
        "sp_o2": "spo2",
        "sistolica": "sistolica",
        "diastolica": "diastolica",
        "nivel_dor": "niveldor",
        "data_hora": "datahora",
        "id_func": "idfunc",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_sinal_by_id(id_sinal)

    valores.append(id_sinal)

    query = f"""
        UPDATE sinaisvitais
        SET {', '.join(campos)}
        WHERE idsinal = %s
        RETURNING idsinal, codepurgenc, temperatura, freqcard, freqresp, spo2,
                  sistolica, diastolica, niveldor, datahora, idfunc
    """
    return run_query(query, tuple(valores))


def delete_sinal_vital(id_sinal: int):
    return run_query("""
        DELETE FROM sinaisvitais
        WHERE idsinal = %s
        RETURNING idsinal
    """, (id_sinal,))