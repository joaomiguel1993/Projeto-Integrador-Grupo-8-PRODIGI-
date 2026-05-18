from fastapi import FastAPI
from ia.src.api.v1 import (
    triage_routes,
    wait_time_routes,
    medicine_risk_routes,
    nlp_routes,
    health_routes,
)
from ia.src.core.config import settings

app = FastAPI(title=settings.APP_NAME)

app.include_router(health_routes.router)
app.include_router(triage_routes.router)
app.include_router(wait_time_routes.router)
app.include_router(medicine_risk_routes.router)
app.include_router(nlp_routes.router)