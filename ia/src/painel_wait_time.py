import pandas as pd
import joblib

def atualizar_painel(estado_hospital):
    print("\n" + "="*50)
    print("🏥 PAINEL DE TEMPOS DE ESPERA (PREVISÃO IA) 🏥")
    print(f"Estado Atual: {estado_hospital['Nurse-to-Patient Ratio']} doentes/enfermeiro | Período: {estado_hospital['Time of Day']}")
    print("="*50)

    try:
        # Carregar a inteligência da nossa IA
        modelo = joblib.load('models/xgboost_model.joblib')
        encoders = joblib.load('models/encoders.joblib')
    except FileNotFoundError:
        return "Erro: Ficheiros da IA não encontrados. Corre o train.py primeiro!"

    # As 4 pulseiras de triagem que queremos prever
    pulseiras = {
        'Critical': '🔴 Emergência (Crítico)      ',
        'High':     '🟠 Muito Urgente (Alto)     ',
        'Medium':   '🟡 Urgente (Médio)          ',
        'Low':      '🟢 Pouco Urgente (Baixo)    '
    }

    # Para cada cor, vamos criar um paciente virtual e perguntar à IA o tempo
    for nivel, nome_visual in pulseiras.items():
        # 1. Copiar as condições reais do hospital agora
        paciente_virtual = estado_hospital.copy()
        
        # 2. Atribuir a cor da pulseira a este paciente virtual
        paciente_virtual['Urgency Level'] = nivel
        
        # 3. Converter para o formato que a IA entende
        df_simulado = pd.DataFrame([paciente_virtual])
        colunas_categoricas = ['Urgency Level', 'Day of Week', 'Time of Day', 'Season']
        
        for col in colunas_categoricas:
            df_simulado[col] = encoders[col].transform(df_simulado[col])
            
        features = [
            'Urgency Level', 'Nurse-to-Patient Ratio', 'Specialist Availability', 
            'Facility Size (Beds)', 'Day of Week', 'Time of Day', 'Season'
        ]
        
        # 4. Fazer a previsão matemática
        X_novo = df_simulado[features]
        tempo_estimado = modelo.predict(X_novo)[0]
        
        # 5. Imprimir no painel
        print(f" {nome_visual} -> {tempo_estimado:^5.0f} minutos")
        
    print("="*50 + "\n")

if __name__ == "__main__":
    # CONFIGURAÇÃO: O estado do teu hospital NESTE EXATO MINUTO
    # (Num sistema real, isto seria lido da base de dados do hospital automaticamente)
    hospital_agora = {
        'Nurse-to-Patient Ratio': 7,     # Lotação alta: 7 pacientes por enfermeiro
        'Specialist Availability': 2,    # Apenas 2 especialistas livres
        'Facility Size (Beds)': 92,      # Tamanho do hospital (fixo)
        'Day of Week': 'Monday',         # Segunda-feira
        'Time of Day': 'Afternoon',      # Tarde
        'Season': 'Winter'               # Inverno
    }

    atualizar_painel(hospital_agora)


    