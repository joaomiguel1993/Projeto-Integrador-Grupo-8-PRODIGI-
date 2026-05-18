"""
Módulo de Treino do Modelo de Previsão de Tempo de Espera.

Este script executa a pipeline de treino da Inteligência Artificial responsável
por estimar o tempo de espera dos utentes na urgência hospitalar (Wait Time AI).
Ao contrário da Triagem (que é um problema de classificação), este modelo
resolve um problema de Regressão contínua. Utiliza o algoritmo XGBoost Regressor
para cruzar as características do doente e do hospital, avaliando a precisão
da aprendizagem através do Erro Médio Absoluto (MAE) antes de guardar o modelo
final em disco.

Inputs (Entradas):
    - 'data/raw/Wait_Time_Dataset.csv': Dataset com dados históricos da urgência.

Outputs (Saídas):
    - 'models/xgboost_wait_time.joblib': Ficheiro binário contendo o modelo
      de regressão treinado para ser consumido em tempo real.
"""

import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from xgboost import XGBRegressor

# Importar a função de limpeza do nosso ficheiro preprocess.py
from preprocess_wait_time import load_and_preprocess

def train():
    """
    Executa a pipeline de treino preditivo para o tempo de espera.

    A função orquestra as seguintes etapas clínicas e matemáticas:
    1. Importação e limpeza dos dados através da função externa `load_and_preprocess`.
    2. Divisão do dataset em fatias de Treino (80%) e Teste (20%).
    3. Inicialização e treino do algoritmo XGBoost Regressor (com 150 árvores).
    4. Avaliação do modelo preditivo através do Mean Absolute Error (MAE), que
       traduz a margem de erro média em minutos reais.
    5. Serialização (exportação) do modelo para a diretoria 'models'.

    Retorno:
    --------
    Nenhum. A função corre a pipeline de forma isolada, imprimindo os
    resultados da avaliação no terminal e guardando o modelo no disco.
    """
    print("\n--- INÍCIO DO TREINO DA IA (XGBOOST) ---")
    
    # 1. Carregar e tratar os dados
    caminho_csv = 'data/raw/Wait_Time_Dataset.csv'
    X, y = load_and_preprocess(caminho_csv)
    
    # 2. Separar dados: 80% para Treino (estudar) e 20% para Teste (avaliar)
    print("\nA dividir os dados para treino (80%) e teste (20%)...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Criar e treinar o Algoritmo (XGBoost)
    print("A treinar o modelo XGBoost... (A otimizar as árvores de decisão)")
    # n_estimators=150: número de árvores
    # learning_rate=0.1: o quão rápido ele aprende de cada erro
    modelo = XGBRegressor(n_estimators=150, learning_rate=0.1, random_state=42)
    modelo.fit(X_train, y_train)
    
    # 4. Avaliar o modelo (fazer a prova)
    print("A avaliar o desempenho do modelo nos dados de teste...")
    previsoes = modelo.predict(X_test)
    erro_medio = mean_absolute_error(y_test, previsoes)
    
    print(f"\n✅ Treino Concluído com Sucesso!")
    print(f"📊 Erro Médio Absoluto (MAE): O sistema prevê o tempo de espera com uma margem de erro de {erro_medio:.2f} minutos.")
    
    # 5. Guardar a IA treinada na pasta models
    os.makedirs('models', exist_ok=True)
    caminho_modelo = 'models/xgboost_wait_time.joblib'
    joblib.dump(modelo, caminho_modelo)
    print(f"💾 Cérebro da IA guardado em: '{caminho_modelo}'")

if __name__ == "__main__":
    train()