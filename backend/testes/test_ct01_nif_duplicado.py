import pytest
import uuid


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


@pytest.mark.anyio
async def test_ct01_nif_duplicado(client, override_user_rececionista):
    payload = build_utente_payload()

    r1 = await client.post("/api/v1/utentes/", json=payload)
    assert r1.status_code in [200, 201], r1.text

    r2 = await client.post("/api/v1/utentes/", json=payload)
    assert r2.status_code == 400, r2.text