import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

print("1. A carregar o dataset de risco que criaste anteriormente...")
try:
    # Ler o dataset que já tens guardado!
    df = pd.read_csv('data/raw/medicine_risk_Dataset.csv')
except FileNotFoundError:
    print("ERRO: O ficheiro 'medicine_risk_Dataset.csv' não foi encontrado na pasta 'data/raw/'.")
    exit()

print("2. A separar as variáveis para a Inteligência Artificial...")
# O que o modelo vai "ler" (Features)
X = df[['Classe_Novo_Med', 'Tem_Alergia_Classe', 'Gravidade_Alergia', 'Tem_Interacao_Ativa', 'Idade_Utente']]
# O que o modelo tem de "adivinhar" (Target)
y = df['Risco']

# Dividir os dados: 80% para treinar, 20% para o modelo ser testado
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("3. A treinar o algoritmo (Random Forest)...")
modelo = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
modelo.fit(X_train, y_train)

# Avaliar se a IA aprendeu bem usando a fatia de 20% de teste
previsoes = modelo.predict(X_test)
precisao = accuracy_score(y_test, previsoes)
print(f"-> Treino concluído! A precisão da tua IA é de: {precisao * 100:.2f}%")

print("\n4. A guardar o modelo treinado...")
os.makedirs('models', exist_ok=True)
caminho_modelo = 'models/randomforest_medicine_risk.joblib'

# Guardar o "cérebro" na pasta models
joblib.dump(modelo, caminho_modelo)

print(f"✅ Modelo de Risco guardado com sucesso em: {caminho_modelo}")