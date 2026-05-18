from backend.db import run_query


def select_all_triagens():
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
               viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
               mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
               tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
               freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
               tempoesperaprevisto, idfunc
        FROM triagem
        ORDER BY datahorainicio DESC, codepurgenc DESC
    """)


def select_triagem_by_ep(cod_ep_urgenc: int):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
               viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
               mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
               tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
               freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
               tempoesperaprevisto, idfunc
        FROM triagem
        WHERE codepurgenc = %s
    """, (cod_ep_urgenc,))


def select_triagens_by_cor(cor_triagem: str):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
               viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
               mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
               tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
               freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
               tempoesperaprevisto, idfunc
        FROM triagem
        WHERE cortriagem = %s
        ORDER BY datahorainicio DESC, codepurgenc DESC
    """, (cor_triagem,))


def select_triagens_by_funcionario(id_func: int):
    return run_query("""
        SELECT codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
               viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
               mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
               tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
               freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
               tempoesperaprevisto, idfunc
        FROM triagem
        WHERE idfunc = %s
        ORDER BY datahorainicio DESC, codepurgenc DESC
    """, (id_func,))


def insert_triagem(
    cod_ep_urgenc, data_hora_inicio, data_hora_fim=None, cor_triagem=None,
    queixa_principal=None, via_aerea=None, respiracao_circulacao=None,
    hemorragia=None, consciencia=None, estado_pele=None, mobilidade=None,
    tipo_dor=None, dor_localizacao=None, sintomas=None, observacoes_clinicas=None,
    tempo_inicio_sintomas=None, escala_glasgow=None, isolamento=False,
    gravida=False, temperatura=None, freq_card=None, freq_resp=None, sp_o2=None,
    sistolica=None, diastolica=None, nivel_dor=None, tempo_espera_previsto=None,
    id_func=None
):
    return run_query("""
        INSERT INTO triagem (
            codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
            viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
            mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
            tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
            freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
            tempoesperaprevisto, idfunc
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
                  viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
                  mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
                  tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
                  freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
                  tempoesperaprevisto, idfunc
    """, (
        cod_ep_urgenc, data_hora_inicio, data_hora_fim, cor_triagem, queixa_principal,
        via_aerea, respiracao_circulacao, hemorragia, consciencia, estado_pele,
        mobilidade, tipo_dor, dor_localizacao, sintomas, observacoes_clinicas,
        tempo_inicio_sintomas, escala_glasgow, isolamento, gravida, temperatura,
        freq_card, freq_resp, sp_o2, sistolica, diastolica, nivel_dor,
        tempo_espera_previsto, id_func
    ))


def update_triagem(cod_ep_urgenc: int, **data):
    campos = []
    valores = []

    mapping = {
        "data_hora_inicio": "datahorainicio",
        "data_hora_fim": "datahorafim",
        "cor_triagem": "cortriagem",
        "queixa_principal": "queixaprincipal",
        "via_aerea": "viaaerea",
        "respiracao_circulacao": "respiracaocirculacao",
        "hemorragia": "hemorragia",
        "consciencia": "consciencia",
        "estado_pele": "estadopele",
        "mobilidade": "mobilidade",
        "tipo_dor": "tipodor",
        "dor_localizacao": "dorlocalizacao",
        "sintomas": "sintomas",
        "observacoes_clinicas": "observacoesclinicas",
        "tempo_inicio_sintomas": "tempoiniciosintomas",
        "escala_glasgow": "escalaglasgow",
        "isolamento": "isolamento",
        "gravida": "gravida",
        "temperatura": "temperatura",
        "freq_card": "freqcard",
        "freq_resp": "freqresp",
        "sp_o2": "spo2",
        "sistolica": "sistolica",
        "diastolica": "diastolica",
        "nivel_dor": "niveldor",
        "tempo_espera_previsto": "tempoesperaprevisto",
        "id_func": "idfunc",
    }

    for key, col in mapping.items():
        if key in data and data[key] is not None:
            campos.append(f"{col} = %s")
            valores.append(data[key])

    if not campos:
        return select_triagem_by_ep(cod_ep_urgenc)

    valores.append(cod_ep_urgenc)

    query = f"""
        UPDATE triagem
        SET {', '.join(campos)}
        WHERE codepurgenc = %s
        RETURNING codepurgenc, datahorainicio, datahorafim, cortriagem, queixaprincipal,
                  viaaerea, respiracaocirculacao, hemorragia, consciencia, estadopele,
                  mobilidade, tipodor, dorlocalizacao, sintomas, observacoesclinicas,
                  tempoiniciosintomas, escalaglasgow, isolamento, gravida, temperatura,
                  freqcard, freqresp, spo2, sistolica, diastolica, niveldor,
                  tempoesperaprevisto, idfunc
    """
    return run_query(query, tuple(valores))


def delete_triagem(cod_ep_urgenc: int):
    return run_query("""
        DELETE FROM triagem
        WHERE codepurgenc = %s
        RETURNING codepurgenc
    """, (cod_ep_urgenc,))