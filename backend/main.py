from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import run_query, get_connection


app = FastAPI(
    title="PRODIGI – Gestão de Urgências Hospitalares",
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


# ---------------------------
# TESTE
# ---------------------------
@app.get("/")
def home():
    return {"msg": "API a funcionar"}


# ---------------------------
# INCLUIR ROTEADORES AQUI
# ---------------------------
from .routers import utentes

app.include_router(utentes.router)