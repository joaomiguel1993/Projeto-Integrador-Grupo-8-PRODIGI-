import speech_recognition as sr
import re

def ouvir_enfermeiro(tempo_silencio=2.5, tempo_espera_inicio=5, limite_frase=20):
    """
    Ouve o microfone e converte a voz em texto com calibração otimizada.
    """
    reconhecedor = sr.Recognizer()
    reconhecedor.pause_threshold = tempo_silencio
    reconhecedor.dynamic_energy_threshold = True 
    
    with sr.Microphone() as fonte:
        print("\n🎤 A calibrar o ruído de fundo... (Por favor, faça silêncio durante 2 segundos)")
        reconhecedor.adjust_for_ambient_noise(fonte, duration=2)
        
        print(f"\n🟢 PODE FALAR! (Pode fazer pausas de até {tempo_silencio} segundos)")
        print("Exemplo: 'Paciente com 68 anos, oxigénio a 88, 145 batimentos, temperatura de 39.5, dor 9, está confuso.'\n")
        
        try:
            audio = reconhecedor.listen(
                fonte, 
                timeout=tempo_espera_inicio, 
                phrase_time_limit=limite_frase
            )
            print("⏳ A processar o áudio (NLP)...")
            
            texto = reconhecedor.recognize_google(audio, language="pt-PT")
            print(f"\n📝 Texto reconhecido: '{texto}'")
            return texto.lower()
            
        except sr.WaitTimeoutError:
            print("❌ Erro: Não detetei nenhuma voz dentro do tempo limite.")
            return None
        except sr.UnknownValueError:
            print("❌ Erro: Não consegui perceber o que disse. Fale de forma mais clara.")
            return None
        except sr.RequestError:
            print("❌ Erro: Sem ligação à internet para processar a voz.")
            return None

def processar_texto_medico(texto):
    """
    Procura padrões (Regex) no texto para extrair os sinais vitais.
    Se não encontrar, preenche com 'Dado não obtido'.
    """
    if not texto:
        return None
        
    print("\n🔍 A extrair dados clínicos do texto...")
    
    # NOVO: Dicionário inicializa tudo sem preenchimento automático numérico
    sinais_vitais = {
        'Age': 'Dado não obtido',
        'Heart_Rate_BPM': 'Dado não obtido',
        'SpO2_Percent': 'Dado não obtido',
        'Temperature_C': 'Dado não obtido',
        'Pain_Level': 'Dado não obtido',
        'Consciousness': 'Dado não obtido'
    }
    
    # 1. Extrair Idade
    match_idade = re.search(r'(\d+)\s*(anos|idade)', texto)
    if match_idade:
        sinais_vitais['Age'] = int(match_idade.group(1))

    # 2. Extrair SpO2 / Oxigénio
    match_spo2 = re.search(r'(\d+)\s*(%|por cento|oxigéni?o?|saturação|o2)', texto)
    if match_spo2:
        sinais_vitais['SpO2_Percent'] = int(match_spo2.group(1))

    # 3. Extrair BPM / Batimentos
    match_bpm = re.search(r'(\d+)\s*(batimentos?|pulsação|bpm|batimento cardiaco|pulso)', texto)
    if match_bpm:
        sinais_vitais['Heart_Rate_BPM'] = int(match_bpm.group(1))

    # 4. Extrair Temperatura
    match_temp = re.search(r'(\d+[.,]?\d*)\s*(graus?|temperatura|febre)', texto)
    if match_temp:
        temp_str = match_temp.group(1).replace(',', '.')
        sinais_vitais['Temperature_C'] = float(temp_str)

    # 5. Extrair Dor
    match_dor = re.search(r'dor\s*(nível|de)?\s*(\d+)', texto)
    if match_dor:
        sinais_vitais['Pain_Level'] = int(match_dor.group(2))

    # 6. NLP para Nível de Consciência (NOVO: só assume estado se for dito)
    if any(palavra in texto for palavra in ['confuso', 'desorientado', 'delírio']):
        sinais_vitais['Consciousness'] = 'Confuso'
    elif any(palavra in texto for palavra in ['inconsciente', 'desmaiado', 'coma']):
        sinais_vitais['Consciousness'] = 'Inconsciente'
    elif any(palavra in texto for palavra in ['acordado', 'alerta', 'consciente', 'orientado']):
        sinais_vitais['Consciousness'] = 'Acordado'

    return sinais_vitais

if __name__ == "__main__":
    texto_falado = ouvir_enfermeiro(tempo_silencio=2.5)
    
    if texto_falado:
        ficha_paciente = processar_texto_medico(texto_falado)
        
        print("\n" + "="*50)
        print("📋 FICHA DO PACIENTE PREENCHIDA AUTOMATICAMENTE:")
        for chave, valor in ficha_paciente.items():
            print(f" - {chave}: {valor}")
        print("="*50)
        
        print("\n(Pronto para enviar para o modelo de Triagem!)")