import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { useLanguage } from '../../contexts/LanguageContext'; // Importação do Contexto
import '../../styles/FAQ.css'; 

/**
 * @file Faqs.jsx
 * @description Página de Perguntas Frequentes (FAQ) do sistema SIAGUH com suporte multi-idioma.
 */
export default function Faqs() {
  const { textos, idioma } = useLanguage(); // Aceder ao idioma e textos dinâmicos
  const [openIndices, setOpenIndices] = useState([]);
  
  // Estados para o Leitor de Voz
  const [isReading, setIsReading] = useState(false);
  const [activeQAIndex, setActiveQAIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Mapeamento dinâmico dos dados vindo do dicionário de idiomas ativo
  const faqsData = [
    { question: textos.faqs.q1, answer: textos.faqs.a1 },
    { question: textos.faqs.q2, answer: textos.faqs.a2 },
    { question: textos.faqs.q3, answer: textos.faqs.a3 },
    { question: textos.faqs.q4, answer: textos.faqs.a4 },
    { question: textos.faqs.q5, answer: textos.faqs.a5 },
    { question: textos.faqs.q6, answer: textos.faqs.a6 },
    { question: textos.faqs.q7, answer: textos.faqs.a7 },
    { question: textos.faqs.q8, answer: textos.faqs.a8 }
  ].map(faq => ({
    ...faq,
    plainText: `${faq.question} ${faq.answer}` 
  }));

  const totalWords = faqsData.reduce((acc, faq) => acc + faq.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  const breadcrumbsLinks = [
    { name: textos.geral.inicio, path: '/' },
    { name: textos.faqs.titulo, path: '/faqs' }
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

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleReading = () => {
    if (!('speechSynthesis' in window)) {
      alert(textos.sobreNos.alertaSemSuporte);
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

    setOpenIndices((prev) => prev.includes(index) ? prev : [...prev, index]);

    const utterance = new SpeechSynthesisUtterance(faqsData[index].plainText);
    
    // Configura o idioma da voz com base no idioma selecionado no portal
    utterance.lang = idioma === 'pt' ? 'pt-PT' : 'en-US';
    utterance.rate = 0.95;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCharIndex(event.charIndex);
        let length = event.charLength || (event.target.text.substring(event.charIndex).match(/^\S+/) || [" "])[0].length;
        setCharLength(length);
      }
    };

    utterance.onend = () => speakFAQ(index + 1, synth);
    utterance.onerror = () => resetReadingState();
    synth.speak(utterance);
  };

  const renderQuestion = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.question;
    const qLen = faq.question.length;
    if (charIndex < qLen) {
      const before = faq.question.substring(0, charIndex);
      const word = faq.question.substring(charIndex, charIndex + charLength);
      const after = faq.question.substring(charIndex + charLength);
      return <>{before}<span className="word-highlight" aria-hidden="true">{word}</span>{after}</>;
    }
    return faq.question;
  };

  const renderAnswer = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.answer;
    const qLen = faq.question.length + 1;
    if (charIndex >= qLen) {
      const relIndex = charIndex - qLen;
      const before = faq.answer.substring(0, relIndex);
      const word = faq.answer.substring(relIndex, relIndex + charLength);
      const after = faq.answer.substring(relIndex + charLength);
      return <>{before}<span className="word-highlight" aria-hidden="true">{word}</span>{after}</>;
    }
    return faq.answer;
  };

  return (
    <div className="faqs-page-wrapper">
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? textos.acessibilidade.leituraIniciadaPerguntas : textos.acessibilidade.pararLeitura}
      </div>

      <main className="faqs-main-content container" id="conteudo-principal">
        <div className="faqs-container">
          
          <div className="faqs-header">
            <h1>{textos.faqs.titulo}</h1>
            <p>{textos.faqs.subtitulo}</p>
          </div>

          <div className="faqs-controls-wrapper">
            <div className="read-aloud-header">
              <span className="reading-time" aria-label={`${textos.acessibilidade.tempoLeitura}: ${readingTime}`}>
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ~{readingTime} {textos.acessibilidade.tempoLeitura}
              </span>
              <button 
                type="button"
                className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
                onClick={toggleReading}
                aria-pressed={isReading}
                aria-label={isReading ? textos.acessibilidade.botaoParar : textos.acessibilidade.botaoOuvir}
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isReading ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
                {isReading ? textos.acessibilidade.botaoParar : textos.acessibilidade.botaoOuvir}
              </button>
            </div>

            <div className="faqs-controls">
              <button className="btn-toggle-all" onClick={toggleAll}>
                {isAllOpen ? textos.faqs.colapsarTudo : textos.faqs.expandirTudo}
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
                    id={`faq-header-${index}`}
                    aria-controls={`faq-content-${index}`}
                  >
                    <h3>{renderQuestion(faq, index)}</h3>
                    <span className="accordion-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  
                  <div 
                    className="accordion-collapse"
                    id={`faq-content-${index}`}
                    role="region"
                    aria-labelledby={`faq-header-${index}`}
                    hidden={!isOpen}
                  >
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