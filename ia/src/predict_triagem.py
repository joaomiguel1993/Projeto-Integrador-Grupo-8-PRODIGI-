"""
Módulo de Inferência de Triagem Clínica.

Este script é responsável por carregar o modelo de Machine Learning treinado
(XGBoost) e utilizá-lo para prever, em tempo real, o nível de urgência
(cor da pulseira) de um paciente que acaba de dar entrada no hospital,
baseando-se nos seus sinais vitais.
"""

import pandas as pd
import joblib

def fazer_triagem(sinais_vitais):
    """
    Analisa os sinais vitais de um paciente e recomenda a cor da pulseira de triagem.

    A função carrega o modelo previamente treinado e os codificadores (encoders) 
    necessários para transformar dados de texto em números compreensíveis pela IA. 
    Após a predição, traduz o resultado numérico de volta para a categoria de cor original.

    Parâmetros:
    -----------
    sinais_vitais : dict
        Dicionário contendo as medições clínicas do paciente. Deve conter as chaves:
        - 'Age' (int): Idade do paciente.
        - 'Heart_Rate_BPM' (int): Frequência cardíaca em batimentos por minuto.
        - 'SpO2_Percent' (int): Saturação de oxigénio em percentagem.
        - 'Temperature_C' (float): Temperatura corporal em graus Celsius.
        - 'Pain_Level' (int): Nível de dor avaliado de 0 a 10.
        - 'Consciousness' (str): Estado mental (ex: 'Acordado', 'Confuso', 'Inconsciente').

    Retorno:
    --------
    str
        A cor da pulseira recomendada ('Red', 'Orange', 'Yellow', 'Green' ou 'Blue').
        Em caso de erro ao carregar os modelos, retorna uma string de erro.
    """
    # 1. Carregar o modelo e os "tradutores"
    try:
        modelo = joblib.load('models/xgboost_triagem.joblib')
        encoders = joblib.load('data/processed/encoders_triagem.joblib')
    except FileNotFoundError:
        return "Erro: Ficheiros da IA não encontrados. Corre o train_triagem.py primeiro!"

    # 2. Criar a tabela com os dados do paciente
    df_paciente = pd.DataFrame([sinais_vitais])
    

    # 3. Converter o texto ("Acordado", "Confuso", etc.) para números usando o nosso tradutor
    df_paciente['Consciousness'] = encoders['Consciousness'].transform(df_paciente['Consciousness'])

    # 4. Garantir a ordem das colunas
    features = [
        'Age', 'Heart_Rate_BPM', 'SpO2_Percent', 
        'Temperature_C', 'Pain_Level', 'Consciousness'
    ]
    X_novo = df_paciente[features]
    
    # 5. Fazer a previsão (a IA vai cuspir um número de 0 a 4)
    previsao_num = modelo.predict(X_novo)[0]
    
    # 6. Transformar o número de volta na Cor correspondente usando o "inverse_transform"
    cor_prevista = encoders['Target'].inverse_transform([previsao_num])[0]
    
    return cor_prevista

if __name__ == "__main__":
    # --- SIMULAÇÃO DE UM DOENTE A CHEGAR À URGÊNCIA ---
    # Vamos criar um cenário clínico grave:
    paciente_chegada = {
        'Age': 68,
        'Heart_Rate_BPM': 145,       # Taquicardia (muito alto)
        'SpO2_Percent': 88,          # Falta de oxigénio severa
        'Temperature_C': 39.5,       # Febre alta
        'Pain_Level': 9,             # Dor insuportável
        'Consciousness': 'Confuso'   # Nível de consciência alterado
    }

    print("\n🚑 NOVO PACIENTE ENTROU NA TRIAGEM 🚑")
    print(f"Sintomas -> Idade: {paciente_chegada['Age']} | Oxigénio: {paciente_chegada['SpO2_Percent']}% | Dor: {paciente_chegada['Pain_Level']}/10")
    print("A analisar sinais vitais...")
    
    cor_recomendada = fazer_triagem(paciente_chegada)
    
    # Um pequeno dicionário só para traduzir a palavra inglesa para o painel em português
    cores_pt = {
        'Red':    '🔴 VERMELHA (Emergência - Risco de Vida Imediato)',
        'Orange': '🟠 LARANJA (Muito Urgente)',
        'Yellow': '🟡 AMARELA (Urgente)',
        'Green':  '🟢 VERDE (Pouco Urgente)',
        'Blue':   '🔵 AZUL (Não Urgente)'
    }
    
    print("\n" + "="*50)
    print(f"🤖 SUGESTÃO DA IA PARA PULSEIRA: {cores_pt.get(cor_recomendada, cor_recomendada)}")
    print("="*50 + "\n")