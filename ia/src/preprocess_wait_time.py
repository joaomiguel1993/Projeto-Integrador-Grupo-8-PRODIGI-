import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def load_and_preprocess(file_path):
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
    os.makedirs('models', exist_ok=True)
    joblib.dump(encoders, 'models/encoders.joblib')
    print("Encoders guardados com sucesso em 'models/encoders.joblib'.")
    
    return X, y

if __name__ == "__main__":
    # Caminho para o teu ficheiro CSV
    caminho_csv = 'data/raw/ER Wait Time Dataset.csv'
    
    # Executa a função
    X, y = load_and_preprocess(caminho_csv)
    
    print("\n--- Vista dos dados prontos para a IA (Primeiras 5 linhas) ---")
    print(X.head())