import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/FAQ.css'; 

// Array com as perguntas e respostas
// Adicionei o 'plainText' dinamicamente para facilitar a leitura da voz (Pergunta + Resposta)
const faqsData = [
  {
    question: "O que é o SIAGUH?",
    answer: "É o Sistema Integrado de Apoio à Gestão de Urgências Hospitalares, uma plataforma modular (SIGUI) desenvolvida para gerir desde a entrada do utente até à sua alta ou internamento."
  },
  {
    question: "Os meus dados estão seguros?",
    answer: "Sim. O sistema utiliza autenticação robusta (JWT) e segue as normas do RGPD para garantir que apenas profissionais autorizados acedam aos dados clínicos."
  },
  {
    question: "Como é decidida a cor da minha pulseira?",
    answer: "O enfermeiro introduz os seus sinais vitais e sintomas no sistema. A nossa IA analisa esses dados e sugere uma cor baseada no Protocolo de Manchester, mas a decisão final é sempre validada por um profissional de saúde."
  },
  {
    question: "O tempo de espera indicado é exato?",
    answer: "O tempo é uma estimativa calculada pela IA com base no histórico do hospital e no número de doentes em espera no momento. Pode sofrer alterações se surgirem casos de emergência crítica (pulseiras vermelhas)."
  },
  {
    question: "Como posso saber em que quarto estou internado?",
    answer: "Essa informação é gerida no módulo de internamentos, onde o sistema atribui automaticamente uma cama e serviço após a decisão médica."
  },
  {
    question: "Onde posso consultar as minhas prescrições?",
    answer: "As prescrições emitidas pelos médicos ficam registadas no seu histórico clínico dentro do SIAGUH e podem ser consultadas pelos profissionais que o acompanham."
  },
  {
    question: "Como recupero o meu acesso de funcionário?",
    answer: "Deve contactar o Administrador do sistema, que é o responsável pela gestão de contas e permissões no módulo de profissionais."
  },
  {
    question: "O sistema funciona em dispositivos móveis?",
    answer: "Sim, o SIAGUH possui uma aplicação Android dedicada para que os profissionais possam consultar dados e registar atos médicos em mobilidade."
  }
].map(faq => ({
  ...faq,
  // A voz vai ler a pergunta, dar uma pequena pausa (espaço) e ler a resposta
  plainText: `${faq.question} ${faq.answer}` 
}));

export default function Faqs() {
  const [openIndices, setOpenIndices] = useState([]);
  
  // Estados para o Leitor de Voz
  const [isReading, setIsReading] = useState(false);
  const [activeQAIndex, setActiveQAIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Calcula tempo médio de leitura (200 palavras por minuto)
  const totalWords = faqsData.reduce((acc, faq) => acc + faq.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: 'Perguntas Frequentes', path: '/faqs' }
  ];

  const isAllOpen = openIndices.length === faqsData.length;

  const toggleAccordion = (index) => {
    setOpenIndices((prev) => 
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleAll = () => {
    setOpenIndices(isAllOpen ? [] : faqsData.map((_, index) => index));
  };

  // ---------------------------------------------------------
  // LÓGICA DO LEITOR DE VOZ (TEXT-TO-SPEECH)
  // ---------------------------------------------------------
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleReading = () => {
    if (!('speechSynthesis' in window)) {
      alert("O seu navegador não suporta a leitura de texto em voz alta.");
      return;
    }
    const synth = window.speechSynthesis;
    if (isReading) {
      synth.cancel();
      resetReadingState();
    } else {
      setIsReading(true);
      speakFAQ(0, synth);
    }
  };

  const resetReadingState = () => {
    setIsReading(false);
    setActiveQAIndex(-1);
    setCharIndex(0);
    setCharLength(0);
  };

  const speakFAQ = (index, synth) => {
    if (index >= faqsData.length) {
      resetReadingState();
      return;
    }

    setActiveQAIndex(index);
    setCharIndex(0);
    setCharLength(0);

    // Abre automaticamente a FAQ que vai ser lida caso esteja fechada!
    setOpenIndices((prev) => prev.includes(index) ? prev : [...prev, index]);

    const utterance = new SpeechSynthesisUtterance(faqsData[index].plainText);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.95;

    // Acompanha a leitura palavra a palavra
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCharIndex(event.charIndex);
        let length = event.charLength;
        if (!length) {
          const match = event.target.text.substring(event.charIndex).match(/^\S+/);
          length = match ? match[0].length : 1;
        }
        setCharLength(length);
      }
    };

    utterance.onend = () => speakFAQ(index + 1, synth);
    utterance.onerror = () => resetReadingState();

    synth.speak(utterance);
  };

  // ---------------------------------------------------------
  // RENDERIZAÇÃO DO "TELEPONTO" (HIGHLIGHT)
  // ---------------------------------------------------------
  
  // Renderiza a pergunta destacando a palavra atual (se aplicável)
  const renderQuestion = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.question;

    const qLen = faq.question.length;
    // Se o índice do cursor estiver dentro do tamanho da pergunta
    if (charIndex < qLen) {
      const before = faq.question.substring(0, charIndex);
      const word = faq.question.substring(charIndex, charIndex + charLength);
      const after = faq.question.substring(charIndex + charLength);
      return <>{before}<span className="word-highlight">{word}</span>{after}</>;
    }
    return faq.question;
  };

  // Renderiza a resposta destacando a palavra atual (se aplicável)
  const renderAnswer = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.answer;

    const qLen = faq.question.length + 1; // +1 por causa do espaço que adicionámos
    // Se o índice do cursor já ultrapassou a pergunta, está na resposta!
    if (charIndex >= qLen) {
      const relIndex = charIndex - qLen;
      const before = faq.answer.substring(0, relIndex);
      const word = faq.answer.substring(relIndex, relIndex + charLength);
      const after = faq.answer.substring(relIndex + charLength);
      return <>{before}<span className="word-highlight">{word}</span>{after}</>;
    }
    return faq.answer;
  };

  return (
    <div className="faqs-page-wrapper">
      
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      {/* Acessibilidade para NVDA / VoiceOver */}
      <div aria-live="polite" className="sr-only">
        {isReading ? 'Leitura em voz alta iniciada. As perguntas vão abrir automaticamente.' : 'Leitura em voz alta parada.'}
      </div>

      <main className="faqs-main-content">
        <div className="faqs-container">
          
          <div className="faqs-header">
            <h1>Perguntas Frequentes (FAQ)</h1>
            <p>Encontre respostas rápidas para as dúvidas mais comuns sobre o funcionamento do sistema SIAGUH.</p>
          </div>

          {/* Controlos do Acordeão + Controlos de Leitura lado a lado */}
          <div className="faqs-controls-wrapper">
            <div className="read-aloud-header">
              <span className="reading-time">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ~{readingTime} min
              </span>
              <button 
                type="button"
                className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
                onClick={toggleReading}
                aria-pressed={isReading}
                aria-label={isReading ? "Parar leitura em voz alta" : "Ouvir as perguntas e respostas"}
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isReading ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
                {isReading ? "Parar Leitura" : "Ouvir FAQs"}
              </button>
            </div>

            <div className="faqs-controls">
              <button className="btn-toggle-all" onClick={toggleAll}>
                {isAllOpen ? 'Colapsar tudo' : 'Expandir tudo'}
              </button>
            </div>
          </div>

          <div className="accordion-list">
            {faqsData.map((faq, index) => {
              const isOpen = openIndices.includes(index);
              const isActiveReading = isReading && activeQAIndex === index;

              return (
                <div 
                  key={index} 
                  className={`accordion-item ${isOpen ? 'open' : ''} ${isActiveReading ? 'is-reading-active' : ''}`}
                >
                  <button 
                    className="accordion-header" 
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <h3>{renderQuestion(faq, index)}</h3>
                    <span className="accordion-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  
                  <div className="accordion-collapse">
                    <div className="accordion-body">
                      <p>{renderAnswer(faq, index)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}