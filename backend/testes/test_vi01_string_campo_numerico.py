import pytest
from .conftest import agora_iso


@pytest.mark.anyio
async def test_vi01_string_campo_numerico(
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
            "freq_card": "abc",
            "sp_o2": "xyz",
        },
        headers=enfermeiro_headers,
    )
    assert response.status_code == 422, response.text