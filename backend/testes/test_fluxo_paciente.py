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


@pytest.fixture(scope="module")
def estado():
    return {}


@pytest.mark.anyio
async def test_ct02_1_admissao(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        token = await obter_token(ac)
        estado["headers"] = {"Authorization": f"Bearer {token}"}

        r = await ac.post("/api/v1/episodios/", json={
            "num_utent": 1,
            "id_hosp": 1,
        }, headers=estado["headers"])
        assert r.status_code == 201, r.text
        estado["ep_id"] = r.json()["cod_ep_urgenc"]

        r = await ac.get(f"/api/v1/episodios/{estado['ep_id']}", headers=estado["headers"])
        assert r.json()["estado"] == "aberto"


@pytest.mark.anyio
async def test_ct02_2_triagem(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        ep_id = estado["ep_id"]
        headers = estado["headers"]

        r = await ac.post("/api/v1/triagens/", json={
            "cod_ep_urgenc": ep_id,
            "cor_triagem": "verde",
            "sintomas": "Teste automatizado",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 201, r.text

        r = await ac.put(f"/api/v1/episodios/{ep_id}", json={"estado": "em_atendimento"}, headers=headers)
        assert r.status_code == 200

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "em_atendimento"


@pytest.mark.anyio
async def test_ct02_3_ato_clinico(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        ep_id = estado["ep_id"]
        headers = estado["headers"]

        r = await ac.post("/api/v1/atos/", json={
            "cod_ep_urgenc": ep_id,
            "tipo": "consulta",
            "descricao": "Consulta de rotina - teste",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 201, r.text

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "em_atendimento"


@pytest.mark.anyio
async def test_ct02_4_alta(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        ep_id = estado["ep_id"]
        headers = estado["headers"]

        r = await ac.put(f"/api/v1/episodios/{ep_id}", json={
            "estado": "terminado",
            "data_hora_saida": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 200

        r = await ac.get(f"/api/v1/episodios/{ep_id}", headers=headers)
        assert r.json()["estado"] == "terminado"