import pytest
import uuid
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.auth.jwt_utils import get_current_user

BASE_URL = "http://test"


def agora_iso():
    return datetime.now(timezone.utc).isoformat()


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


@pytest.fixture(autouse=True)
def clear_overrides():
    app.dependency_overrides = {}
    yield
    app.dependency_overrides = {}


@pytest.fixture
def override_user_admin():
    def _override():
        return {
            "username": "admin.teste",
            "sub": "admin.teste",
            "id_func": 1,
            "role": "admin",
        }
    app.dependency_overrides[get_current_user] = _override
    return _override


@pytest.fixture
def override_user_medico():
    def _override():
        return {
            "username": "medico.teste",
            "sub": "medico.teste",
            "id_func": 2,
            "role": "medico",
        }
    app.dependency_overrides[get_current_user] = _override
    return _override


@pytest.fixture
def override_user_enfermeiro():
    def _override():
        return {
            "username": "enfermeiro.teste",
            "sub": "enfermeiro.teste",
            "id_func": 3,
            "role": "enfermeiro",
        }
    app.dependency_overrides[get_current_user] = _override
    return _override


@pytest.fixture
def override_user_rececionista():
    def _override():
        return {
            "username": "rececionista.teste",
            "sub": "rececionista.teste",
            "id_func": 4,
            "role": "rececionista",
        }
    app.dependency_overrides[get_current_user] = _override
    return _override


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url=BASE_URL,
        follow_redirects=True,
    ) as ac:
        yield ac


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
async def utente_criado(client, override_user_rececionista):
    payload = build_utente_payload()
    response = await client.post(
        "/api/v1/utentes/",
        json=payload,
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def episodio_aberto(client, override_user_rececionista, utente_criado):
    response = await client.post(
        "/api/v1/episodios/",
        json={
            "num_utent": utente_criado["num_utent"],
            "id_hosp": 1,
        },
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def triagem_criada(client, override_user_enfermeiro, episodio_aberto):
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
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
async def ato_criado(client, override_user_medico, episodio_aberto):
    response = await client.post(
        "/api/v1/atos/",
        json={
            "cod_ep_urgenc": episodio_aberto["cod_ep_urgenc"],
            "tipo": "consulta",
            "descricao": "Consulta de rotina - teste",
            "data_hora_inicio": agora_iso(),
        },
    )
    assert response.status_code in [200, 201], response.text
    return response.json()


@pytest.fixture
def set_test_user():
    def _set(role: str):
        role_map = {
            "admin": {
                "username": "admin.teste",
                "sub": "admin.teste",
                "id_func": 1,
                "role": "admin",
            },
            "medico": {
                "username": "medico.teste",
                "sub": "medico.teste",
                "id_func": 2,
                "role": "medico",
            },
            "enfermeiro": {
                "username": "enfermeiro.teste",
                "sub": "enfermeiro.teste",
                "id_func": 3,
                "role": "enfermeiro",
            },
            "rececionista": {
                "username": "rececionista.teste",
                "sub": "rececionista.teste",
                "id_func": 4,
                "role": "rececionista",
            },
        }

        def _override():
            return role_map[role]

        app.dependency_overrides[get_current_user] = _override

    return _set