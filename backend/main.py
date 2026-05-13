from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import (
    utentes,
    episodios,
    triagem,
    internamento,
    profissionais,
    auth,
    ato,
    prescricao,
    hospital,
    medicamento,
    utilizadores,
    trabalha,
    alerta,
    medicacaoativa,
    utenteantecedente,
    logs,
    alergia,
    ia,
)

app = FastAPI(
    title="SIAGUH – Sistema Integrado de Apoio à Gestão de Urgências Hospitalares",
    description="API desenvolvida pelo G08 para gestão de utentes, episódios, triagem e módulos de IA.",
    version="0.69.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"msg": "API a funcionar seus sapos!"}


API_PREFIX = "/api"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(utentes.router, prefix=API_PREFIX)
app.include_router(episodios.router, prefix=API_PREFIX)
app.include_router(triagem.router, prefix=API_PREFIX)
app.include_router(internamento.router, prefix=API_PREFIX)
app.include_router(profissionais.router, prefix=API_PREFIX)
app.include_router(ato.router, prefix=API_PREFIX)
app.include_router(prescricao.router, prefix=API_PREFIX)
app.include_router(hospital.router, prefix=API_PREFIX)
app.include_router(medicamento.router, prefix=API_PREFIX)
app.include_router(utilizadores.router, prefix=API_PREFIX)
app.include_router(trabalha.router, prefix=API_PREFIX)
app.include_router(alerta.router, prefix=API_PREFIX)
app.include_router(medicacaoativa.router, prefix=API_PREFIX)
app.include_router(utenteantecedente.router, prefix=API_PREFIX)
app.include_router(logs.router, prefix=API_PREFIX)
app.include_router(alergia.router, prefix=API_PREFIX)
app.include_router(ia.router, prefix=API_PREFIX)