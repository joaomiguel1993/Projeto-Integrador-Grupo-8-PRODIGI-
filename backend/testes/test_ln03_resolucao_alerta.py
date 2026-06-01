import pytest


@pytest.mark.anyio
async def test_ln03_resolucao_alerta(
    client,
    override_user_admin,
):
    criar = await client.post(
        "/api/v1/alertas/",
        json={
            "id_prescricao": 1,
            "id_func": 1,
            "tipo": "Interacao medicamentosa",
            "justificacao": "Teste de alerta",
            "severidade": "alto",
            "score_risco": 0.9,
        },
    )
    assert criar.status_code in [200, 201], criar.text

    data = criar.json()
    alerta_id = data["cod_alerta"]

    resolver = await client.put(
        f"/api/v1/alertas/{alerta_id}",
        json={"estado": "resolvido"},
    )
    assert resolver.status_code == 200, resolver.text