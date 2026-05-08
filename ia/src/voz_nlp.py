import speech_recognition as sr
import re

def ouvir_enfermeiro(tempo_silencio=2.5, tempo_espera_inicio=5, limite_frase=20):
    """
    Ouve o microfone e converte a voz em texto.
    
    Parâmetros:
    - tempo_silencio: Segundos de silêncio necessários para a gravação parar (o "buffer").
    - tempo_espera_inicio: Segundos que aguarda até a pessoa começar a falar.
    - limite_frase: Tempo máximo (em segundos) que a gravação total pode durar.
    """
    reconhecedor = sr.Recognizer()
    
    # A MÁGICA ACONTECE AQUI: Aumentamos o tempo de silêncio permitido antes de cortar
    reconhecedor.pause_threshold = tempo_silencio
    
    with sr.Microphone() as fonte:
        print("\n🎤 A calibrar o ruído de fundo... (Silêncio de 1 segundo)")
        reconhecedor.adjust_for_ambient_noise(fonte)
        
        print(f"\n🟢 PODE FALAR! (Pode fazer pausas de até {tempo_silencio} segundos sem que a gravação pare)")
        print("Exemplo: 'Paciente com 68 anos, oxigénio a 88, 145 batimentos, temperatura de 39.5, dor 9, está confuso.'\n")
        
        try:
            # Ouve o microfone usando as variáveis de controlo de tempo
            audio = reconhecedor.listen(
                fonte, 
                timeout=tempo_espera_inicio, 
                phrase_time_limit=limite_frase
            )
            print("⏳ A processar o áudio (NLP)...")
            
            # Traduz para texto (Português de Portugal)
            texto = reconhecedor.recognize_google(audio, language="pt-PT")
            print(f"\n📝 Texto reconhecido: '{texto}'")
            return texto.lower()
            
        except sr.WaitTimeoutError:
            print("❌ Erro: Não detetei nenhuma voz dentro do tempo limite.")
            return None
        except sr.UnknownValueError:
            print("❌ Erro: Não consegui perceber o que disse. Fale mais alto e devagar.")
            return None
        except sr.RequestError:
            print("❌ Erro: Sem ligação à internet para processar a voz.")
            return None

def processar_texto_medico(texto):
    """
    Procura padrões (Regex) no texto para extrair os sinais vitais.
    """
    if not texto:
        return None
        
    print("\n🔍 A extrair dados clínicos do texto...")
    
    # Dicionário padrão (valores normais caso a IA não ouça alguma coisa)
    sinais_vitais = {
        'Age': 45,
        'Heart_Rate_BPM': 80,
        'SpO2_Percent': 98,
        'Temperature_C': 36.5,
        'Pain_Level': 0,
        'Consciousness': 'Acordado'
    }
    
    # 1. Extrair Idade
    match_idade = re.search(r'(\d+)\s*(anos|idade)', texto)
    if match_idade:
        sinais_vitais['Age'] = int(match_idade.group(1))

    # 2. Extrair SpO2 / Oxigénio
    match_spo2 = re.search(r'(\d+)\s*(%|por cento|oxigénio|saturação)', texto)
    if match_spo2:
        sinais_vitais['SpO2_Percent'] = int(match_spo2.group(1))

    # 3. Extrair BPM / Batimentos
    match_bpm = re.search(r'(\d+)\s*(batimentos|pulsação|bpm)', texto)
    if match_bpm:
        sinais_vitais['Heart_Rate_BPM'] = int(match_bpm.group(1))

    # 4. Extrair Temperatura (lida com vírgulas e pontos)
    match_temp = re.search(r'(\d+[.,]?\d*)\s*(graus|temperatura|febre)', texto)
    if match_temp:
        temp_str = match_temp.group(1).replace(',', '.')
        sinais_vitais['Temperature_C'] = float(temp_str)

    # 5. Extrair Dor
    match_dor = re.search(r'dor\s*(nível|de)?\s*(\d+)', texto)
    if match_dor:
        sinais_vitais['Pain_Level'] = int(match_dor.group(2))

    # 6. NLP Simples para Nível de Consciência
    if any(palavra in texto for palavra in ['confuso', 'desorientado']):
        sinais_vitais['Consciousness'] = 'Confuso'
    elif any(palavra in texto for palavra in ['inconsciente', 'desmaiado']):
        sinais_vitais['Consciousness'] = 'Inconsciente'

    return sinais_vitais

if __name__ == "__main__":
    # Podes ajustar os 2.5 segundos para o tempo que achares mais confortável
    texto_falado = ouvir_enfermeiro(tempo_silencio=2.5)
    
    if texto_falado:
        ficha_paciente = processar_texto_medico(texto_falado)
        
        print("\n" + "="*50)
        print("📋 FICHA DO PACIENTE PREENCHIDA AUTOMATICAMENTE:")
        for chave, valor in ficha_paciente.items():
            print(f" - {chave}: {valor}")
        print("="*50)
        
        print("\n(Pronto para enviar para o modelo de Triagem!)")