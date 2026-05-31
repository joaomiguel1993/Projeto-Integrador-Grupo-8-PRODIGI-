import pytest
from .conftest import agora_iso


@pytest.mark.anyio
async def test_ln04_internamento_apos_alta(
    client,
    rececionista_headers,
    medico_headers,
    utente_criado,
):
    admissao = await client.post(
        "/api/v1/episodios/",
        json={
            "num_utent": utente_criado["num_utent"],
            "id_hosp": 1,
        },
        headers=rececionista_headers,
    )
    assert admissao.status_code in [200, 201], admissao.text
    ep_id = admissao.json()["cod_ep_urgenc"]

    alta = await client.put(
        f"/api/v1/episodios/{ep_id}",
        json={
            "estado": "terminado",
            "data_hora_saida": agora_iso(),
        },
        headers=medico_headers,
    )
    assert alta.status_code == 200, alta.text

    internamento = await client.post(
        "/api/v1/internamentos/",
        json={
            "cod_ep_urgenc": ep_id,
            "id_func": 1,
            "data_hora_int": agora_iso(),
            "motivo_int": "Tentativa após alta",
            "numero_cama": "C12",
            "servico": "Medicina",
        },
        headers=medico_headers,
    )
    assert internamento.status_code == 400, internamento.text