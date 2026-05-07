import speech_recognition as sr
import re
import threading
import time

a_gravar = True
frames_audio = []

def gravar_audio_fundo(fonte):
    """Fica a roubar o áudio do microfone em silêncio"""
    global a_gravar, frames_audio
    while a_gravar:
        try:
            buffer = fonte.stream.read(fonte.CHUNK, exception_on_overflow=False)
            frames_audio.append(buffer)
        except Exception:
            pass

def ouvir_enfermeiro():
    global a_gravar, frames_audio
    a_gravar = True
    frames_audio = []
    
    reconhecedor = sr.Recognizer()
    microfone = sr.Microphone()
    
    print("\n🎤 A ligar e calibrar o microfone... (silêncio de 1 segundo)")
    
    with microfone as fonte:
        reconhecedor.adjust_for_ambient_noise(fonte, duration=1)
        
        print("\n" + "="*50)
        print("🟢 PODE FALAR! (O microfone está a gravar sem limites)")
        print("   Faça as pausas que quiser.")
        print("   👉 QUANDO TERMINAR: Pressione as teclas [Ctrl + C] para parar.")
        print("="*50 + "\n")
        
        # Inicia a gravação em segundo plano
        tarefa_gravacao = threading.Thread(target=gravar_audio_fundo, args=(fonte,))
        tarefa_gravacao.start()
        
        # Fica num ciclo infinito à espera do Ctrl+C
        try:
            while True:
                time.sleep(0.1) # Fica a dormir para não gastar CPU
        except KeyboardInterrupt:
            # O utilizador carregou em Ctrl+C! Vamos agir!
            print("\n🛑 Gravação parada com sucesso!")
            
        a_gravar = False
        print("⏳ A processar o áudio com Inteligência Artificial... (aguarde)")
        tarefa_gravacao.join()
        
        if len(frames_audio) == 0:
            print("❌ Erro: O microfone não captou nenhum som.")
            return None
            
        # Junta os blocos de áudio
        audio_completo = sr.AudioData(b"".join(frames_audio), fonte.SAMPLE_RATE, fonte.SAMPLE_WIDTH)
        
    # Fase de Tradução
    try:
        texto = reconhecedor.recognize_google(audio_completo, language="pt-PT")
        print(f"\n📝 Texto reconhecido: '{texto}'")
        return texto.lower()
    except sr.UnknownValueError:
        print("❌ Erro: A IA não conseguiu perceber o que disse.")
        return None
    except sr.RequestError:
        print("❌ Erro: Sem ligação à internet.")
        return None

def processar_texto_medico(texto):
    if not texto: return None
    print("\n🔍 A extrair dados clínicos do texto...")
    
    sinais_vitais = {'Age': 45, 'Heart_Rate_BPM': 80, 'SpO2_Percent': 98, 'Temperature_C': 36.5, 'Pain_Level': 0, 'Consciousness': 'Acordado'}
    
    if match := re.search(r'(\d+)\s*(anos|idade)', texto): sinais_vitais['Age'] = int(match.group(1))
    if match := re.search(r'(\d+)\s*(%|por cento|oxigénio|saturação)', texto): sinais_vitais['SpO2_Percent'] = int(match.group(1))
    if match := re.search(r'(\d+)\s*(batimentos|pulsação|bpm)', texto): sinais_vitais['Heart_Rate_BPM'] = int(match.group(1))
    if match := re.search(r'(\d+[.,]?\d*)\s*(graus|temperatura|febre)', texto): sinais_vitais['Temperature_C'] = float(match.group(1).replace(',', '.'))
    if match := re.search(r'dor\s*(nível|de)?\s*(\d+)', texto): sinais_vitais['Pain_Level'] = int(match.group(2))
    
    if 'confuso' in texto or 'desorientado' in texto: sinais_vitais['Consciousness'] = 'Confuso'
    elif 'inconsciente' in texto or 'desmaiado' in texto: sinais_vitais['Consciousness'] = 'Inconsciente'
    
    return sinais_vitais

if __name__ == "__main__":
    texto_falado = ouvir_enfermeiro()
    
    if texto_falado:
        ficha_paciente = processar_texto_medico(texto_falado)
        
        print("\n" + "="*50)
        print("📋 FICHA DO PACIENTE PREENCHIDA AUTOMATICAMENTE:")
        for chave, valor in ficha_paciente.items():
            print(f" - {chave}: {valor}")
        print("="*50)