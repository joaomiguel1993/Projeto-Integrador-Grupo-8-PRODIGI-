# CT02 - Ciclo de Vida do Paciente
import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from datetime import datetime, timezone

BASE = "http://test"

async def obter_token(ac):
    r = await ac.post("/api/v1/auth/login", json={
        "username": "medico.teste",
        "password": "Med123!"
    })
    return r.json().get("access_token")

@pytest.mark.asyncio
async def test_ciclo_vida_paciente():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:

        token = await obter_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. ADMISSÃO — cria episódio
        r = await ac.post("/api/v1/episodios/", json={
            "num_utent": 1,
            "id_hosp": 1,
        }, headers=headers)
        assert r.status_code == 201, r.text
        ep = r.json()
        ep_id = ep["cod_ep_urgenc"]

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "aberto"

        # 2. TRIAGEM
        from datetime import datetime, timezone

        r = await ac.post("/api/v1/triagens/", json={
            "cod_ep_urgenc": ep_id,
            "cor_triagem": "verde",
            "sintomas": "Teste automatizado",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 201, r.text

        r = await ac.put(f"/api/v1/episodios/{ep_id}", json={
            "estado": "em_atendimento"
        }, headers=headers)
        assert r.status_code == 200

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "em_atendimento"

        # 3. ATO CLÍNICO
        r = await ac.post("/api/v1/atos/", json={
            "cod_ep_urgenc": ep_id,
            "tipo": "consulta",
            "descricao": "Consulta de rotina - teste",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 201, r.text

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "em_atendimento"

        # 4. ALTA
        r = await ac.put(f"/api/v1/episodios/{ep_id}", json={
            "estado": "terminado",
            "data_hora_saida": "2026-05-31T20:00:00"
        }, headers=headers)
        assert r.status_code == 200

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "terminado"

        print(f"✅ Ciclo de vida do episódio #{ep_id} validado com sucesso!")