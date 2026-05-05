import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { useLanguage } from '../../contexts/LanguageContext'; // Importação do Contexto
import '../../styles/PrivacyPolicy.css';

/**
 * @file PrivacyPolicy.jsx
 * @description Página de Política de Privacidade do sistema SIAGUH com suporte multi-idioma.
 * Detalha o tratamento de dados pessoais e direitos RGPD em PT/EN.
 * 
 * @component
 * @returns {JSX.Element} A interface da Política de Privacidade.
 */
export default function PrivacyPolicy() {
  const { textos, idioma } = useLanguage(); // Aceder ao idioma e textos dinâmicos
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  /**
   * Estrutura de dados dinâmica baseada no idioma selecionado.
   */
  const documentData = [
    {
      plainText: textos.politicaPrivacidade.v1,
      normalJsx: (
        <>
          <h1>{textos.politicaPrivacidade.tituloPrincipal}</h1>
          <section aria-labelledby="section-1">
            <h2 id="section-1">{textos.politicaPrivacidade.s1Titulo}</h2>
            <p>
              {textos.politicaPrivacidade.s1Texto1} <strong>SIAGUH</strong>, {textos.politicaPrivacidade.s1Texto2}
            </p>
          </section>
        </>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v2,
      normalJsx: (
        <section aria-labelledby="section-2">
          <h2 id="section-2">{textos.politicaPrivacidade.s2Titulo}</h2>
          <p>
            {textos.politicaPrivacidade.s2Texto} <a href="mailto:dpo_grupo8@exemplo.pt">dpo_grupo8@exemplo.pt</a>.
          </p>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v3,
      normalJsx: (
        <section aria-labelledby="section-3">
          <h2 id="section-3">{textos.politicaPrivacidade.s3Titulo}</h2>
          <p>{textos.politicaPrivacidade.s3Intro}</p>
          <ul>
            <li><strong>{textos.politicaPrivacidade.lblDemog}</strong> {textos.politicaPrivacidade.txtDemog}</li>
            <li><strong>{textos.politicaPrivacidade.lblSaude}</strong> {textos.politicaPrivacidade.txtSaude}</li>
            <li><strong>{textos.politicaPrivacidade.lblIA}</strong> {textos.politicaPrivacidade.txtIA}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v4,
      normalJsx: (
        <section aria-labelledby="section-4">
          <h2 id="section-4">{textos.politicaPrivacidade.s4Titulo}</h2>
          <p>{textos.politicaPrivacidade.s4Intro}</p>
          <ul>
            <li><strong>{textos.politicaPrivacidade.lblTriagem}</strong> {textos.politicaPrivacidade.txtTriagem}</li>
            <li><strong>{textos.politicaPrivacidade.lblDecisao}</strong> {textos.politicaPrivacidade.txtDecisao}</li>
            <li><strong>{textos.politicaPrivacidade.lblSeguranca}</strong> {textos.politicaPrivacidade.txtSeguranca}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v5,
      normalJsx: (
        <section aria-labelledby="section-5">
          <h2 id="section-5">{textos.politicaPrivacidade.s5Titulo}</h2>
          <p>{textos.politicaPrivacidade.s5Intro}</p>
          <div className="highlight-box">
            <ul>
              <li>{textos.politicaPrivacidade.s5Item1}</li>
              <li>{textos.politicaPrivacidade.s5Item2}</li>
              <li>{textos.politicaPrivacidade.s5Item3}</li>
            </ul>
          </div>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v6,
      normalJsx: (
        <section aria-labelledby="section-6">
          <h2 id="section-6">{textos.politicaPrivacidade.s6Titulo}</h2>
          <ul>
            <li><strong>{textos.politicaPrivacidade.lblConserva}</strong> {textos.politicaPrivacidade.txtConserva}</li>
            <li><strong>{textos.politicaPrivacidade.lblComunica}</strong> {textos.politicaPrivacidade.txtComunica}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v7,
      normalJsx: (
        <section aria-labelledby="section-7">
          <h2 id="section-7">{textos.politicaPrivacidade.s7Titulo}</h2>
          <p>{textos.politicaPrivacidade.s7Intro}</p>
          <ul>
            <li><strong>{textos.politicaPrivacidade.lblDireito1}</strong> {textos.politicaPrivacidade.txtDireito1}</li>
            <li><strong>{textos.politicaPrivacidade.lblDireito2}</strong> {textos.politicaPrivacidade.txtDireito2}</li>
            <li><strong>{textos.politicaPrivacidade.lblDireito3}</strong> {textos.politicaPrivacidade.txtDireito3}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: textos.politicaPrivacidade.v8,
      normalJsx: (
        <section aria-labelledby="section-8">
          <h2 id="section-8">{textos.politicaPrivacidade.s8Titulo}</h2>
          <p>{textos.politicaPrivacidade.s8Texto}</p>
        </section>
      )
    }
  ];

  const totalWords = documentData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

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
      speakParagraph(0, synth);
    }
  };

  const resetReadingState = () => {
    setIsReading(false);
    setActiveParagraph(-1);
    setCharIndex(0);
    setCharLength(0);
  };

  const speakParagraph = (index, synth) => {
    if (index >= documentData.length) {
      resetReadingState();
      return;
    }
    setActiveParagraph(index);
    setCharIndex(0);
    setCharLength(0);

    const utterance = new SpeechSynthesisUtterance(documentData[index].plainText);
    
    // Configura sotaque dinâmico PT ou EN
    utterance.lang = idioma === 'pt' ? 'pt-PT' : 'en-US';
    utterance.rate = 0.95;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCharIndex(event.charIndex);
        let length = event.charLength || (event.target.text.substring(event.charIndex).match(/^\S+/) || [" "])[0].length;
        setCharLength(length);
      }
    };

    utterance.onend = () => speakParagraph(index + 1, synth);
    utterance.onerror = () => resetReadingState();
    synth.speak(utterance);
  };

  const renderContent = (index) => {
    const data = documentData[index];
    if (!isReading || activeParagraph !== index) return data.normalJsx;

    const before = data.plainText.substring(0, charIndex);
    const highlightedWord = data.plainText.substring(charIndex, charIndex + charLength);
    const after = data.plainText.substring(charIndex + charLength);

    return (
      <div className="reading-teleprompter" aria-live="off">
        {before}
        <span className="word-highlight" aria-hidden="true">{highlightedWord}</span>
        {after}
      </div>
    );
  };

  const breadcrumbsLinks = [
    { name: textos.geral.inicio, path: '/' },
    { name: textos.politicaPrivacidade.breadcrumb, path: '/politica-privacidade' }
  ];

  return (
    <div className="privacy-page-wrapper">
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? textos.acessibilidade.leituraIniciadaPerguntas : textos.acessibilidade.pararLeitura}
      </div>

      <main className="privacy-main-content container" id="conteudo-principal" role="main">
        <article className="privacy-document">
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

          <div className="document-sections">
            {documentData.map((section, index) => (
              <div key={index} className={`section-wrapper ${activeParagraph === index ? 'is-active-reading' : ''}`}>
                {renderContent(index)}
              </div>
            ))}
          </div>

          <hr className="privacy-divider" aria-hidden="true" />
          
          <p className="privacy-footer-note">
            <strong>{textos.politicaPrivacidade.notaLabel}</strong> {textos.politicaPrivacidade.notaTexto}
          </p>
        </article>
      </main>
    </div>
  );
}