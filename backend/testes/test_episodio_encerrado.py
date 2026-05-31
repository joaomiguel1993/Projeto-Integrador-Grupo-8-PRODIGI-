# CT03 - Operação em Episódio Encerrado
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


@pytest.mark.asyncio
async def test_ct03_1_criar_e_encerrar_episodio(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        token = await obter_token(ac)
        estado["headers"] = {"Authorization": f"Bearer {token}"}

        # Cria episódio
        r = await ac.post("/api/v1/episodios/", json={
            "num_utent": 1,
            "id_hosp": 1,
        }, headers=estado["headers"])
        assert r.status_code == 201, r.text
        estado["ep_id"] = r.json()["cod_ep_urgenc"]

        # Encerra o episódio
        r = await ac.put(f"/api/v1/episodios/{estado['ep_id']}", json={
            "estado": "terminado",
            "data_hora_saida": datetime.now(timezone.utc).isoformat(),
        }, headers=estado["headers"])
        assert r.status_code == 200

        r = await ac.get(f"/api/v1/episodios/{estado['ep_id']}", headers=estado["headers"])
        assert r.json()["estado"] == "terminado"


@pytest.mark.asyncio
async def test_ct03_2_triagem_em_episodio_encerrado(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        ep_id = estado["ep_id"]
        headers = estado["headers"]

        r = await ac.post("/api/v1/triagens/", json={
            "cod_ep_urgenc": ep_id,
            "cor_triagem": "verde",
            "sintomas": "Tentativa inválida",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 400, r.text


@pytest.mark.asyncio
async def test_ct03_3_ato_em_episodio_encerrado(estado):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url=BASE) as ac:
        ep_id = estado["ep_id"]
        headers = estado["headers"]

        r = await ac.post("/api/v1/atos/", json={
            "cod_ep_urgenc": ep_id,
            "tipo": "consulta",
            "descricao": "Tentativa inválida",
            "data_hora_inicio": datetime.now(timezone.utc).isoformat(),
        }, headers=headers)
        assert r.status_code == 400, r.text