from backend.db import run_query

_SELECT = """
    SELECT t.codepurgenc, t.datahorainicio, t.datahorafim, t.cortriagem, t.sintomas,
           t.temperatura, t.freqcard, t.freqresp, t.spo2, t.sistolica, t.diastolica,
           t.niveldor, t.consciencia, t.tempoesperaprevisto,
           t.idfunc,
           f.nome  AS nome_enfermeiro,
           u.nome  AS nome_utente,
           u.numutent AS num_utent
    FROM triagem t
    LEFT JOIN funcionario f ON f.idfunc      = t.idfunc
    LEFT JOIN epurgencia  e ON e.codepurgenc = t.codepurgenc
    LEFT JOIN utente      u ON u.numutent    = e.numutent
"""


def select_all_triagens():
    return run_query(f"""
        {_SELECT}
        ORDER BY t.datahorainicio DESC
    """)


def select_triagem_by_episodio(codepurgenc: int):
    return run_query(f"""
        {_SELECT}
        WHERE t.codepurgenc = %s
    """, (codepurgenc,))


def select_triagens_by_hospital(idhosp: int):
    return run_query(f"""
        {_SELECT}
        WHERE e.idhosp = %s
        ORDER BY t.datahorainicio DESC
    """, (idhosp,))


def insert_triagem(
    codepurgenc: int,
    datahorainicio,
    cortriagem: str,
    sintomas: str,
    datahorafim=None,
    temperatura=None,
    freqcard=None,
    freqresp=None,
    spo2=None,
    sistolica=None,
    diastolica=None,
    niveldor=None,
    consciencia=None,
    tempoesperaprevisto=None,
    idfunc=None,
):
    return run_query("""
        INSERT INTO triagem (
            codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
            temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
            niveldor, consciencia, tempoesperaprevisto, idfunc
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
                  temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
                  niveldor, consciencia, tempoesperaprevisto, idfunc
    """, (
        codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
        temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
        niveldor, consciencia, tempoesperaprevisto, idfunc,
    ))


def update_triagem(
    codepurgenc: int,
    datahorafim=None,
    cortriagem=None,
    sintomas=None,
    temperatura=None,
    freqcard=None,
    freqresp=None,
    spo2=None,
    sistolica=None,
    diastolica=None,
    niveldor=None,
    consciencia=None,
    tempoesperaprevisto=None,
    idfunc=None,
):
    campos = []
    valores = []

    if datahorafim is not None:
        campos.append("datahorafim = %s")
        valores.append(datahorafim)

    if cortriagem is not None:
        campos.append("cortriagem = %s")
        valores.append(cortriagem)

    if sintomas is not None:
        campos.append("sintomas = %s")
        valores.append(sintomas)

    if temperatura is not None:
        campos.append("temperatura = %s")
        valores.append(temperatura)

    if freqcard is not None:
        campos.append("freqcard = %s")
        valores.append(freqcard)

    if freqresp is not None:
        campos.append("freqresp = %s")
        valores.append(freqresp)

    if spo2 is not None:
        campos.append("spo2 = %s")
        valores.append(spo2)

    if sistolica is not None:
        campos.append("sistolica = %s")
        valores.append(sistolica)

    if diastolica is not None:
        campos.append("diastolica = %s")
        valores.append(diastolica)

    if niveldor is not None:
        campos.append("niveldor = %s")
        valores.append(niveldor)

    if consciencia is not None:
        campos.append("consciencia = %s")
        valores.append(consciencia)

    if tempoesperaprevisto is not None:
        campos.append("tempoesperaprevisto = %s")
        valores.append(tempoesperaprevisto)

    if idfunc is not None:
        campos.append("idfunc = %s")
        valores.append(idfunc)

    if len(campos) == 0:
        return select_triagem_by_episodio(codepurgenc)

    valores.append(codepurgenc)

    query = f"""
        UPDATE triagem
        SET {', '.join(campos)}
        WHERE codepurgenc = %s
        RETURNING codepurgenc, datahorainicio, datahorafim, cortriagem, sintomas,
                  temperatura, freqcard, freqresp, spo2, sistolica, diastolica,
                  niveldor, consciencia, tempoesperaprevisto, idfunc
    """
    return run_query(query, tuple(valores))


def delete_triagem(codepurgenc: int):
    return run_query("""
        DELETE FROM triagem
        WHERE codepurgenc = %s
        RETURNING codepurgenc
    """, (codepurgenc,))