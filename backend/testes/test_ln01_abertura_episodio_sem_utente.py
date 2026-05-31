import pytest


@pytest.mark.anyio
async def test_ln01_abertura_episodio_sem_utente(
    client,
    rececionista_headers,
):
    response = await client.post(
        "/api/v1/episodios/",
        json={
            "num_utent": 999999999,
            "id_hosp": 1,
        },
        headers=rececionista_headers,
    )
    assert response.status_code == 400, response.text