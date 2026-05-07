import pandas as pd
import numpy as np
import os
import random

def gerar_dataset_triagem(num_linhas=5000):
    print(f"A gerar {num_linhas} pacientes virtuais... 🧬")
    np.random.seed(42)
    
    dados = []
    
    # As 5 cores da Triagem de Manchester e a sua probabilidade de aparecer na urgência
    cores = ['Red', 'Orange', 'Yellow', 'Green', 'Blue']
    probabilidades = [0.05,   # 5% Vermelho (Crítico)
                      0.15,   # 15% Laranja (Muito Urgente)
                      0.40,   # 40% Amarelo (Urgente)
                      0.30,   # 30% Verde (Pouco Urgente)
                      0.10]   # 10% Azul (Não Urgente)
    
    for i in range(num_linhas):
        cor = np.random.choice(cores, p=probabilidades)
        idade = int(np.random.normal(loc=45, scale=20))
        idade = max(1, min(idade, 99)) # Garantir idades entre 1 e 99
        
        # Gerar sinais vitais baseados na cor (Lógica Clínica Fictícia)
        if cor == 'Red': # Risco de Vida Imediato
            dor = np.random.randint(8, 11)
            spo2 = np.random.randint(75, 92) # Falta de ar severa
            bpm = np.random.choice([np.random.randint(30, 50), np.random.randint(130, 180)]) # Bradicardia ou Taquicardia
            temp = round(np.random.uniform(34.0, 41.5), 1)
            consciencia = np.random.choice(['Inconsciente', 'Confuso'], p=[0.7, 0.3])
            
        elif cor == 'Orange': # Muito Urgente
            dor = np.random.randint(6, 10)
            spo2 = np.random.randint(90, 95)
            bpm = np.random.randint(110, 140)
            temp = round(np.random.uniform(36.0, 40.0), 1)
            consciencia = np.random.choice(['Acordado', 'Confuso'], p=[0.6, 0.4])
            
        elif cor == 'Yellow': # Urgente
            dor = np.random.randint(4, 7)
            spo2 = np.random.randint(94, 98)
            bpm = np.random.randint(80, 115)
            temp = round(np.random.uniform(36.5, 39.0), 1)
            consciencia = 'Acordado'
            
        elif cor == 'Green': # Pouco Urgente
            dor = np.random.randint(1, 5)
            spo2 = np.random.randint(96, 100)
            bpm = np.random.randint(60, 90)
            temp = round(np.random.uniform(36.5, 37.5), 1)
            consciencia = 'Acordado'
            
        else: # Blue (Não Urgente - Ex: renovar receita, dor crónica leve)
            dor = np.random.randint(0, 3)
            spo2 = np.random.randint(97, 100)
            bpm = np.random.randint(60, 85)
            temp = round(np.random.uniform(36.5, 37.2), 1)
            consciencia = 'Acordado'

        dados.append({
            'Patient_ID': f"PAT-{20000 + i}",
            'Age': idade,
            'Heart_Rate_BPM': bpm,
            'SpO2_Percent': spo2,
            'Temperature_C': temp,
            'Pain_Level': dor,
            'Consciousness': consciencia,
            'Triage_Color': cor # <- O nosso alvo (Target) para a IA descobrir!
        })

    # Criar DataFrame
    df = pd.DataFrame(dados)
    
    # Guardar na pasta correta
    os.makedirs('data/raw', exist_ok=True)
    caminho = 'data/raw/Triage_Dataset.csv'
    df.to_csv(caminho, index=False)
    
    print(f"✅ Ficheiro guardado com sucesso em: {caminho}")
    print("\n--- Amostra dos Dados (Primeiros 3 pacientes) ---")
    print(df.head(3).to_string())

if __name__ == "__main__":
    gerar_dataset_triagem()