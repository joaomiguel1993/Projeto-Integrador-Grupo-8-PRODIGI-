import pytest
from datetime import datetime, timezone


def agora_iso():
    return datetime.now(timezone.utc).isoformat()


@pytest.mark.anyio
async def test_vi01_string_campo_numerico(
    client,
    override_user_enfermeiro,
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
    )
    assert response.status_code == 422, response.text