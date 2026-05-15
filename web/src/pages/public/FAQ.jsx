// src/pages/public/FAQ.jsx
import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

export default function Faqs() {
  const { textos, idioma } = useLanguage();
  const [openIndices,   setOpenIndices]   = useState([]);
  const [isReading,     setIsReading]     = useState(false);
  const [activeQAIndex, setActiveQAIndex] = useState(-1);
  const [charIndex,     setCharIndex]     = useState(0);
  const [charLength,    setCharLength]    = useState(0);

  const faqsData = [
    { question: textos.faqs.q1, answer: textos.faqs.a1 },
    { question: textos.faqs.q2, answer: textos.faqs.a2 },
    { question: textos.faqs.q3, answer: textos.faqs.a3 },
    { question: textos.faqs.q4, answer: textos.faqs.a4 },
    { question: textos.faqs.q5, answer: textos.faqs.a5 },
    { question: textos.faqs.q6, answer: textos.faqs.a6 },
    { question: textos.faqs.q7, answer: textos.faqs.a7 },
    { question: textos.faqs.q8, answer: textos.faqs.a8 },
  ].map((faq) => ({ ...faq, plainText: `${faq.question} ${faq.answer}` }));

  const totalWords  = faqsData.reduce((acc, f) => acc + f.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);
  const isAllOpen   = openIndices.length === faqsData.length;

  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const resetReadingState = () => {
    setIsReading(false);
    setActiveQAIndex(-1);
    setCharIndex(0);
    setCharLength(0);
  };

  const speakFAQ = (index, synth) => {
    if (index >= faqsData.length) { resetReadingState(); return; }
    setActiveQAIndex(index);
    setCharIndex(0);
    setCharLength(0);
    setOpenIndices((prev) => prev.includes(index) ? prev : [...prev, index]);

    const utterance = new SpeechSynthesisUtterance(faqsData[index].plainText);
    utterance.lang  = idioma === 'pt' ? 'pt-PT' : 'en-US';
    utterance.rate  = 0.95;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCharIndex(event.charIndex);
        const length = event.charLength ||
          (event.target.text.substring(event.charIndex).match(/^\S+/) || [' '])[0].length;
        setCharLength(length);
      }
    };
    utterance.onend  = () => speakFAQ(index + 1, synth);
    utterance.onerror = () => resetReadingState();
    synth.speak(utterance);
  };

  const toggleReading = () => {
    if (!('speechSynthesis' in window)) { alert(textos.sobreNos.alertaSemSuporte); return; }
    const synth = window.speechSynthesis;
    if (isReading) { synth.cancel(); resetReadingState(); }
    else { setIsReading(true); speakFAQ(0, synth); }
  };

  const toggleAccordion = (index) =>
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  const toggleAll = () =>
    setOpenIndices(isAllOpen ? [] : faqsData.map((_, i) => i));

  const renderQuestion = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.question;
    const qLen = faq.question.length;
    if (charIndex < qLen) {
      return (
        <>
          {faq.question.substring(0, charIndex)}
          <span className="word-highlight" aria-hidden="true">
            {faq.question.substring(charIndex, charIndex + charLength)}
          </span>
          {faq.question.substring(charIndex + charLength)}
        </>
      );
    }
    return faq.question;
  };

  const renderAnswer = (faq, index) => {
    if (!isReading || activeQAIndex !== index) return faq.answer;
    const qLen = faq.question.length + 1;
    if (charIndex >= qLen) {
      const rel = charIndex - qLen;
      return (
        <>
          {faq.answer.substring(0, rel)}
          <span className="word-highlight" aria-hidden="true">
            {faq.answer.substring(rel, rel + charLength)}
          </span>
          {faq.answer.substring(rel + charLength)}
        </>
      );
    }
    return faq.answer;
  };

  return (
    <div className="faqs-page">

      {/* Breadcrumbs */}
      <div className="faqs-page__breadcrumbs container">
        <Breadcrumbs items={[
          { name: textos.geral.inicio, path: '/'      },
          { name: textos.faqs.titulo,  path: '/faqs'  },
        ]} />
      </div>

      {/* Live region */}
      <div aria-live="polite" className="sr-only">
        {isReading ? textos.acessibilidade.leituraIniciadaPerguntas : textos.acessibilidade.pararLeitura}
      </div>

      {/* Conteúdo */}
      <main className="faqs-page__main container" id="conteudo-principal">
        <div className="faqs-container">

          {/* Cabeçalho */}
          <div className="faqs-header">
            <h1 className="faqs-header__title">{textos.faqs.titulo}</h1>
            <p  className="faqs-header__subtitle">{textos.faqs.subtitulo}</p>
          </div>

          {/* Controlos: leitura + expandir/colapsar */}
          <div className="faqs-toolbar">
            <div className="read-aloud-header">
              <span className="reading-time" aria-label={`${textos.acessibilidade.tempoLeitura}: ${readingTime}`}>
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ~{readingTime} {textos.acessibilidade.tempoLeitura}
              </span>

              <button
                type="button"
                className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
                onClick={toggleReading}
                aria-pressed={isReading}
                aria-label={isReading ? textos.acessibilidade.botaoParar : textos.acessibilidade.botaoOuvir}
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isReading ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
                {isReading ? textos.acessibilidade.botaoParar : textos.acessibilidade.botaoOuvir}
              </button>
            </div>

            <button
              type="button"
              className="btn btn--secondary faqs-toggle-all"
              onClick={toggleAll}
            >
              {isAllOpen ? textos.faqs.colapsarTudo : textos.faqs.expandirTudo}
            </button>
          </div>

          {/* Acordeão */}
          <div className="accordion-list" role="list">
            {faqsData.map((faq, index) => {
              const isOpen          = openIndices.includes(index);
              const isActiveReading = isReading && activeQAIndex === index;

              return (
                <div
                  key={index}
                  className={`accordion-item ${isOpen ? 'accordion-item--open' : ''} ${isActiveReading ? 'accordion-item--reading' : ''}`}
                  role="listitem"
                >
                  <button
                    className="accordion-header"
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    id={`faq-header-${index}`}
                    aria-controls={`faq-content-${index}`}
                  >
                    <h3 className="accordion-header__question">
                      {renderQuestion(faq, index)}
                    </h3>
                    <span className="accordion-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
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