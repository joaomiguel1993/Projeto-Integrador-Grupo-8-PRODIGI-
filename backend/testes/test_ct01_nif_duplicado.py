import pytest
from .conftest import build_utente_payload


@pytest.mark.anyio
async def test_ct01_nif_duplicado(client, rececionista_headers):
    payload = build_utente_payload()

    r1 = await client.post(
        "/api/v1/utentes/",
        json=payload,
        headers=rececionista_headers,
    )
    assert r1.status_code in [200, 201], r1.text

    r2 = await client.post(
        "/api/v1/utentes/",
        json=payload,
        headers=rececionista_headers,
    )
    assert r2.status_code == 400, r2.text
    assert "NIF" in r2.text