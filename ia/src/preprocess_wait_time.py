"""
Módulo de Pré-processamento de Dados para Previsão de Tempo de Espera.

Este script prepara os dados históricos operacionais e clínicos para o treino
de um modelo de Machine Learning (XGBoost Regressor). Ele carrega o dataset,
seleciona as variáveis independentes (estado do hospital e prioridade clínica),
converte variáveis categóricas de texto para valores numéricos e exporta
os codificadores (encoders) para o disco, garantindo a consistência dos dados 
durante a fase de inferência em tempo real.
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def load_and_preprocess(file_path):
    """
    Carrega e pré-processa o dataset de tempos de espera hospitalares.

    A função isola as variáveis (features) que estão disponíveis no momento da
    entrada do paciente (nível de urgência, lotação, dia/hora, etc.) e o respetivo
    alvo (tempo total de espera em minutos). Transforma colunas de texto em numéricas
    utilizando o LabelEncoder e guarda os codificadores gerados para uso futuro.

    Parâmetros:
    -----------
    file_path : str
        O caminho local para o ficheiro CSV contendo os dados operacionais da urgência.

    Retorno:
    --------
    tuple
        Retorna um tuplo (X, y) onde:
        - X (pandas.DataFrame): Tabela com as variáveis independentes (features)
          totalmente numéricas e prontas para alimentar o treino da IA.
        - y (pandas.Series): Array contendo a variável alvo contínua 
          ('Total Wait Time (min)').
    """
    print(f"A carregar os dados de: {file_path}")
    df = pd.read_csv(file_path)
    
    # 1. Escolher as colunas que importam para a previsão (o que sabemos na hora de entrada)
    features = [
        'Urgency Level', 
        'Nurse-to-Patient Ratio', 
        'Specialist Availability', 
        'Facility Size (Beds)', 
        'Day of Week', 
        'Time of Day', 
        'Season'
    ]
    target = 'Total Wait Time (min)'
    
    X = df[features].copy()
    y = df[target].copy()
    
    print("A converter variáveis de texto para números...")
    encoders = {}
    categorical_cols = ['Urgency Level', 'Day of Week', 'Time of Day', 'Season']
    
    # 2. Transformar texto em números e guardar a "tradução" (encoders)
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
        
    # 3. Criar a pasta 'models' se não existir e guardar os encoders
    os.makedirs('data/processed', exist_ok=True)
    joblib.dump(encoders, 'data/processed/encoders_wait_time.joblib')
    print("Encoders guardados com sucesso em 'data/processed/encoders_wait_time.joblib'.")
    
    return X, y

if __name__ == "__main__":
    # Caminho para o teu ficheiro CSV
    caminho_csv = 'data/raw/Wait_Time_Dataset.csv'
    
    # Executa a função
    X, y = load_and_preprocess(caminho_csv)
    
    print("\n--- Vista dos dados prontos para a IA (Primeiras 5 linhas) ---")
    print(X.head())