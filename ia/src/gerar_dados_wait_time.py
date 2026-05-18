"""
Módulo de Geração de Dados Sintéticos para Tempo de Espera.

Este script cria um dataset atualizado com 10.000 registos simulados de
tempos de espera numa urgência hospitalar. A grande novidade é a inclusão
da categoria 'Very Low' (Azul), garantindo que a IA aprende de forma orgânica
a calcular penalizações de tempo para casos não urgentes. Utiliza variáveis 
em formato categórico (strings) para que o pipeline de pré-processamento 
(LabelEncoder) funcione perfeitamente.
"""

import pandas as pd
import numpy as np
import os

def gerar_dataset_espera(n_samples=10000):
    """
    Gera dados operacionais simulados e calcula tempos de espera proporcionais.
    
    Aplica regras lógicas onde a urgência base define o limite de tempo, 
    mas o rácio de enfermeiros, a ausência de especialistas, o período 
    noturno e os picos de inverno adicionam ruído e atrasos realistas.
    """
    print(f"A gerar {n_samples} registos de tempos de espera... ⏳")
    np.random.seed(42)

    # Listas de strings para as variáveis categóricas
    urgency_levels = ['Critical', 'High', 'Medium', 'Low', 'Very Low']
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    times_of_day = ['Morning', 'Late Morning', 'Afternoon', 'Evening', 'Night']
    seasons = ['Spring', 'Summer', 'Autumn', 'Winter']

    data = []

    for _ in range(n_samples):
        # Escolher valores aleatórios baseados em probabilidades realistas da urgência
        urgency = np.random.choice(urgency_levels, p=[0.05, 0.15, 0.40, 0.30, 0.10])
        ratio = np.random.randint(2, 11) # Ex: 1 Enfermeiro para X doentes
        specialists = np.random.randint(0, 6)
        beds = np.random.choice([50, 92, 150, 200])
        day = np.random.choice(days_of_week)
        time = np.random.choice(times_of_day)
        season = np.random.choice(seasons)

        # 1. Calcular o tempo de espera base com lógica clínica
        base_wait = 0
        if urgency == 'Critical':
            base_wait = np.random.randint(0, 5)     # Quase imediato
        elif urgency == 'High':
            base_wait = np.random.randint(10, 30)   # Rápido
        elif urgency == 'Medium':
            base_wait = np.random.randint(45, 90)   # Normal
        elif urgency == 'Low':
            base_wait = np.random.randint(90, 180)  # Demorado
        elif urgency == 'Very Low':
            base_wait = np.random.randint(150, 300) # Muito Demorado (Pulseira Azul)

        # 2. Fatores operacionais afetam o tempo
        penalizacao_ratio = ratio * 4            # Muitos pacientes = Mais atraso
        bonus_specialists = specialists * 6      # Mais médicos = Mais rápido
        
        total_wait = base_wait + penalizacao_ratio - bonus_specialists

        # 3. Fator caótico (Sazonalidade e Fins de semana)
        if day in ['Saturday', 'Sunday'] or time == 'Night':
            total_wait += np.random.randint(15, 45)
        if season == 'Winter':
            total_wait += np.random.randint(10, 30) # Pico da gripe

        # 4. Limites de segurança para não gerar dados absurdos
        if urgency == 'Critical':
            total_wait = max(0, min(total_wait, 15)) # Críticos não podem esperar mais de 15 min
        else:
            total_wait = max(10, total_wait)         # Mínimo absoluto para não críticos

        data.append({
            'Urgency Level': urgency,
            'Nurse-to-Patient Ratio': ratio,
            'Specialist Availability': specialists,
            'Facility Size (Beds)': beds,
            'Day of Week': day,
            'Time of Day': time,
            'Season': season,
            'Total Wait Time (min)': int(total_wait)
        })

    df = pd.DataFrame(data)

    # Substituir o dataset antigo
    os.makedirs('data/raw', exist_ok=True)
    caminho_csv = 'data/raw/Wait_Time_Dataset.csv'
    df.to_csv(caminho_csv, index=False)

    print(f"✅ Dataset gerado e guardado em: {caminho_csv}")
    print("\n--- Distribuição das Pulseiras Geradas ---")
    print(df['Urgency Level'].value_counts())
    print("\n--- Amostra dos Dados (Primeiras 3 linhas) ---")
    print(df.head(3).to_string())

if __name__ == "__main__":
    gerar_dataset_espera()