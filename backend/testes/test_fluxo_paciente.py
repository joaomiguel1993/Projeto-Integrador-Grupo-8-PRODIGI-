#CT02 (Ciclo de Vida do Paciente)
#O teu teste vai:
#Criar um episódio.
#Fazer a triagem.
#Criar um ato médico.
#Dar alta.
#Em cada etapa, ele pergunta à API: "Qual é o estado deste episódio?" e compara com o que tu esperas.

import pytest
from httpx import AsyncClient
from backend.main import app

@pytest.mark.asyncio
async def test_ciclo_vida_paciente():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        
        # 1. ADMISSÃO
        response = await ac.post("/api/v1/episodios", json={"nif": "123456789", "id_hosp": 1})
        assert response.status_code == 200
        episodio_id = response.json()["id"]
        
        # Verifica se está "Em Espera"
        resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
        assert resp.json()["estado"] == "Em Espera"

        # 2. TRIAGEM
        await ac.post("/api/v1/triagens", json={"episodio_id": episodio_id, "cor": "Verde"})
        
        # Verifica se mudou para "Em Atendimento"
        resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
        assert resp.json()["estado"] == "Em Atendimento"

        # 3. ATO CLÍNICO
        await ac.post("/api/v1/atos", json={"episodio_id": episodio_id, "descricao": "Consulta de rotina"})
        
        # Verifica se continua "Em Atendimento"
        resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
        assert resp.json()["estado"] == "Em Atendimento"

        # 4. ALTA
        await ac.post("/api/v1/altas", json={"episodio_id": episodio_id, "tipo": "Alta Médica"})
        
        # Verifica se mudou para "Alta"
        resp = await ac.get(f"/api/v1/episodios/{episodio_id}")
        assert resp.json()["estado"] == "Alta"
        
        print("Ciclo de vida validado com sucesso!")
