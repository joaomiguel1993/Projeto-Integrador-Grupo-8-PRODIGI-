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

    r1 = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert r1.status_code == 200, r1.text
    assert r1.json()["estado"] == "aberto"

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

    r2 = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert r2.status_code == 200, r2.text
    assert r2.json()["estado"] == "em_atendimento"

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

    r3 = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert r3.status_code == 200, r3.text
    assert r3.json()["estado"] == "em_atendimento"

    alta = await client.put(
        f"/api/v1/episodios/{ep_id}",
        json={
            "estado": "terminado",
            "data_hora_saida": agora_iso(),
        },
        headers=medico_headers,
    )
    assert alta.status_code == 200, alta.text

    r4 = await client.get(f"/api/v1/episodios/{ep_id}", headers=medico_headers)
    assert r4.status_code == 200, r4.text
    assert r4.json()["estado"] == "terminado"