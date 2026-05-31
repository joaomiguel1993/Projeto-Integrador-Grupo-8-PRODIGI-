import pytest
from .conftest import agora_iso


@pytest.mark.anyio
async def test_ct03_ato_em_episodio_encerrado(
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

    ato = await client.post(
        "/api/v1/atos/",
        json={
            "cod_ep_urgenc": ep_id,
            "tipo": "consulta",
            "descricao": "Tentativa após alta",
            "data_hora_inicio": agora_iso(),
        },
        headers=medico_headers,
    )
    assert ato.status_code == 400, ato.text
    assert "episódio encerrado" in ato.text.lower()