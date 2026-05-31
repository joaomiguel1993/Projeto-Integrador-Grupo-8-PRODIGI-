#!/bin/bash
echo "A limpar cache e testes antigos..."
MSYS_NO_PATHCONV=1 docker exec -it prodigi_app bash -c "rm -rf /app/backend/testes && find /app -name '__pycache__' -exec rm -rf {} + 2>/dev/null; true"

echo "A copiar testes para o container..."
MSYS_NO_PATHCONV=1 docker exec -it prodigi_app mkdir -p /app/backend/testes
docker cp backend/testes/test_fluxo_paciente.py prodigi_app:/app/backend/testes/test_fluxo_paciente.py

echo "A correr testes..."
MSYS_NO_PATHCONV=1 docker exec -it prodigi_app python -m pytest /app/backend/testes/ -v

echo "Concluído."