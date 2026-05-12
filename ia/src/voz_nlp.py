"""
Módulo de Processamento de Linguagem Natural (NLP) e Voz para Triagem.

Este script atua como uma interface inteligente de recolha de dados para os enfermeiros.
Em vez de inserção manual, o sistema utiliza reconhecimento de voz (Speech-to-Text) 
para captar a descrição clínica em tempo real. Em seguida, interage com um Large 
Language Model (LLM - Llama 3 via Groq API) para interpretar o texto não estruturado 
e extrair os sinais vitais vitais num formato JSON padronizado, pronto a alimentar 
o modelo preditivo de XGBoost da Triagem.
"""

import speech_recognition as sr
from groq import Groq
import json
import re
import os

# ─────────────────────────────────────────────
# CONFIGURAÇÃO
# ─────────────────────────────────────────────
# Instalar dependências:
#   pip install SpeechRecognition pyaudio groq
#
# Adicionar ao .env:
#   GROQ_API_KEY=gsk_...
# ─────────────────────────────────────────────

cliente = Groq(api_key=os.environ["GROQ_API_KEY"])

CAMPOS_ESPERADOS = {
    "Age":            "Dado não obtido",
    "Heart_Rate_BPM": "Dado não obtido",
    "SpO2_Percent":   "Dado não obtido",
    "Temperature_C":  "Dado não obtido",
    "Pain_Level":     "Dado não obtido",
    "Consciousness":  "Dado não obtido",
}


def ouvir_enfermeiro(tempo_silencio=2.5, tempo_espera_inicio=5, limite_frase=20):
    """
    Capta o áudio do microfone e converte a voz do enfermeiro em texto.

    Utiliza a biblioteca SpeechRecognition com o motor do Google Speech-to-Text 
    para detetar a fala e transcrevê-la para o idioma Português (pt-PT). A função 
    calibra-se automaticamente ao ruído de fundo antes de começar a ouvir.

    Parâmetros:
    -----------
    tempo_silencio : float, opcional
        O tempo em segundos de silêncio necessário para a IA assumir que o enfermeiro 
        terminou a frase (por defeito é 2.5s).
    tempo_espera_inicio : int, opcional
        O tempo máximo em segundos que o sistema aguarda até que alguém comece a falar 
        (por defeito é 5s).
    limite_frase : int, opcional
        A duração máxima em segundos de gravação contínua permitida (por defeito é 20s).

    Retorno:
    --------
    str ou None
        Retorna uma string em minúsculas com o texto transcrito em caso de sucesso.
        Retorna None se ocorrer um erro (timeout, voz impercetível ou falha de rede).
    """
    reconhecedor = sr.Recognizer()
    reconhecedor.pause_threshold = tempo_silencio
    reconhecedor.dynamic_energy_threshold = True

    with sr.Microphone() as fonte:
        print("\n🎤 A calibrar o ruído de fundo... (silêncio durante 2 segundos)")
        reconhecedor.adjust_for_ambient_noise(fonte, duration=2)

        print(f"\n🟢 PODE FALAR! (Pausas até {tempo_silencio}s são aceites)")
        print("Exemplo: 'Paciente com 68 anos, oxigénio a 88, 145 batimentos, "
              "temperatura de 39.5, dor 9, está confuso.'\n")

        try:
            audio = reconhecedor.listen(
                fonte,
                timeout=tempo_espera_inicio,
                phrase_time_limit=limite_frase,
            )
            print("⏳ A processar o áudio...")
            texto = reconhecedor.recognize_google(audio, language="pt-PT")
            print(f"\n📝 Texto reconhecido: '{texto}'")
            return texto.lower()

        except sr.WaitTimeoutError:
            print("❌ Não detetei voz dentro do tempo limite.")
        except sr.UnknownValueError:
            print("❌ Não consegui perceber o que disse. Fale mais claramente.")
        except sr.RequestError:
            print("❌ Sem ligação à internet para o reconhecimento de voz.")

    return None


def processar_texto_medico(texto: str) -> dict:
    """
    Processa linguagem natural clínica e extrai sinais vitais através de IA Generativa.

    Submete a transcrição de voz a um LLM (Llama-3.3-70b-versatile via Groq), através de um 
    prompt de engenharia rígido que obriga o modelo a agir como assistente clínico e a
    devolver exclusivamente um objeto JSON limpo com os parâmetros médicos detetados.

    Parâmetros:
    -----------
    texto : str
        A frase em linguagem natural descritiva dos sintomas e sinais vitais do paciente.

    Retorno:
    --------
    dict ou None
        Retorna um dicionário estruturado com as chaves correspondentes aos 
        sinais vitais (Age, Heart_Rate_BPM, SpO2_Percent, Temperature_C, Pain_Level, 
        Consciousness). Se a IA falhar na conversão, retorna None.
    """
    if not texto:
        return None

    print("\n🤖 A extrair dados clínicos com IA (Groq)...")

    prompt = f"""És um assistente clínico. Extrai os sinais vitais do seguinte texto falado por um enfermeiro em português.
Devolve APENAS um objeto JSON válido, sem explicações nem markdown, com exatamente estas chaves:
- "Age": número inteiro (anos) ou null
- "Heart_Rate_BPM": número inteiro ou null
- "SpO2_Percent": número inteiro (percentagem de saturação) ou null
- "Temperature_C": número decimal (graus Celsius) ou null
- "Pain_Level": número inteiro de 0 a 10 ou null
- "Consciousness": uma de ["Acordado", "Confuso", "Inconsciente"] ou null

Regras:
- Se um valor não for mencionado, usa null.
- Interpreta linguagem natural: "quase noventa de saturação" → 89, "febre de 39 e meio" → 39.5, "está desorientado" → "Confuso".
- Devolve APENAS o JSON, sem mais nada.

Texto: "{texto}"

JSON:"""

    try:
        resposta = cliente.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        conteudo = resposta.choices[0].message.content.strip()

        match = re.search(r'\{.*\}', conteudo, re.DOTALL)
        if not match:
            raise ValueError(f"Resposta inesperada do modelo: {conteudo}")

        dados = json.loads(match.group())

        sinais_vitais = {}
        for campo, default in CAMPOS_ESPERADOS.items():
            valor = dados.get(campo)
            sinais_vitais[campo] = valor if valor is not None else default

        return sinais_vitais

    except Exception as e:
        print(f"❌ Erro ao chamar o Groq: {str(e)}")
        return None


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    texto_falado = ouvir_enfermeiro(tempo_silencio=2.5)

    if texto_falado:
        ficha = processar_texto_medico(texto_falado)

        if ficha:
            print("\n" + "=" * 50)
            print("📋 FICHA DO PACIENTE:")
            for chave, valor in ficha.items():
                print(f"  {chave}: {valor}")
            print("=" * 50)
            print("\n✅ Pronto para enviar para o modelo de Triagem!")
        else:
            print("\n⚠️  Não foi possível extrair os dados clínicos.")