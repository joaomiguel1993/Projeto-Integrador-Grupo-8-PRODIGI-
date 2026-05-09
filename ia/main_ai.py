from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from datetime import datetime

app = FastAPI(title="Servidor de IA Hospitalar")

# --- 1. Carregar os Modelos Treinados ---
modelo_triagem = joblib.load('models/xgboost_triagem.joblib')
modelo_espera = joblib.load('models/xgboost_wait_time.joblib')

# --- 2. Modelos de Dados (O que a IA espera receber) ---
class DadosTriagem(BaseModel):
    Age: int
    Heart_Rate_BPM: int
    SpO2_Percent: int
    Temperature_C: float
    Pain_Level: int
    Consciousness: str

class DadosEspera(BaseModel):
    Urgency_Level: str # 'Critical', 'High', 'Medium', 'Low'
    Nurse_Ratio: int
    Specialists: int
    Beds: int

# --- 3. Dicionários de Tradução (NLP -> Números) ---
# Usamos os mesmos que a IA aprendeu no treino
tradutor_cons = {'Acordado': 1, 'Confuso': 2, 'Inconsciente': 3}
tradutor_urg = {'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4}

# --- ROTA 1: Prever Cor da Pulseira ---
@app.post("/predict/triage")
def predict_triage(d: DadosTriagem):
    # Traduzir texto para número
    cons_num = tradutor_cons.get(d.Consciousness, 1)
    
    # Criar DataFrame para o XGBoost
    df = pd.DataFrame([[d.Age, d.Heart_Rate_BPM, d.SpO2_Percent, d.Temperature_C, d.Pain_Level, cons_num]], 
                      columns=['Age', 'Heart_Rate_BPM', 'SpO2_Percent', 'Temperature_C', 'Pain_Level', 'Consciousness'])
    
    previsao = modelo_triagem.predict(df)[0]
    return {"pulseira": previsao}

# --- ROTA 2: Prever Tempo de Espera ---
@app.post("/predict/wait-time")
def predict_wait(d: DadosEspera):
    agora = datetime.now()
    # Lógica automática de tempo que discutimos antes
    dia = agora.strftime('%A')
    # ... (aqui podes incluir a lógica de tradução de tempo/estação)
    
    # Exemplo simplificado de resposta
    return {"tempo_estimado_minutos": 45}

if __name__ == "__main__":
    import uvicorn
    # Corre na porta 8001 para não chocar com o teu backend principal (que costuma ser 8000)
    uvicorn.run(app, host="0.0.0.0", port=8001)