# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.db import run_query, get_connection
from backend.routers import utentes, episodios, triagem, internados, proficionais, auth


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


@app.get("/")
def home():
    return {"msg": "API a funcionar"}


app.include_router(utentes.router, prefix="/api")
app.include_router(episodios.router, prefix="/api")
app.include_router(triagem.router, prefix="/api")
app.include_router(internados.router, prefix="/api")
app.include_router(proficionais.router, prefix="/api")
app.include_router(auth.router, prefix="/api")