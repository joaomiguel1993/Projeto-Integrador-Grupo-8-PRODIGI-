import pytest


@pytest.mark.anyio
async def test_ln03_resolucao_alerta(client):
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

    alerta = criar.json()
    cod_alerta = alerta["cod_alerta"]

    resolver = await client.put(f"/api/v1/alertas/{cod_alerta}/resolver/1")
    assert resolver.status_code == 200, resolver.text

    data = resolver.json()
    assert data["resolvido"] is True, resolver.text
    assert data["resolvido_por"] == 1, resolver.text