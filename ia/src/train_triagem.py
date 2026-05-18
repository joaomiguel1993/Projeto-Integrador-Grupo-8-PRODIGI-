"""
Módulo de Treino do Modelo de Triagem Clínica.

Este script é responsável por treinar a Inteligência Artificial dedicada
à atribuição do nível de urgência (Cor da Pulseira) aos pacientes. 
O processo importa o módulo de pré-processamento para formatar os dados brutos, 
divide o dataset em conjuntos de treino e teste, e treina um algoritmo 
XGBoost Classifier. Após avaliar a precisão clínica do modelo, guarda 
o "cérebro" treinado em formato binário para ser consumido pela API.

Inputs (Entradas):
    - 'data/raw/Triage_Dataset.csv': Dataset bruto com os sinais vitais gerados.

Outputs (Saídas):
    - 'models/xgboost_triagem.joblib': Ficheiro binário contendo o
      modelo de classificação treinado e pronto a classificar novos doentes.
"""

import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier # <-- Repara, agora usamos o Classificador!

from preprocess_triagem import load_and_preprocess_triagem

def train_triagem():
    """
    Executa a pipeline de treino do modelo preditivo de triagem.

    A função orquestra as seguintes fases:
    1. Ingestão e limpeza dos dados através da função `load_and_preprocess_triagem`.
    2. Divisão dos dados (80% para treino / 20% para validação).
    3. Inicialização e treino do XGBoost Classifier.
    4. Cálculo da métrica de Accuracy (Precisão) face aos dados de teste.
    5. Serialização (exportação) do modelo final treinado para a pasta 'models'.

    Retorno:
    --------
    Nenhum. A função exporta o modelo para o disco de forma silenciosa, 
    imprimindo os logs de progresso e precisão no terminal.
    """
    print("\n--- INÍCIO DO TREINO: TRIAGEM IA (CLASSIFICAÇÃO) ---")
    
    # 1. Carregar os dados limpos
    caminho_csv = 'data/raw/Triage_Dataset.csv'
    X, y = load_and_preprocess_triagem(caminho_csv)
    
    # 2. Separar 80% para estudar, 20% para o exame final
    print("\nA dividir os dados em Treino e Teste...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Treinar o Modelo (XGBoost Classifier)
    print("🧠 A ensinar a IA a ler Sinais Vitais... (Por favor, aguarde)")
    modelo = XGBClassifier(n_estimators=100, learning_rate=0.1, random_state=42)
    modelo.fit(X_train, y_train)
    
    # 4. Fazer o exame e avaliar a precisão
    print("\n📊 A avaliar o conhecimento médico do modelo...")
    previsoes = modelo.predict(X_test)
    
    # Como é classificação, calculamos a % de acertos (Accuracy) em vez do erro em minutos
    precisao = accuracy_score(y_test, previsoes)
    
    print(f"\n✅ Treino Concluído com Sucesso!")
    print(f"🎯 PRECISÃO DA IA: {precisao * 100:.2f}% dos doentes receberam a pulseira correta!")
    
    # 5. Guardar o novo cérebro num ficheiro diferente
    caminho_modelo = 'models/xgboost_triagem.joblib'
    joblib.dump(modelo, caminho_modelo)
    print(f"💾 Cérebro da Triagem guardado em: '{caminho_modelo}'")

if __name__ == "__main__":
    train_triagem()