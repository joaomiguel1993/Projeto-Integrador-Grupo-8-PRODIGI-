from backend.db import run_query


def select_all_reavaliacoes():
    return run_query("""
        SELECT idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
               freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
        FROM reavaliacaotriagem
        ORDER BY datahora DESC, idreavaliacao DESC
    """)


def select_reavaliacao_by_id(id_reavaliacao: int):
    return run_query("""
        SELECT idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
               freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
        FROM reavaliacaotriagem
        WHERE idreavaliacao = %s
    """, (id_reavaliacao,))


def select_reavaliacoes_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
               freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
        FROM reavaliacaotriagem
        WHERE codepurgenc = %s
        ORDER BY datahora DESC, idreavaliacao DESC
    """, (cod_ep_urgenc,))


def select_reavaliacoes_by_funcionario(id_func: int):
    return run_query("""
        SELECT idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
               freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
        FROM reavaliacaotriagem
        WHERE idfunc = %s
        ORDER BY datahora DESC, idreavaliacao DESC
    """, (id_func,))


def insert_reavaliacao_triagem(
    cod_ep_urgenc, data_hora=None, temperatura=None, freq_card=None,
    freq_resp=None, sp_o2=None, nivel_dor=None, observacoes=None,
    nova_cor_triagem=None, id_func=None
):
    return run_query("""
        INSERT INTO reavaliacaotriagem (
            codepurgenc, datahora, temperatura, freqcard, freqresp, spo2,
            niveldor, observacoes, novacortriagem, idfunc
        )
        VALUES (
            %s, COALESCE(%s, NOW()), %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
                  freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
    """, (
        cod_ep_urgenc, data_hora, temperatura, freq_card, freq_resp, sp_o2,
        nivel_dor, observacoes, nova_cor_triagem, id_func
    ))


def update_reavaliacao_triagem(id_reavaliacao: int, **data):
    campos = []
    valores = []

    mapping = {
        "cod_ep_urgenc": "codepurgenc",
        "data_hora": "datahora",
        "temperatura": "temperatura",
        "freq_card": "freqcard",
        "freq_resp": "freqresp",
        "sp_o2": "spo2",
        "nivel_dor": "niveldor",
        "observacoes": "observacoes",
        "nova_cor_triagem": "novacortriagem",
        "id_func": "idfunc",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_reavaliacao_by_id(id_reavaliacao)

    valores.append(id_reavaliacao)

    query = f"""
        UPDATE reavaliacaotriagem
        SET {', '.join(campos)}
        WHERE idreavaliacao = %s
        RETURNING idreavaliacao, codepurgenc, datahora, temperatura, freqcard,
                  freqresp, spo2, niveldor, observacoes, novacortriagem, idfunc
    """
    return run_query(query, tuple(valores))


def delete_reavaliacao_triagem(id_reavaliacao: int):
    return run_query("""
        DELETE FROM reavaliacaotriagem
        WHERE idreavaliacao = %s
        RETURNING idreavaliacao
    """, (id_reavaliacao,))