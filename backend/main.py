from fastapi import FastAPI
from db import get_connection

app = FastAPI()

# ---------------------------
# TESTE
# ---------------------------
@app.get("/")
def home():
    return {"msg": "API a funcionar 🔥"}

# ---------------------------
# UTENTES
# ---------------------------
@app.get("/utentes")
def get_utentes():
    con = get_connection()
    cur = con.cursor()

    cur.execute("SELECT * FROM Utente;")
    data = cur.fetchall()

    cur.close()
    con.close()

    return data

# ---------------------------
# EXERCICIO B
# ---------------------------
@app.get("/exercicio-b")
def exercicio_b():
    con = get_connection()
    cur = con.cursor()

    query = """
    SELECT
        a.numutent,
        a.Idadeatual,
        a.localidade,
        b.codepurgenc,
        b.DataHoraEntr
    FROM Utente a, EpUrgencia b
    WHERE 
        a.numutent = b.numutent
        AND a.idadeatual > 60
        AND b.DataHoraEntr >= '2025-04-01 00:00:00'
        AND b.DataHoraEntr <= '2025-04-03 00:00:00';
    """

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    con.close()

    return data

# ---------------------------
# EXERCICIO C
# ---------------------------
@app.get("/exercicio-c")
def exercicio_c():
    con = get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        a.DataHoraInicio,
        a.DataHoraFim,
        b.NumFunc,
        b.TipoFunc
    FROM Ato a
    JOIN Realiza r 
        ON a.CodEpUrgenc = r.CodEpUrgenc 
        AND a.NomeHosp = r.NomeHosp 
        AND a.DataHoraInicio = r.DataHoraInicio
    JOIN Funcionario b 
        ON r.NumFunc = b.NumFunc
    WHERE 
        a.Tipo = 'Triagem'
        AND DataHoraFim >= '2025-01-01 00:00:00'
    UNION
    SELECT 
        a.DataHoraInicio,
        a.DataHoraFim,
        b.NumFunc,
        b.TipoFunc
    FROM Ato a
    JOIN Funcionario b 
        ON a.NumFuncPresc = b.NumFunc
    WHERE 
        a.Tipo = 'Triagem'
        AND DataHoraFim >= '2025-01-01 00:00:00';
    """

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    con.close()

    return data

# ---------------------------
# EXERCICIO D
# ---------------------------
@app.get("/exercicio-d")
def exercicio_d():
    con = get_connection()
    cur = con.cursor()

    query = """
    SELECT Tipo, COUNT(*) as NrAtos
    FROM Ato
    GROUP BY Tipo;
    """

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    con.close()

    return data

# ---------------------------
# EXERCICIO E
# ---------------------------
@app.get("/exercicio-e")
def exercicio_e():
    con = get_connection()
    cur = con.cursor()

    query = """
    SELECT 
        f.NumFunc,
        COUNT(a.NumFuncPresc) AS TotalPrescricoes,
        a.tipo
    FROM Ato a
    JOIN Funcionario f 
        ON a.NumFuncPresc = f.NumFunc
    WHERE 
        a.Tipo = 'Exame'
        AND a.DataHoraInicio >= '2024-01-01 00:00:00'
        AND a.DataHoraFim <= '2024-12-31 23:59:59'
    GROUP BY 
        f.NumFunc, a.tipo
    HAVING COUNT(a.NumFuncPresc) > 10;
    """

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    con.close()

    return data

# ---------------------------
# EXERCICIO F (VIEW)
# ---------------------------
@app.get("/exercicio-f")
def exercicio_f():
    con = get_connection()
    cur = con.cursor()

    query = "SELECT * FROM FuncionarioDetalhes;"

    cur.execute(query)
    data = cur.fetchall()

    cur.close()
    con.close()

    return data