"""
Módulo de Inferência de Risco Medicamentoso.

Este script atua como o "motor de decisão" para a segurança de prescrições.
Ele carrega um modelo de Machine Learning previamente treinado (Random Forest)
e disponibiliza uma função para avaliar em tempo real se a prescrição de um
medicamento para um determinado utente é segura ou apresenta risco elevado,
retornando a decisão e a respetiva probabilidade de perigo.
"""

import joblib
import pandas as pd

# Carregar modelo
modelo = joblib.load('models/randomforest_medicine_risk.joblib')

def prever_risco_medicamento(classe_med, tem_alergia, gravidade_alergia,
                              tem_interacao, idade_utente):
    """
    Prevê se uma prescrição médica representa um risco para o utente.

    Cruza os dados do paciente com o modelo de IA para determinar a segurança
    da administração do medicamento, tendo em conta alergias, choques com
    medicação ativa e o fator idade.

    Parâmetros:
    -----------
    classe_med : int
        Classe terapêutica do novo medicamento (ID numérico de 1 a 10).
    tem_alergia : int
        Indicador binário de histórico de alergia à classe (0 = Não, 1 = Sim).
    gravidade_alergia : int
        Escala de gravidade da alergia (0=Nenhuma, 1=Leve, 2=Moderada, 3=Grave, 4=Muito Grave).
    tem_interacao : int
        Indicador binário se o medicamento tem interação ativa negativa com outro 
        que o utente já toma (0 = Não, 1 = Sim).
    idade_utente : int
        A idade atual do utente (em anos).

    Retorno:
    --------
    dict
        Um dicionário contendo o resultado da avaliação de risco:
        - 'risco' (int): 0 para Seguro, 1 para Risco Elevado.
        - 'resultado' (str): Etiqueta visual de formatação (ex: '⚠️  COM RISCO').
        - 'probabilidade' (str): A percentagem de certeza do modelo (ex: '95.0%').
    """
    dados = pd.DataFrame([[
        classe_med, tem_alergia, gravidade_alergia,
        tem_interacao, idade_utente
    ]], columns=[
        'Classe_Novo_Med', 'Tem_Alergia_Classe', 'Gravidade_Alergia',
        'Tem_Interacao_Ativa', 'Idade_Utente'
    ])

    risco = int(modelo.predict(dados)[0])
    prob  = float(modelo.predict_proba(dados)[0][1])

    return {
        'risco': risco,
        'resultado': '⚠️  COM RISCO' if risco == 1 else '✅ SEM RISCO',
        'probabilidade': f"{prob:.1%}"
    }


if __name__ == "__main__":
    exemplos = [
        (7, 1, 2, 0, 79),
        (4, 0, 0, 0, 34),
        (1, 1, 4, 1, 51),
        (3, 0, 0, 0, 25),
    ]

    print("=" * 55)
    print("🔍 PREVISÃO DE RISCO DE MEDICAÇÃO")
    print("=" * 55)

    for classe, alergia, gravidade, interacao, idade in exemplos:
        resultado = prever_risco_medicamento(
            classe, alergia, gravidade, interacao, idade
        )
        print(f"\nClasse: {classe} | Alergia: {alergia} | Gravidade: {gravidade} "
              f"| Interação: {interacao} | Idade: {idade}")
        print(f"  → {resultado['resultado']} (prob. risco: {resultado['probabilidade']})")

    print("\n" + "=" * 55)