import pandas as pd
import numpy as np

# Configurar a semente para que os resultados sejam sempre os mesmos (reprodutibilidade)
np.random.seed(42)

# Vamos gerar 10.000 casos clínicos para o modelo ficar bem treinado
n_samples = 10000

print("A gerar dados sintéticos dos utentes...")

# 1. Gerar as colunas base (As nossas "Features")
data = {
    # A classe do medicamento que o médico quer prescrever (1 a 10)
    'Classe_Novo_Med': np.random.randint(1, 11, n_samples),
    
    # O utente tem alergia a esta classe específica? (0 = Não, 1 = Sim)
    # Coloquei 80% de chance de NÃO ter alergia e 20% de TER alergia
    'Tem_Alergia_Classe': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
    
    # Gravidade da alergia: 0=Nenhuma, 1=Baixa, 2=Moderada, 3=Alta, 4=Critica
    'Gravidade_Alergia': np.random.randint(0, 5, n_samples),
    
    # O novo medicamento choca com os que o utente já toma? (0 = Não, 1 = Sim)
    'Tem_Interacao_Ativa': np.random.choice([0, 1], n_samples, p=[0.85, 0.15]),
    
    # Idade do utente
    'Idade_Utente': np.random.randint(18, 96, n_samples)
}

df = pd.DataFrame(data)

# Correção lógica: Se não tem alergia, a gravidade tem de ser 0
df.loc[df['Tem_Alergia_Classe'] == 0, 'Gravidade_Alergia'] = 0

# 2. Definir as Regras de Risco (O nosso "Target" que a IA vai tentar adivinhar)
def calcular_risco(row):
    # REGRA 1: Interação medicamentosa ativa é sempre perigosa
    if row['Tem_Interacao_Ativa'] == 1:
        return 1
    
    # REGRA 2: Tem alergia à classe prescrita e a gravidade é Alta (3) ou Crítica (4)
    if row['Tem_Alergia_Classe'] == 1 and row['Gravidade_Alergia'] >= 3:
        return 1
    
    # REGRA 3: Tem alergia (mesmo que leve/moderada) mas o utente é idoso (> 75 anos)
    if row['Tem_Alergia_Classe'] == 1 and row['Idade_Utente'] > 75:
        return 1
        
    # Se não cair em nenhuma das regras acima, a prescrição é segura (0)
    return 0

print("A aplicar regras clínicas de risco...")
df['Risco'] = df.apply(calcular_risco, axis=1)

# 3. Guardar o ficheiro CSV
csv_filename = 'dataset_risco_medicamentoso.csv'
df.to_csv(csv_filename, index=False)

# Mostrar um resumo do que foi criado
print("\n--- RESUMO DO DATASET ---")
print(f"Total de registos gerados: {len(df)}")
print(f"Prescrições Seguras (Risco 0): {len(df[df['Risco'] == 0])}")
print(f"Prescrições Perigosas (Risco 1): {len(df[df['Risco'] == 1])}")
print(f"\nFicheiro guardado com sucesso: {csv_filename}")