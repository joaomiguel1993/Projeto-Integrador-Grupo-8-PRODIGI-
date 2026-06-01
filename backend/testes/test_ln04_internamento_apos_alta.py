import pytest
from datetime import datetime, timezone


def agora_iso():
    return datetime.now(timezone.utc).isoformat()


@pytest.mark.anyio
async def test_ln04_internamento_apos_alta(
    client,
    override_user_rececionista,
    override_user_medico,
    utente_criado,
):
    admissao = await client.post(
        "/api/v1/episodios/",
        json={
            "num_utent": utente_criado["num_utent"],
            "id_hosp": 1,
        },
    )
    assert admissao.status_code in [200, 201], admissao.text
    ep_id = admissao.json()["cod_ep_urgenc"]

    alta = await client.put(
        f"/api/v1/episodios/{ep_id}",
        json={
            "estado": "terminado",
            "data_hora_saida": agora_iso(),
        },
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
    )
    assert internamento.status_code == 400, internamento.text