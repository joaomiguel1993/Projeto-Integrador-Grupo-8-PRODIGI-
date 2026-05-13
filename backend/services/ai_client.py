# backend/services/ai_client.py
import httpx
from typing import Dict

AI_SERVICE_URL = "http://localhost:8001"

class AIClient:
    # cliente sincronizado
    def __init__(self):
        self.client = httpx.Client(base_url=AI_SERVICE_URL)

    def triage(self, data: dict) -> Dict:
        response = self.client.post("/predict/triage", json=data)
        response.raise_for_status()
        return response.json()

ai_client = AIClient()