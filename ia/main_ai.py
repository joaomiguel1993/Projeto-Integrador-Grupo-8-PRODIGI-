"""
Servidor Central de Inteligência Artificial Hospitalar (FastAPI).

Este módulo atua como o motor principal do ecossistema de IA. Ele carrega 
os modelos de Machine Learning pré-treinados para a memória e expõe 
endpoints (rotas RESTful) que permitem ao frontend/backend consultar 
as predições em tempo real. As rotas incluem:
- Triagem preditiva (XGBoost Classifier)
- Estimativa de tempos de espera por prioridade (XGBoost Regressor)
- Extração de sinais vitais por voz via LLM (Groq / Llama 3)
- Avaliação de risco de prescrição medicamentosa (Random Forest)
"""

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
modelo_triagem   = joblib.load('models/xgboost_triagem.joblib')
modelo_espera    = joblib.load('models/xgboost_wait_time.joblib')
modelo_risco_med = joblib.load('models/randomforest_medicine_risk.joblib')
encoders_espera  = joblib.load('data/processed/encoders_wait_time.joblib')

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
    """Esquema de dados esperados para a inferência de Triagem."""
    Age: int
    Heart_Rate_BPM: int
    SpO2_Percent: int
    Temperature_C: float
    Pain_Level: int
    Consciousness: str

class DadosEspera(BaseModel):
    """Esquema de dados operacionais esperados para o cálculo de tempos de espera."""
    Urgency_Level: str          # 'Critical', 'High', 'Medium', 'Low'
    Nurse_to_Patient_Ratio: int # ex: 7
    Specialist_Availability: int # ex: 2
    Facility_Size_Beds: int     # ex: 92
    Day_of_Week: str            # 'Monday', 'Tuesday', ...
    Time_of_Day: str            # 'Morning', 'Afternoon', 'Evening', 'Night'
    Season: str                 # 'Winter', 'Spring', 'Summer', 'Autumn'

class DadosVoz(BaseModel):
    """Esquema de dados para a rota de Processamento de Linguagem Natural."""
    texto: str

class DadosRiscoMed(BaseModel):
    """Esquema de dados para a validação de segurança de uma prescrição."""
    Classe_Novo_Med: int
    Tem_Alergia_Classe: int
    Gravidade_Alergia: int
    Tem_Interacao_Ativa: int
    Idade_Utente: int

# --- 4. Dicionários de Tradução ---
tradutor_cons = {'Acordado': 1, 'Confuso': 2, 'Inconsciente': 3}

# --- ROTA 1: Prever Cor da Pulseira ---
@app.post("/predict/triage")
def predict_triage(d: DadosTriagem):
    """
    Endpoint para classificar o nível de urgência de um utente.

    Recebe os sinais vitais, transforma-os numa estrutura tabular (DataFrame) 
    e utiliza o modelo XGBoost de Triagem para prever a cor da pulseira correspondente.

    Retorno:
        dict: Um dicionário com a chave "pulseira" contendo a classe prevista.
    """
    cons_num = tradutor_cons.get(d.Consciousness, 1)

    df = pd.DataFrame(
        [[d.Age, d.Heart_Rate_BPM, d.SpO2_Percent, d.Temperature_C, d.Pain_Level, cons_num]],
        columns=['Age', 'Heart_Rate_BPM', 'SpO2_Percent', 'Temperature_C', 'Pain_Level', 'Consciousness']
    )

    previsao = modelo_triagem.predict(df)[0]
    return {"pulseira": str(previsao)}

# --- ROTA 2: Prever Tempo de Espera por Nível de Urgência ---
@app.post("/predict/wait-time")
def predict_wait(d: DadosEspera):
    """
    Endpoint para estimar o tempo de espera no painel da urgência.

    Recebe o estado operacional do hospital e clona esse estado para os 4 níveis 
    principais de triagem. Aplica os codificadores (encoders) e utiliza o XGBoost 
    Regressor para devolver os tempos de espera previstos (em minutos) para cada cor.

    Retorno:
        dict: Um dicionário mapeando cada nível de urgência (Critical, High, Medium, Low)
        aos respetivos minutos de espera estimados.
    """
    resultados = {}

    pulseiras = ['Critical', 'High', 'Medium', 'Low']

    for nivel in pulseiras:
        df = pd.DataFrame([{
            'Urgency Level':           nivel,
            'Nurse-to-Patient Ratio':  d.Nurse_to_Patient_Ratio,
            'Specialist Availability': d.Specialist_Availability,
            'Facility Size (Beds)':    d.Facility_Size_Beds,
            'Day of Week':             d.Day_of_Week,
            'Time of Day':             d.Time_of_Day,
            'Season':                  d.Season,
        }])

        # Aplicar encoders às colunas categóricas
        for col in ['Urgency Level', 'Day of Week', 'Time of Day', 'Season']:
            df[col] = encoders_espera[col].transform(df[col])

        features = [
            'Urgency Level', 'Nurse-to-Patient Ratio', 'Specialist Availability',
            'Facility Size (Beds)', 'Day of Week', 'Time of Day', 'Season'
        ]

        tempo = float(modelo_espera.predict(df[features])[0])
        resultados[nivel] = round(tempo)

    return {
        "Critical": resultados['Critical'],
        "High":     resultados['High'],
        "Medium":   resultados['Medium'],
        "Low":      resultados['Low'],
    }

# --- ROTA 3: Processar Texto e Extrair Sinais Vitais via Groq ---
@app.post("/predict/voz")
def predict_voz(d: DadosVoz):
    """
    Endpoint de NLP para extração de dados clínicos a partir de texto.

    Submete o texto (ditado por voz ou escrito livremente) à API do Groq (LLM Llama 3)
    com um prompt rígido, forçando o modelo a estruturar a informação num JSON 
    limpo e formatado, ideal para alimentar a rota de triagem preditiva.

    Retorno:
        dict: Um dicionário com os sinais vitais estruturados ou uma mensagem de erro.
    """
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

# --- ROTA 4: Prever Risco de Medicação ---
@app.post("/predict/medicine-risk")
def predict_medicine_risk(d: DadosRiscoMed):
    """
    Endpoint para validação de segurança clínica de prescrições.

    Cruza o perfil do paciente e as interações medicamentosas com o modelo
    Random Forest. Avalia o grau de perigo e devolve a predição juntamente com 
    a percentagem de certeza do algoritmo.

    Retorno:
        dict: Dicionário contendo o nível de risco binário, uma etiqueta legível
        e a probabilidade estatística do evento ocorrer.
    """
    df = pd.DataFrame(
        [[d.Classe_Novo_Med, d.Tem_Alergia_Classe, d.Gravidade_Alergia,
          d.Tem_Interacao_Ativa, d.Idade_Utente]],
        columns=['Classe_Novo_Med', 'Tem_Alergia_Classe', 'Gravidade_Alergia',
                 'Tem_Interacao_Ativa', 'Idade_Utente']
    )

    risco = int(modelo_risco_med.predict(df)[0])
    prob  = float(modelo_risco_med.predict_proba(df)[0][1])

    return {
        "risco": risco,
        "resultado": "COM RISCO" if risco == 1 else "SEM RISCO",
        "probabilidade": round(prob, 4)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)