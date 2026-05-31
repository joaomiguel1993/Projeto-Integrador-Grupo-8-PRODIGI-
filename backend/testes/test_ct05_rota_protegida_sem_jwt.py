import pytest


@pytest.mark.anyio
async def test_ct05_rota_protegida_sem_jwt(client):
    response = await client.post(
        "/api/v1/triagens/",
        json={
            "cod_ep_urgenc": 1,
            "data_hora_inicio": "2026-01-01T10:00:00Z",
            "cor_triagem": "verde",
            "sintomas": "Sem token",
        },
    )
    assert response.status_code in [401, 403], response.text