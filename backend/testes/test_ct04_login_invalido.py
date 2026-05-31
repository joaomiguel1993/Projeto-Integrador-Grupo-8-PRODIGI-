import pytest


@pytest.mark.anyio
async def test_ct04_login_invalido(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": "utilizador.inexistente",
            "password": "credencial_errada",
        },
    )
    assert response.status_code == 401, response.text