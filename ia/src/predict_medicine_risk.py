import joblib
import pandas as pd

# Carregar modelo
modelo = joblib.load('models/randomforest_medicine_risk.joblib')

def prever_risco_medicamento(classe_med, tem_alergia, gravidade_alergia,
                              tem_interacao, idade_utente):
    """
    Prevê se uma prescrição representa risco para o utente.

    Parâmetros:
      classe_med        - Classe do novo medicamento (1-10)
      tem_alergia       - Tem alergia à classe? (0=Não, 1=Sim)
      gravidade_alergia - Gravidade da alergia (0=Nenhuma, 1=Leve, 2=Moderada, 3=Grave, 4=Muito Grave)
      tem_interacao     - Tem interação ativa com outro medicamento? (0=Não, 1=Sim)
      idade_utente      - Idade do utente (anos)

    Retorna:
      dict com 'risco' (0 ou 1) e 'probabilidade'
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