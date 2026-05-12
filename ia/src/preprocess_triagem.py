"""
Módulo de Pré-processamento de Dados para a Triagem Clínica.

Este script prepara os dados brutos gerados sobre os pacientes da urgência
para que possam ser compreendidos pelo algoritmo de Inteligência Artificial.
Realiza a leitura do dataset, seleção de variáveis (features) e a conversão 
de texto (variáveis categóricas e o alvo final) para valores numéricos, 
guardando os codificadores para uso futuro na fase de inferência.
"""

import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib
import os

def load_and_preprocess_triagem(file_path):
    """
    Carrega e pré-processa o dataset de triagem hospitalar.

    A função isola as variáveis de interesse clínico e transforma os dados
    de texto (como o estado de consciência e a cor da pulseira) em números.
    Exporta também os "tradutores" (encoders) para o disco, garantindo que
    a aplicação final consiga reverter a previsão numérica para a cor original.

    Parâmetros:
    -----------
    file_path : str
        O caminho local para o ficheiro CSV contendo os dados brutos da triagem.

    Retorno:
    --------
    tuple
        Retorna um tuplo (X, y) onde:
        - X (pandas.DataFrame): Tabela contendo as variáveis independentes numéricas.
        - y (numpy.ndarray ou pandas.Series): Array contendo o alvo codificado 
          (as categorias de cor transformadas em números inteiros de 0 a 4).
    """
    print(f"A carregar os dados clínicos de: {file_path}")
    df = pd.read_csv(file_path)
    
    # 1. As colunas que a IA usa para "diagnosticar" (Features)
    features = [
        'Age', 'Heart_Rate_BPM', 'SpO2_Percent', 
        'Temperature_C', 'Pain_Level', 'Consciousness'
    ]
    # O nosso Alvo agora é a Cor!
    target = 'Triage_Color'
    
    X = df[features].copy()
    y = df[target].copy()
    
    encoders = {}
    
    # 2. Converter Nível de Consciência (Texto) para Número
    le_consciencia = LabelEncoder()
    X['Consciousness'] = le_consciencia.fit_transform(X['Consciousness'])
    encoders['Consciousness'] = le_consciencia
    
    # 3. Converter a Cor da Pulseira para Número (0 a 4)
    # O XGBoost Classificador OBRIGA a que as classes sejam numéricas
    le_target = LabelEncoder()
    y = le_target.fit_transform(y)
    encoders['Target'] = le_target  # Guardamos isto para a IA nos poder "dizer" a cor em texto depois
    
    # 4. Guardar os "tradutores"
    os.makedirs('data/processed', exist_ok=True)
    joblib.dump(encoders, 'data/processed/encoders_triagem.joblib')
    
    return X, y

if __name__ == "__main__":
    X, y = load_and_preprocess_triagem('data/raw/Triage_Dataset.csv')
    print("✅ Dados limpos e prontos para a Triagem!")