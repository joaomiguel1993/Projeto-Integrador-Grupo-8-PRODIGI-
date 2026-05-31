import pytest
from .conftest import agora_iso


@pytest.mark.anyio
async def test_vi02_nivel_dor_fora_intervalo(
    client,
    enfermeiro_headers,
    episodio_aberto,
):
    response = await client.post(
        "/api/v1/triagens/",
        json={
            "cod_ep_urgenc": episodio_aberto["cod_ep_urgenc"],
            "data_hora_inicio": agora_iso(),
            "cor_triagem": "verde",
            "sintomas": "Teste",
            "nivel_dor": 99,
        },
        headers=enfermeiro_headers,
    )
    assert response.status_code == 422, response.text