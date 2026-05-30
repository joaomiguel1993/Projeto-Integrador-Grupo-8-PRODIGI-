from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from backend.auth.jwt_utils import get_current_user
from backend.auth.security import hash_password
from backend.db import get_connection

from backend.routers import (
    utentes, episodios, triagem, internamento, profissionais,
    auth, ato, prescricao, hospital, medicamento, utilizadores,
    trabalha, alerta, medicacaoativa, utenteantecedente, logs,
    alergia, painel_router
)

app = FastAPI(
    title="SIAGUH – Sistema Integrado de Apoio à Gestão de Urgências Hospitalares",
    description="API desenvolvida pelo G08 para gestão de utentes, episódios, triagem e módulos de IA.",
    version="0.69.0"
)

ALLOWED_ORIGINS = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )


def corrigir_passwords_texto_simples():
    """Corrige passwords guardadas em texto simples — migração automática pós-JWT."""
    utilizadores_teste = [
        ("admin.teste",      "Admin123!"),
        ("rececao.teste",    "Rececao123!"),
        ("enfermeiro.teste", "Enf123!"),
        ("medico.teste",     "Med123!"),
    ]

    conn = get_connection()
    cur = conn.cursor()
    try:
        for username, password in utilizadores_teste:
            cur.execute("SELECT password FROM utilizador WHERE username = %s;", (username,))
            row = cur.fetchone()
            if row:
                password_db = row[0]
                if not password_db.startswith("$2b$"):
                    novo_hash = hash_password(password)
                    cur.execute(
                        "UPDATE utilizador SET password = %s WHERE username = %s;",
                        (novo_hash, username)
                    )
                    print(f"[MIGRAÇÃO] Password de {username} corrigida.")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"[MIGRAÇÃO] Erro ao corrigir passwords: {e}")
    finally:
        cur.close()
        conn.close()


corrigir_passwords_texto_simples()


@app.get("/v1", tags=["Home"])
def home():
    return {"msg": "API a funcionar seus sapos!"}

API_PREFIX = "/api"

# Rotas públicas — sem autenticação
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(hospital.router, prefix=API_PREFIX)
app.include_router(painel_router.router, prefix=API_PREFIX)

# Rotas protegidas — requerem token JWT válido
_jwt = [Depends(get_current_user)]

app.include_router(utentes.router,           prefix=API_PREFIX, dependencies=_jwt)
app.include_router(episodios.router,         prefix=API_PREFIX, dependencies=_jwt)
app.include_router(triagem.router,           prefix=API_PREFIX, dependencies=_jwt)
app.include_router(internamento.router,      prefix=API_PREFIX, dependencies=_jwt)
app.include_router(profissionais.router,     prefix=API_PREFIX, dependencies=_jwt)
app.include_router(ato.router,               prefix=API_PREFIX, dependencies=_jwt)
app.include_router(prescricao.router,        prefix=API_PREFIX, dependencies=_jwt)
app.include_router(medicamento.router,       prefix=API_PREFIX, dependencies=_jwt)
app.include_router(utilizadores.router,      prefix=API_PREFIX, dependencies=_jwt)
app.include_router(trabalha.router,          prefix=API_PREFIX, dependencies=_jwt)
app.include_router(alerta.router,            prefix=API_PREFIX, dependencies=_jwt)
app.include_router(medicacaoativa.router,    prefix=API_PREFIX, dependencies=_jwt)
app.include_router(utenteantecedente.router, prefix=API_PREFIX, dependencies=_jwt)
app.include_router(logs.router,              prefix=API_PREFIX, dependencies=_jwt)
app.include_router(alergia.router,           prefix=API_PREFIX, dependencies=_jwt)