import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from xgboost import XGBRegressor

# Importar a função de limpeza do nosso ficheiro preprocess.py
from preprocess_wait_time import load_and_preprocess

def train():
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