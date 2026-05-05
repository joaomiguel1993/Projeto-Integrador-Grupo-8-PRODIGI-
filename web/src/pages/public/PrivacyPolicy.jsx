import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { TEXTOS_PT } from '../../locals/pt';
import '../../styles/PrivacyPolicy.css';

/**
 * @file PrivacyPolicy.jsx
 * @description Página de Política de Privacidade do sistema SIAGUH.
 * Detalha o tratamento de dados pessoais, uso de IA e direitos dos titulares (RGPD).
 * Inclui funcionalidade de síntese de voz com realce visual da leitura.
 * 
 * @component
 * @returns {JSX.Element} A interface da Política de Privacidade.
 */
export default function PrivacyPolicy() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  /**
   * Estrutura de dados que separa o texto para o motor de voz (plainText) 
   * da estrutura visual rica (normalJsx).
   */
  const documentData = [
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v1,
      normalJsx: (
        <>
          <h1>{TEXTOS_PT.politicaPrivacidade.tituloPrincipal}</h1>
          <section aria-labelledby="section-1">
            <h2 id="section-1">{TEXTOS_PT.politicaPrivacidade.s1Titulo}</h2>
            <p>
              {TEXTOS_PT.politicaPrivacidade.s1Texto1} <strong>SIAGUH</strong>, {TEXTOS_PT.politicaPrivacidade.s1Texto2}
            </p>
          </section>
        </>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v2,
      normalJsx: (
        <section aria-labelledby="section-2">
          <h2 id="section-2">{TEXTOS_PT.politicaPrivacidade.s2Titulo}</h2>
          <p>
            {TEXTOS_PT.politicaPrivacidade.s2Texto} <a href="mailto:dpo_grupo8@exemplo.pt">dpo_grupo8@exemplo.pt</a>.
          </p>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v3,
      normalJsx: (
        <section aria-labelledby="section-3">
          <h2 id="section-3">{TEXTOS_PT.politicaPrivacidade.s3Titulo}</h2>
          <p>{TEXTOS_PT.politicaPrivacidade.s3Intro}</p>
          <ul>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblDemog}</strong> {TEXTOS_PT.politicaPrivacidade.txtDemog}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblSaude}</strong> {TEXTOS_PT.politicaPrivacidade.txtSaude}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblIA}</strong> {TEXTOS_PT.politicaPrivacidade.txtIA}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v4,
      normalJsx: (
        <section aria-labelledby="section-4">
          <h2 id="section-4">{TEXTOS_PT.politicaPrivacidade.s4Titulo}</h2>
          <p>{TEXTOS_PT.politicaPrivacidade.s4Intro}</p>
          <ul>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblTriagem}</strong> {TEXTOS_PT.politicaPrivacidade.txtTriagem}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblDecisao}</strong> {TEXTOS_PT.politicaPrivacidade.txtDecisao}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblSeguranca}</strong> {TEXTOS_PT.politicaPrivacidade.txtSeguranca}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v5,
      normalJsx: (
        <section aria-labelledby="section-5">
          <h2 id="section-5">{TEXTOS_PT.politicaPrivacidade.s5Titulo}</h2>
          <p>{TEXTOS_PT.politicaPrivacidade.s5Intro}</p>
          <div className="highlight-box">
            <ul>
              <li>{TEXTOS_PT.politicaPrivacidade.s5Item1}</li>
              <li>{TEXTOS_PT.politicaPrivacidade.s5Item2}</li>
              <li>{TEXTOS_PT.politicaPrivacidade.s5Item3}</li>
            </ul>
          </div>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v6,
      normalJsx: (
        <section aria-labelledby="section-6">
          <h2 id="section-6">{TEXTOS_PT.politicaPrivacidade.s6Titulo}</h2>
          <ul>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblConserva}</strong> {TEXTOS_PT.politicaPrivacidade.txtConserva}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblComunica}</strong> {TEXTOS_PT.politicaPrivacidade.txtComunica}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v7,
      normalJsx: (
        <section aria-labelledby="section-7">
          <h2 id="section-7">{TEXTOS_PT.politicaPrivacidade.s7Titulo}</h2>
          <p>{TEXTOS_PT.politicaPrivacidade.s7Intro}</p>
          <ul>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblDireito1}</strong> {TEXTOS_PT.politicaPrivacidade.txtDireito1}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblDireito2}</strong> {TEXTOS_PT.politicaPrivacidade.txtDireito2}</li>
            <li><strong>{TEXTOS_PT.politicaPrivacidade.lblDireito3}</strong> {TEXTOS_PT.politicaPrivacidade.txtDireito3}</li>
          </ul>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.politicaPrivacidade.v8,
      normalJsx: (
        <section aria-labelledby="section-8">
          <h2 id="section-8">{TEXTOS_PT.politicaPrivacidade.s8Titulo}</h2>
          <p>{TEXTOS_PT.politicaPrivacidade.s8Texto}</p>
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
      alert(TEXTOS_PT.sobreNos.alertaSemSuporte);
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
    utterance.lang = 'pt-PT';
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
    { name: TEXTOS_PT.geral.inicio, path: '/' },
    { name: TEXTOS_PT.politicaPrivacidade.breadcrumb, path: '/politica-privacidade' }
  ];

  return (
    <div className="privacy-page-wrapper">
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? TEXTOS_PT.acessibilidade.leituraIniciadaPerguntas : TEXTOS_PT.acessibilidade.pararLeitura}
      </div>

      <main className="privacy-main-content container" id="conteudo-principal" role="main">
        <article className="privacy-document">
          <div className="read-aloud-header">
            <span className="reading-time" aria-label={`Tempo estimado: ${readingTime} minutos`}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ~{readingTime} {TEXTOS_PT.acessibilidade.tempoLeitura}
            </span>
            
            <button 
              type="button"
              className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
              onClick={toggleReading}
              aria-pressed={isReading}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isReading ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
              {isReading ? TEXTOS_PT.acessibilidade.botaoParar : TEXTOS_PT.acessibilidade.botaoOuvir}
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
            <strong>{TEXTOS_PT.politicaPrivacidade.notaLabel}</strong> {TEXTOS_PT.politicaPrivacidade.notaTexto}
          </p>
        </article>
      </main>
    </div>
  );
}