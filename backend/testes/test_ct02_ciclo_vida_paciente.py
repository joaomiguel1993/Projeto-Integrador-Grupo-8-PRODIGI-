import pytest
from .conftest import agora_iso


@pytest.mark.anyio
async def test_ct02_ciclo_vida_paciente(
    client,
    rececionista_headers,
    enfermeiro_headers,
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

    obter = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert obter.status_code == 200, obter.text
    assert obter.json()["estado"] == "aberto"

    triagem = await client.post(
        "/api/v1/triagens/",
        json={
            "cod_ep_urgenc": ep_id,
            "data_hora_inicio": agora_iso(),
            "cor_triagem": "verde",
            "sintomas": "Teste automatizado",
            "temperatura": 36.8,
            "freq_card": 76,
            "freq_resp": 18,
            "sp_o2": 98.0,
            "sistolica": 122,
            "diastolica": 79,
            "nivel_dor": 3,
            "consciencia": "Acordado",
        },
        headers=enfermeiro_headers,
    )
    assert triagem.status_code in [200, 201], triagem.text

    atualizar = await client.put(
        f"/api/v1/episodios/{ep_id}",
        json={"estado": "em_atendimento"},
        headers=medico_headers,
    )
    assert atualizar.status_code == 200, atualizar.text

    ato = await client.post(
        "/api/v1/atos/",
        json={
            "cod_ep_urgenc": ep_id,
            "tipo": "consulta",
            "descricao": "Consulta de rotina - teste",
            "data_hora_inicio": agora_iso(),
        },
        headers=medico_headers,
    )
    assert ato.status_code in [200, 201], ato.text

    alta = await client.put(
        f"/api/v1/episodios/{ep_id}",
        json={
            "estado": "terminado",
            "data_hora_saida": agora_iso(),
        },
        headers=medico_headers,
    )
    assert alta.status_code == 200, alta.text

    final = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert final.status_code == 200, final.text
    assert final.json()["estado"] == "terminado"