"""
Módulo de Inferência de Tempo de Espera.

Este script utiliza um modelo de regressão treinado (XGBoost) para estimar
o tempo exato que um utente terá de aguardar até ser atendido na urgência.
O algoritmo cruza a prioridade clínica do doente com métricas operacionais do 
hospital em tempo real (como o rácio de enfermeiros, número de camas disponíveis 
e a sazonalidade) para devolver uma previsão em minutos.
"""

import pandas as pd
import joblib

def prever_espera(dados_paciente):
    """
    Estima o tempo de espera de um paciente na urgência em minutos.

    A função carrega o modelo de predição e os codificadores. Converte os dados 
    categóricos (texto) do novo paciente para o formato numérico correto e pede 
    à Inteligência Artificial que calcule o tempo com base no cenário submetido.

    Parâmetros:
    -----------
    dados_paciente : dict
        Dicionário com as informações do utente e do estado do hospital no momento.
        Deve conter as seguintes chaves:
        - 'Urgency Level' (str): Nível de urgência (ex: 'High', 'Medium', 'Low').
        - 'Nurse-to-Patient Ratio' (int/float): Número de pacientes por enfermeiro.
        - 'Specialist Availability' (int): Número de médicos especialistas disponíveis.
        - 'Facility Size (Beds)' (int): Número total de camas no serviço.
        - 'Day of Week' (str): Dia da semana (ex: 'Monday', 'Friday').
        - 'Time of Day' (str): Período do dia (ex: 'Morning', 'Late Morning', 'Night').
        - 'Season' (str): Estação do ano (ex: 'Winter', 'Summer').

    Retorno:
    --------
    float ou str
        Retorna um valor do tipo float representando os minutos de espera previstos.
        Em caso de ausência dos ficheiros do modelo, retorna uma string com o erro.
    """
    # 1. Carregar o "cérebro" (XGBoost) e os "tradutores" (Encoders) que guardámos no treino
    try:
        modelo = joblib.load('models/xgboost_wait_time.joblib')
        encoders = joblib.load('data/processed/encoders_wait_time.joblib')
    except FileNotFoundError:
        return "Erro: Modelos não encontrados. Executa primeiro o 'train.py'!"

    # 2. Transformar a ficha do paciente numa tabela (DataFrame)
    df_paciente = pd.DataFrame([dados_paciente])

    # 3. "Traduzir" as palavras para números, usando exatamente o mesmo dicionário do treino
    colunas_categoricas = ['Urgency Level', 'Day of Week', 'Time of Day', 'Season']
    for col in colunas_categoricas:
        df_paciente[col] = encoders[col].transform(df_paciente[col])

    # 4. Garantir que as colunas estão na mesma ordem que a IA estudou
    features = [
        'Urgency Level', 
        'Nurse-to-Patient Ratio', 
        'Specialist Availability', 
        'Facility Size (Beds)', 
        'Day of Week', 
        'Time of Day', 
        'Season'
    ]
    X_novo = df_paciente[features]

    # 5. Pedir à IA para adivinhar o tempo!
    previsao = modelo.predict(X_novo)
    
    # Retorna o valor em minutos (arredondado para não dar segundos partidos)
    return previsao[0]

if __name__ == "__main__":
    # --- SIMULAÇÃO DE UM NOVO PACIENTE NA URGÊNCIA ---
    # Ficha do doente que acabou de receber a pulseira na triagem:
    novo_paciente = {
        'Urgency Level': 'High',         # Pulseira Laranja/Vermelha
        'Nurse-to-Patient Ratio': 6,     # 6 pacientes por enfermeiro (Serviço muito caótico)
        'Specialist Availability': 1,    # Apenas 1 especialista livre
        'Facility Size (Beds)': 92,      # Tamanho do hospital
        'Day of Week': 'Monday',         # Segunda-feira
        'Time of Day': 'Late Morning',   # Fim da manhã
        'Season': 'Winter'               # Inverno (pico de gripes)
    }

    print("\n🏥 Novo paciente deu entrada na triagem.")
    print("A analisar condições do hospital e a consultar a IA...")
    
    tempo_estimado = prever_espera(novo_paciente)
    
    if isinstance(tempo_estimado, str):
        print(tempo_estimado)
    else:
        print(f"\n⏱️ TEMPO DE ESPERA ESTIMADO: {tempo_estimado:.0f} minutos.")
        print("-> Valor pronto para ser exibido no painel da sala de espera!")