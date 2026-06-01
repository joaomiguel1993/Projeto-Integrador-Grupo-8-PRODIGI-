import pytest


@pytest.mark.anyio
async def test_pd01_sanidade_populate_utentes(client, override_user_admin):
    response = await client.get("/api/v1/utentes/")
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 500, response.text


@pytest.mark.anyio
async def test_pd01_sanidade_populate_episodios(client, override_user_admin):
    response = await client.get("/api/v1/episodios/")
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 800, response.text


@pytest.mark.anyio
async def test_pd01_sanidade_populate_internamentos(client, override_user_admin):
    response = await client.get("/api/v1/internamentos/")
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 90, response.text