import speech_recognition as sr
import requests
import json
import re

OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2"

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
    Ouve o microfone e converte a voz em texto (Google Speech-to-Text).
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
    Usa o Ollama (LLM local, gratuito) para extrair sinais vitais do texto.
    Não requer chave de API nem ligação à internet.
    """
    if not texto:
        return None

    print("\n🤖 A extrair dados clínicos com IA local (Ollama)...")

    prompt = f"""You are a clinical assistant. Extract vital signs from the following text spoken by a nurse.
Return ONLY a valid JSON object with exactly these keys (no explanation, no markdown):
- "Age": integer (years) or null
- "Heart_Rate_BPM": integer or null
- "SpO2_Percent": integer (oxygen saturation percentage) or null
- "Temperature_C": decimal number (Celsius) or null
- "Pain_Level": integer 0-10 or null
- "Consciousness": one of ["Acordado", "Confuso", "Inconsciente"] or null

Rules:
- If a value is not mentioned, use null.
- Interpret natural language: "quase noventa de saturação" -> 89, "febre de 39 e meio" -> 39.5, "está desorientado" -> "Confuso".
- Output ONLY the JSON object, nothing else.

Text: "{texto}"

JSON:"""

    try:
        resposta = requests.post(
            OLLAMA_URL,
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
            timeout=120,
        )
        resposta.raise_for_status()

        conteudo = resposta.json().get("response", "").strip()

        # Extrair apenas o JSON da resposta
        match = re.search(r'\{.*\}', conteudo, re.DOTALL)
        if not match:
            raise ValueError(f"Resposta inesperada do modelo: {conteudo}")

        dados = json.loads(match.group())

        # Preencher campos em falta com "Dado não obtido"
        sinais_vitais = {}
        for campo, default in CAMPOS_ESPERADOS.items():
            valor = dados.get(campo)
            sinais_vitais[campo] = valor if valor is not None else default

        return sinais_vitais

    except requests.exceptions.ConnectionError:
        print("❌ Ollama não está a correr. Inicia-o com: ollama serve")
    except requests.exceptions.Timeout:
        print("❌ O modelo demorou demasiado. Tenta novamente.")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"❌ Erro ao interpretar a resposta do modelo: {e}")

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