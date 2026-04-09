from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import get_connection


app = FastAPI(
    title="PRODIGI G08 – Gestão de Urgências Hospitalares",
    description="API para gestão de utentes, episódios e triagem.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
# AQUI VAI FICAR OS OUTROS ENDPOINTS
# Depois criamos:
# - routers/utentes.py
# - routers/auth.py
# e registamos:
# from backend.routers import utentes, auth
# app.include_router(utentes.router, prefix="/api/utentes")
# app.include_router(auth.router, prefix="/api/auth")