import pytest
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.auth.jwt_utils import get_current_user


def override_get_current_user():
    return {
        "id": 1,
        "username": "teste",
        "role": "admin",
    }


@pytest.mark.anyio
async def test_ciclo_vida_paciente():
    app.dependency_overrides[get_current_user] = override_get_current_user

    transport = ASGITransport(app=app)

    try:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/episodios/",
                json={"num_utent": 123456789, "id_hosp": 1},
            )
            assert response.status_code == 200, response.text
            episodio_id = response.json()["id"]

            resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
            assert resp.status_code == 200, resp.text
            assert resp.json()["estado"] == "Em Espera"

            response = await ac.post(
                "/api/v1/triagens/",
                json={"episodio_id": episodio_id, "cor": "Verde"},
            )
            assert response.status_code in [200, 201], response.text

            resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
            assert resp.status_code == 200, resp.text
            assert resp.json()["estado"] == "Em Atendimento"

            response = await ac.post(
                "/api/v1/atos/",
                json={"episodio_id": episodio_id, "descricao": "Consulta de rotina"},
            )
            assert response.status_code in [200, 201], response.text

            resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
            assert resp.status_code == 200, resp.text
            assert resp.json()["estado"] == "Em Atendimento"

            response = await ac.post(
                "/api/v1/altas/",
                json={"episodio_id": episodio_id, "tipo": "Alta Médica"},
            )
            assert response.status_code in [200, 201], response.text

            resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
            assert resp.status_code == 200, resp.text
            assert resp.json()["estado"] == "Alta"
    finally:
        app.dependency_overrides = {}