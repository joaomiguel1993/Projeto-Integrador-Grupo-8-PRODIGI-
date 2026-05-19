from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import (
    alergia,
    alerta,
    antecedentes,
    ato,
    contexto_prescricao,
    enfermeiros,
    ep_urgencia,
    estatisticas_ia,
    exame,
    funcionarios,
    historico_internamento,
    hospitais,
    internamento,
    log_atividade,
    medicacao_ativa,
    medicamentos,
    medicos,
    predicao_ia,
    prescreve,
    realiza,
    reavaliacao_triagem,
    sinais_vitais,
    trabalha,
    triagem,
    utentes,
    utente_antecedentes,
    utilizadores,
    auth,
)

app = FastAPI(
    title="🏥 SIAGUH",
    description="Sistema Integrado de Apoio à Gestão de Urgências Hospitalares",
    version="0.0.69",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(alergia.router)
app.include_router(alerta.router)
app.include_router(antecedentes.router)
app.include_router(ato.router)
app.include_router(contexto_prescricao.router)
app.include_router(enfermeiros.router)
app.include_router(ep_urgencia.router)
app.include_router(estatisticas_ia.router)
app.include_router(exame.router)
app.include_router(funcionarios.router)
app.include_router(historico_internamento.router)
app.include_router(hospitais.router)
app.include_router(internamento.router)
app.include_router(log_atividade.router)
app.include_router(medicacao_ativa.router)
app.include_router(medicamentos.router)
app.include_router(medicos.router)
app.include_router(predicao_ia.router)
app.include_router(prescreve.router)
app.include_router(realiza.router)
app.include_router(reavaliacao_triagem.router)
app.include_router(sinais_vitais.router)
app.include_router(trabalha.router)
app.include_router(triagem.router)
app.include_router(utentes.router)
app.include_router(utente_antecedentes.router)
app.include_router(utilizadores.router)
app.include_router(auth.router)