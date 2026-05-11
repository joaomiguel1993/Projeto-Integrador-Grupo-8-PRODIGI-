import pandas as pd
import os
import joblib  # <-- NOVO IMPORT NECESSÁRIO

print("A iniciar o pré-processamento do dataset de medicamentos (248k linhas)...")

# 1. Carregar o dataset original
try:
    df = pd.read_csv('data/raw/medicine_risk_Dataset.csv')
except FileNotFoundError:
    print("ERRO: O ficheiro 'medicine_risk_Dataset.csv' não está nesta pasta!")
    exit()

# 2. Selecionar apenas as colunas que a tua tabela 'Medicamento' precisa
df_clean = df[['name', 'substitute0', 'Therapeutic Class']].copy()

# Remover medicamentos que não têm classe definida
df_clean = df_clean.dropna(subset=['name', 'Therapeutic Class'])

# 3. Mapeamento das Classes
def mapear_para_teu_id(classe_texto):
    texto = str(classe_texto).upper()
    if 'INFECTIVE' in texto: return 3        # Antibióticos/Infeções
    if 'RESPIRATORY' in texto: return 8      # Asma/Broncodilatador
    if 'PAIN' in texto or 'ANALGESIC' in texto: return 1 # Analgésicos
    if 'GASTRO' in texto: return 5           # Estômago/Protetor
    if 'DIABET' in texto: return 4           # Diabetes
    if 'CARDIO' in texto or 'HYPERTEN' in texto: return 7 # Tensão Alta
    if 'NEURO' in texto: return 1            # Mapeamento genérico
    return 1 

print("A mapear as classes terapêuticas para o formato do teu hospital...")
df_clean['ClasseTerapeuticaID'] = df_clean['Therapeutic Class'].apply(mapear_para_teu_id)

# 4. Formatar os textos
df_clean['Nome'] = df_clean['name'].str.title()
df_clean['PrincipioAtivo'] = df_clean['substitute0'].fillna('Princípio Genérico').str.title()

# Reorganizar as colunas
df_final = df_clean[['Nome', 'PrincipioAtivo', 'ClasseTerapeuticaID']]

# 5. Reduzir o tamanho (Amostra de 2.000 medicamentos)
df_final = df_final.sample(n=2000, random_state=42)

# 6. Guardar na pasta de dados processados como JOBLIB
os.makedirs('data/processed', exist_ok=True)
caminho_saida = 'data/processed/encoders_medicine_risk.joblib'

# CORREÇÃO: O Pandas não guarda .joblib nativamente, usamos o pacote joblib!
joblib.dump(df_final, caminho_saida)

print(f"\n✅ Pré-processamento concluído!")
print(f"Foram extraídos {len(df_final)} medicamentos reais.")
print(f"Ficheiro binário guardado em: {caminho_saida}")