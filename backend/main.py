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
    medicamento
)

app = FastAPI(
    title="SIGUI – Sistema Integrado de Gestão de Urgências e Internamentos",
    description="API desenvolvida pelo G08 para gestão de utentes, episódios e triagem.",
    version="0.25.0"
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
    return {"msg": "API a funcionar seus sapos!"}


app.include_router(auth.router, prefix="/api")
app.include_router(utentes.router, prefix="/api")
app.include_router(episodios.router, prefix="/api")
app.include_router(triagem.router, prefix="/api")
app.include_router(internamento.router, prefix="/api")
app.include_router(profissionais.router, prefix="/api")
app.include_router(ato.router, prefix="/api")
app.include_router(prescricao.router, prefix="/api")
app.include_router(hospital.router, prefix="/api")
app.include_router(medicamento.router, prefix="/api")