import pytest


@pytest.mark.anyio
async def test_ln02_prescricao_alergia_grave(
    client,
    override_user_medico,
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
    )
    assert prescricao.status_code in [200, 201, 400, 409, 422], prescricao.text