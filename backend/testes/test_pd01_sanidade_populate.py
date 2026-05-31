import pytest


@pytest.mark.anyio
async def test_pd01_sanidade_populate_utentes(client, admin_headers):
    response = await client.get("/api/v1/utentes/", headers=admin_headers)
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 500, response.text


@pytest.mark.anyio
async def test_pd01_sanidade_populate_episodios(client, admin_headers):
    response = await client.get("/api/v1/episodios/", headers=admin_headers)
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 800, response.text


@pytest.mark.anyio
async def test_pd01_sanidade_populate_internamentos(client, admin_headers):
    response = await client.get("/api/v1/internamentos/", headers=admin_headers)
    assert response.status_code == 200, response.text
    assert len(response.json()) >= 90, response.text