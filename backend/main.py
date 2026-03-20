from fastapi import FastAPI
from backend.db import get_connection
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

def run_query(query):
    try:
        con = get_connection()
        cur = con.cursor()

        cur.execute(query)

        colunas = [desc[0] for desc in cur.description]
        dados = cur.fetchall()

        resultado = [dict(zip(colunas, row)) for row in dados]

        return resultado

    except Exception as e:
        return {"erro": str(e)}

    finally:
        cur.close()
        con.close()

# ---------------------------
# TESTE
# ---------------------------
@app.get("/")
def home():
    return {"msg": "API a funcionar"}

# ---------------------------
# UTENTES
# ---------------------------
@app.get("/utentes")
def get_utentes():
    return run_query("SELECT * FROM Utente;")
    

# ---------------------------
# EXERCICIO B
# ---------------------------
@app.get("/exercicio-b")
def exercicio_b():
    return run_query("""
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
    """)
# ---------------------------
# EXERCICIO C
# ---------------------------
@app.get("/exercicio-c")
def exercicio_c():
   return run_query( """
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
    """)

    

# ---------------------------
# EXERCICIO D
# ---------------------------
@app.get("/exercicio-d")
def exercicio_d():
   return run_query( """
    SELECT Tipo, COUNT(*) as NrAtos
    FROM Ato
    GROUP BY Tipo;
    """
    )
    

# ---------------------------
# EXERCICIO E
# ---------------------------
@app.get("/exercicio-e")
def exercicio_e():
    return run_query( """
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
    """)

    

# ---------------------------
# EXERCICIO F (VIEW)
# ---------------------------
@app.get("/exercicio-f")
def exercicio_f():
    return run_query("SELECT * FROM FuncionarioDetalhes;")

    