import pytest
import uuid
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport

from backend.main import app

BASE_URL = "http://test"


def agora_iso():
    return datetime.now(timezone.utc).isoformat()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url=BASE_URL,
        follow_redirects=True,
    ) as ac:
        yield ac


@pytest.fixture
def user_credentials():
    return {
        "admin": {"username": "admin.teste", "password": "Admin123!"},
        "medico": {"username": "medico.teste", "password": "Med123!"},
        "enfermeiro": {"username": "enfermeiro.teste", "password": "Enf123!"},
        "rececionista": {"username": "rececionista.teste", "password": "Rec123!"},
    }


@pytest.fixture
def login_as(client: AsyncClient, user_credentials):
    async def _login(role: str):
        creds = user_credentials[role]
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username": creds["username"],
                "password": creds["password"],
            },
        )
        assert response.status_code == 200, response.text
        token = response.json().get("access_token")
        assert token, response.text
        return {"Authorization": f"Bearer {token}"}

    return _login


@pytest.fixture
async def admin_headers(login_as):
    return await login_as("admin")


@pytest.fixture
async def medico_headers(login_as):
    return await login_as("medico")


@pytest.fixture
async def enfermeiro_headers(login_as):
    return await login_as("enfermeiro")


@pytest.fixture
async def rececionista_headers(login_as):
    return await login_as("rececionista")


def build_utente_payload():
    suffix = uuid.uuid4().hex[:6]
    nif_num = 100000000 + (uuid.uuid4().int % 899999999)
    return {
        "nome": f"Utente Teste {suffix}",
        "nif": str(nif_num),
        "data_nasc": "1990-01-01",
        "sexo": "M",
        "localidade": "Lisboa",
        "telefone": "912345678",
        "email": f"utente_{suffix}@example.com",
    }


@pytest.fixture
async def utente_criado(client, rececionista_headers):
    payload = build_utente_payload()
    response = await client.post(
        "/api/v1/utentes/",
        json=payload,
        headers=rececionista_headers,
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def episodio_aberto(client, rececionista_headers, utente_criado):
    response = await client.post(
        "/api/v1/episodios/",
        json={
            "num_utent": utente_criado["num_utent"],
            "id_hosp": 1,
        },
        headers=rececionista_headers,
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def triagem_criada(client, enfermeiro_headers, episodio_aberto):
    response = await client.post(
        "/api/v1/triagens/",
        json={
            "cod_ep_urgenc": episodio_aberto["cod_ep_urgenc"],
            "data_hora_inicio": agora_iso(),
            "cor_triagem": "verde",
            "sintomas": "Teste automatizado",
            "temperatura": 36.7,
            "freq_card": 75,
            "freq_resp": 16,
            "sp_o2": 98.0,
            "sistolica": 120,
            "diastolica": 80,
            "nivel_dor": 2,
            "consciencia": "Acordado",
        },
        headers=enfermeiro_headers,
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def ato_criado(client, medico_headers, episodio_aberto):
    response = await client.post(
        "/api/v1/atos/",
        json={
            "cod_ep_urgenc": episodio_aberto["cod_ep_urgenc"],
            "tipo": "consulta",
            "descricao": "Consulta de rotina - teste",
            "data_hora_inicio": agora_iso(),
        },
        headers=medico_headers,
    )
    assert response.status_code in [200, 201], response.text
    return response.json()