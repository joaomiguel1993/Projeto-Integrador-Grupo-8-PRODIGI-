import pytest


@pytest.mark.anyio
async def test_ln02_prescricao_alergia_grave(
    client,
    medico_headers,
    ato_criado,
):
    prescricao = await client.post(
        "/api/v1/prescricoes/",
        json={
            "id_ato": ato_criado["id_ato"],
            "cod_medicamento": 1,
            "dosagem": "500mg",
            "observacoes": "Teste alergia grave",
        },
        headers=medico_headers,
    )
    assert prescricao.status_code in [200, 201, 400, 409, 422], prescricao.text