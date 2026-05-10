from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from groq import Groq
import json
import re
import os
from datetime import datetime

app = FastAPI(title="Servidor de IA Hospitalar")

# --- CORS (permite pedidos do frontend React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. Carregar os Modelos Treinados ---
modelo_triagem = joblib.load('models/xgboost_triagem.joblib')
modelo_espera  = joblib.load('models/xgboost_wait_time.joblib')

# --- 2. Configuração do Groq ---
cliente = Groq(api_key=os.environ["GROQ_API_KEY"])

CAMPOS_ESPERADOS = {
    "Age":            "Dado não obtido",
    "Heart_Rate_BPM": "Dado não obtido",
    "SpO2_Percent":   "Dado não obtido",
    "Temperature_C":  "Dado não obtido",
    "Pain_Level":     "Dado não obtido",
    "Consciousness":  "Dado não obtido",
}

# --- 3. Modelos de Dados ---
class DadosTriagem(BaseModel):
    Age: int
    Heart_Rate_BPM: int
    SpO2_Percent: int
    Temperature_C: float
    Pain_Level: int
    Consciousness: str

class DadosEspera(BaseModel):
    Urgency_Level: str  # 'Critical', 'High', 'Medium', 'Low'
    Nurse_Ratio: int
    Specialists: int
    Beds: int

class DadosVoz(BaseModel):
    texto: str

# --- 4. Dicionários de Tradução ---
tradutor_cons = {'Acordado': 1, 'Confuso': 2, 'Inconsciente': 3}
tradutor_urg  = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}

# --- ROTA 1: Prever Cor da Pulseira ---
@app.post("/predict/triage")
def predict_triage(d: DadosTriagem):
    cons_num = tradutor_cons.get(d.Consciousness, 1)

    df = pd.DataFrame(
        [[d.Age, d.Heart_Rate_BPM, d.SpO2_Percent, d.Temperature_C, d.Pain_Level, cons_num]],
        columns=['Age', 'Heart_Rate_BPM', 'SpO2_Percent', 'Temperature_C', 'Pain_Level', 'Consciousness']
    )

    previsao = modelo_triagem.predict(df)[0]
    return {"pulseira": previsao}

# --- ROTA 2: Prever Tempo de Espera ---
@app.post("/predict/wait-time")
def predict_wait(d: DadosEspera):
    agora = datetime.now()
    dia = agora.strftime('%A')
    # TODO: adicionar lógica completa de tempo/estação
    return {"tempo_estimado_minutos": 45}

# --- ROTA 3: Processar Texto e Extrair Sinais Vitais via Groq ---
@app.post("/predict/voz")
def predict_voz(d: DadosVoz):
    prompt = f"""És um assistente clínico. Extrai os sinais vitais do seguinte texto falado por um enfermeiro em português.
Devolve APENAS um objeto JSON válido, sem explicações nem markdown, com exatamente estas chaves:
- "Age": número inteiro (anos) ou null
- "Heart_Rate_BPM": número inteiro ou null
- "SpO2_Percent": número inteiro (percentagem de saturação) ou null
- "Temperature_C": número decimal (graus Celsius) ou null
- "Pain_Level": número inteiro de 0 a 10 ou null
- "Consciousness": uma de ["Acordado", "Confuso", "Inconsciente"] ou null

Regras:
- Se um valor não for mencionado, usa null.
- Interpreta linguagem natural: "quase noventa de saturação" → 89, "febre de 39 e meio" → 39.5, "está desorientado" → "Confuso".
- Devolve APENAS o JSON, sem mais nada.

Texto: "{d.texto}"

JSON:"""

    try:
        resposta = cliente.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        conteudo = resposta.choices[0].message.content.strip()

        match = re.search(r'\{.*\}', conteudo, re.DOTALL)
        if not match:
            return {"erro": f"Resposta inesperada do modelo: {conteudo}"}

        dados = json.loads(match.group())

        sinais_vitais = {}
        for campo, default in CAMPOS_ESPERADOS.items():
            valor = dados.get(campo)
            sinais_vitais[campo] = valor if valor is not None else default

        return sinais_vitais

    except Exception as e:
        return {"erro": f"Erro ao chamar o Groq: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)