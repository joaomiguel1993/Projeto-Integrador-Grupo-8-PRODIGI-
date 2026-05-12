"""
Módulo de Atualização do Painel de Tempos de Espera (Dashboard).

Este script simula o comportamento do ecrã de uma sala de espera de urgência hospitalar.
Utiliza o modelo de regressão treinado (Wait Time AI) para calcular, em tempo real,
os tempos estimados de espera para cada nível de gravidade clínica (Cores da Triagem).
O algoritmo clona o estado operacional atual do hospital (recursos humanos e lotação)
e injeta as diferentes cores de pulseira, devolvendo uma previsão atualizada para
cada grau de prioridade clínica.
"""

import pandas as pd
import joblib

def atualizar_painel(estado_hospital):
    """
    Calcula e exibe as previsões de tempo de espera para cada cor de triagem.

    A função carrega o modelo preditivo e os codificadores de texto, gera um 
    paciente virtual para cada nível de urgência e submete esses dados à IA 
    para prever os minutos exatos de espera, formatando o resultado num 
    painel visual para o terminal.

    Parâmetros:
    -----------
    estado_hospital : dict
        Dicionário que representa a "fotografia" do hospital no momento atual.
        Deve conter: 'Nurse-to-Patient Ratio', 'Specialist Availability', 
        'Facility Size (Beds)', 'Day of Week', 'Time of Day' e 'Season'.

    Retorno:
    --------
    Nenhum (ou str em caso de erro). A função imprime diretamente no terminal 
    o painel formatado com os tempos previstos para as 5 cores da triagem.
    """
    print("\n" + "="*50)
    print("🏥 PAINEL DE TEMPOS DE ESPERA (PREVISÃO IA) 🏥")
    print(f"Estado Atual: {estado_hospital['Nurse-to-Patient Ratio']} doentes/enfermeiro | Período: {estado_hospital['Time of Day']}")
    print("="*50)

    try:
        # Carregar a inteligência da nossa IA
        modelo = joblib.load('models/xgboost_wait_time.joblib')
        encoders = joblib.load('data/processed/encoders_wait_time.joblib')
    except FileNotFoundError:
        return "Erro: Ficheiros da IA não encontrados. Corre o train.py primeiro!"

    # As 5 pulseiras de triagem que queremos prever
    pulseiras = {
        'Critical': '🔴 Emergência (Crítico)      ',
        'High':     '🟠 Muito Urgente (Alto)     ',
        'Medium':   '🟡 Urgente (Médio)          ',
        'Low':      '🟢 Pouco Urgente (Baixo)    ',
        'Very Low': '🔵 Não Urgente (Azul)       '
    }

    # Para cada cor, vamos criar um paciente virtual e perguntar à IA o tempo
    for nivel, nome_visual in pulseiras.items():
        paciente_virtual = estado_hospital.copy()
        
        # Agora passamos o nível exato para a IA analisar
        paciente_virtual['Urgency Level'] = nivel
        
        df_simulado = pd.DataFrame([paciente_virtual])
        colunas_categoricas = ['Urgency Level', 'Day of Week', 'Time of Day', 'Season']
        
        # Traduzir as palavras para os números que a IA conhece
        for col in colunas_categoricas:
            df_simulado[col] = encoders[col].transform(df_simulado[col])
            
        features = [
            'Urgency Level', 'Nurse-to-Patient Ratio', 'Specialist Availability', 
            'Facility Size (Beds)', 'Day of Week', 'Time of Day', 'Season'
        ]
        
        # Fazer a previsão matemática nativa da IA
        X_novo = df_simulado[features]
        tempo_estimado = modelo.predict(X_novo)[0]
            
        # Imprimir no painel
        print(f" {nome_visual} -> {tempo_estimado:^5.0f} minutos")
        
    print("="*50 + "\n")

if __name__ == "__main__":
    # CONFIGURAÇÃO: O estado do teu hospital NESTE EXATO MINUTO
    hospital_agora = {
        'Nurse-to-Patient Ratio': 7,     
        'Specialist Availability': 2,    
        'Facility Size (Beds)': 92,      
        'Day of Week': 'Monday',         
        'Time of Day': 'Afternoon',      
        'Season': 'Winter'               
    }

    atualizar_painel(hospital_agora)