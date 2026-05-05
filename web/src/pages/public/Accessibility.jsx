import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { TEXTOS_PT } from '../../locals/pt';
import '../../styles/Accessibility.css';

/**
 * @file Accessibility.jsx
 * @description Página de Declaração de Acessibilidade e Usabilidade do sistema PRODIGI.
 * Fornece informações sobre a conformidade com o Decreto-Lei n.º 83/2018.
 * Inclui funcionalidade de leitura assistida com realce dinâmico de texto.
 * 
 * @component
 * @returns {JSX.Element} A interface da Declaração de Acessibilidade.
 */
export default function Accessibility() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  /**
   * Dados estruturados da declaração.
   * Mantemos o texto simples (plainText) para a síntese de voz e o JSX (normalJsx) para a renderização visual.
   */
  const documentData = [
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccaoIntro,
      normalJsx: (
        <>
          <h1>{TEXTOS_PT.acessibilidadePagina.tituloPrincipal}</h1>
          <p className="intro-text">
            {TEXTOS_PT.acessibilidadePagina.introTexto1} <strong>{TEXTOS_PT.acessibilidadePagina.grupo8}</strong> {TEXTOS_PT.acessibilidadePagina.introTexto2} <strong>{TEXTOS_PT.acessibilidadePagina.prodigi}</strong>, {TEXTOS_PT.acessibilidadePagina.introTexto3}
          </p>
        </>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccao1Voz,
      normalJsx: (
        <section aria-labelledby="status-conformidade">
          <h2 id="status-conformidade">{TEXTOS_PT.acessibilidadePagina.statusTitulo}</h2>
          <p>{TEXTOS_PT.acessibilidadePagina.statusTexto}</p>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccao2Voz,
      normalJsx: (
        <section aria-labelledby="elaboracao-decl">
          <h2 id="elaboracao-decl">{TEXTOS_PT.acessibilidadePagina.elaboracaoTitulo}</h2>
          <p>{TEXTOS_PT.acessibilidadePagina.elaboracaoTexto}</p>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccaoA_Voz,
      normalJsx: (
        <div className="sub-section">
          <h3>{TEXTOS_PT.acessibilidadePagina.avalAutoTitulo}</h3>
          <ul>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblFerramenta}</strong> AccessMonitor.</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblAmostra}</strong> {TEXTOS_PT.acessibilidadePagina.amostraWeb}</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblResultados}</strong> {TEXTOS_PT.acessibilidadePagina.resAuto}</li>
          </ul>
        </div>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccaoB_Voz,
      normalJsx: (
        <div className="sub-section">
          <h3>{TEXTOS_PT.acessibilidadePagina.avalManualTitulo}</h3>
          <p className="date-report">{TEXTOS_PT.acessibilidadePagina.relManual}</p>
          <ul>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblAmostra}</strong> {TEXTOS_PT.acessibilidadePagina.amostraModulos}</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblResultados}</strong> {TEXTOS_PT.acessibilidadePagina.resManual}</li>
          </ul>
        </div>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccaoC_Voz,
      normalJsx: (
        <div className="sub-section">
          <h3>{TEXTOS_PT.acessibilidadePagina.testesUsaTitulo}</h3>
          <p className="date-report">{TEXTOS_PT.acessibilidadePagina.relUsa}</p>
          <ul>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblParticipantes}</strong> {TEXTOS_PT.acessibilidadePagina.participantesDesc}</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblTarefas}</strong> {TEXTOS_PT.acessibilidadePagina.tarefasDesc}</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblResultados}</strong> {TEXTOS_PT.acessibilidadePagina.resUsa}</li>
          </ul>
        </div>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccao3Voz,
      normalJsx: (
        <section aria-labelledby="contacto-info">
          <h2 id="contacto-info">{TEXTOS_PT.acessibilidadePagina.contactoTitulo}</h2>
          <p>{TEXTOS_PT.acessibilidadePagina.contactoTexto}</p>
          <ul className="contact-list">
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblResponsaveis}</strong> {TEXTOS_PT.acessibilidadePagina.responsaveisNomes}</li>
            <li><strong>{TEXTOS_PT.acessibilidadePagina.lblEmail}</strong> <a href="mailto:grupo8_prodigi@exemplo.pt">grupo8_prodigi@exemplo.pt</a></li>
          </ul>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccao4Voz,
      normalJsx: (
        <section aria-labelledby="outras-evidencias">
          <h2 id="outras-evidencias">{TEXTOS_PT.acessibilidadePagina.evidenciasTitulo}</h2>
          <p>{TEXTOS_PT.acessibilidadePagina.evidenciasTexto}</p>
        </section>
      )
    },
    {
      plainText: TEXTOS_PT.acessibilidadePagina.seccao5Voz,
      normalJsx: (
        <section aria-labelledby="denuncia-discrim">
          <h2 id="denuncia-discrim">{TEXTOS_PT.acessibilidadePagina.denunciaTitulo}</h2>
          <p>{TEXTOS_PT.acessibilidadePagina.denunciaTexto}</p>
        </section>
      )
    }
  ];

  const totalWords = documentData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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

    if (!isReading || activeParagraph !== index) {
      return data.normalJsx;
    }

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
    { name: TEXTOS_PT.acessibilidadePagina.breadcrumb, path: '/acessibilidade' }
  ];

  return (
    <div className="accessibility-page-wrapper">
      
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? TEXTOS_PT.acessibilidade.leituraIniciadaPerguntas : TEXTOS_PT.acessibilidade.pararLeitura}
      </div>

      <main className="accessibility-main-content container" id="conteudo-principal" role="main">
        <div className="accessibility-document">
          
          <div className="read-aloud-header">
            <span className="reading-time" aria-label={`Tempo de leitura: ${readingTime} minutos`}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ~{readingTime} {TEXTOS_PT.acessibilidade.tempoLeitura}
            </span>
            
            <button 
              type="button"
              className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
              onClick={toggleReading}
              aria-pressed={isReading}
              aria-label={isReading ? TEXTOS_PT.acessibilidade.botaoParar : TEXTOS_PT.acessibilidade.botaoOuvir}
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

          <article className="document-sections">
            {documentData.map((section, index) => (
              <div key={index} className={`section-wrapper ${activeParagraph === index ? 'is-active-reading' : ''}`}>
                {renderContent(index)}
              </div>
            ))}
          </article>

          <hr className="accessibility-divider" aria-hidden="true" />
          
          <p className="accessibility-footer-note">
            {TEXTOS_PT.acessibilidadePagina.notaRodape}
          </p>
        </div>

        <Outlet />
      </main>
    </div>
  );
}