// src/pages/public/Accessibility.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

export default function Accessibility() {
  const { textos, idioma } = useLanguage();
  const [isReading,       setIsReading]       = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex,       setCharIndex]       = useState(0);
  const [charLength,      setCharLength]      = useState(0);

  const documentData = [
    {
      plainText: textos.acessibilidadePagina.seccaoIntro,
      normalJsx: (
        <>
          <h1 className="a11y-doc__title">{textos.acessibilidadePagina.tituloPrincipal}</h1>
          <p className="a11y-doc__intro">
            {textos.acessibilidadePagina.introTexto1}{' '}
            <strong>{textos.acessibilidadePagina.grupo8}</strong>{' '}
            {textos.acessibilidadePagina.introTexto2}{' '}
            <strong>{textos.acessibilidadePagina.prodigi}</strong>,{' '}
            {textos.acessibilidadePagina.introTexto3}
          </p>
        </>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccao1Voz,
      normalJsx: (
        <section aria-labelledby="status-conformidade">
          <h2 id="status-conformidade">{textos.acessibilidadePagina.statusTitulo}</h2>
          <p>{textos.acessibilidadePagina.statusTexto}</p>
        </section>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccao2Voz,
      normalJsx: (
        <section aria-labelledby="elaboracao-decl">
          <h2 id="elaboracao-decl">{textos.acessibilidadePagina.elaboracaoTitulo}</h2>
          <p>{textos.acessibilidadePagina.elaboracaoTexto}</p>
        </section>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccaoA_Voz,
      normalJsx: (
        <div className="a11y-sub-section">
          <h3>{textos.acessibilidadePagina.avalAutoTitulo}</h3>
          <ul className="a11y-list">
            <li><strong>{textos.acessibilidadePagina.lblFerramenta}</strong> AccessMonitor.</li>
            <li><strong>{textos.acessibilidadePagina.lblAmostra}</strong> {textos.acessibilidadePagina.amostraWeb}</li>
            <li><strong>{textos.acessibilidadePagina.lblResultados}</strong> {textos.acessibilidadePagina.resAuto}</li>
          </ul>
        </div>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccaoB_Voz,
      normalJsx: (
        <div className="a11y-sub-section">
          <h3>{textos.acessibilidadePagina.avalManualTitulo}</h3>
          <p className="a11y-date-report">{textos.acessibilidadePagina.relManual}</p>
          <ul className="a11y-list">
            <li><strong>{textos.acessibilidadePagina.lblAmostra}</strong> {textos.acessibilidadePagina.amostraModulos}</li>
            <li><strong>{textos.acessibilidadePagina.lblResultados}</strong> {textos.acessibilidadePagina.resManual}</li>
          </ul>
        </div>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccaoC_Voz,
      normalJsx: (
        <div className="a11y-sub-section">
          <h3>{textos.acessibilidadePagina.testesUsaTitulo}</h3>
          <p className="a11y-date-report">{textos.acessibilidadePagina.relUsa}</p>
          <ul className="a11y-list">
            <li><strong>{textos.acessibilidadePagina.lblParticipantes}</strong> {textos.acessibilidadePagina.participantesDesc}</li>
            <li><strong>{textos.acessibilidadePagina.lblTarefas}</strong> {textos.acessibilidadePagina.tarefasDesc}</li>
            <li><strong>{textos.acessibilidadePagina.lblResultados}</strong> {textos.acessibilidadePagina.resUsa}</li>
          </ul>
        </div>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccao3Voz,
      normalJsx: (
        <section aria-labelledby="contacto-info">
          <h2 id="contacto-info">{textos.acessibilidadePagina.contactoTitulo}</h2>
          <p>{textos.acessibilidadePagina.contactoTexto}</p>
          <ul className="a11y-contact-list">
            <li><strong>{textos.acessibilidadePagina.lblResponsaveis}</strong> {textos.acessibilidadePagina.responsaveisNomes}</li>
            <li>
              <strong>{textos.acessibilidadePagina.lblEmail}</strong>{' '}
              <a href="mailto:grupo8_prodigi@exemplo.pt" className="a11y-link">
                grupo8_prodigi@exemplo.pt
              </a>
            </li>
          </ul>
        </section>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccao4Voz,
      normalJsx: (
        <section aria-labelledby="outras-evidencias">
          <h2 id="outras-evidencias">{textos.acessibilidadePagina.evidenciasTitulo}</h2>
          <p>{textos.acessibilidadePagina.evidenciasTexto}</p>
        </section>
      ),
    },
    {
      plainText: textos.acessibilidadePagina.seccao5Voz,
      normalJsx: (
        <section aria-labelledby="denuncia-discrim">
          <h2 id="denuncia-discrim">{textos.acessibilidadePagina.denunciaTitulo}</h2>
          <p>{textos.acessibilidadePagina.denunciaTexto}</p>
        </section>
      ),
    },
  ];

  const totalWords  = documentData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const resetReadingState = () => {
    setIsReading(false);
    setActiveParagraph(-1);
    setCharIndex(0);
    setCharLength(0);
  };

  const speakParagraph = (index, synth) => {
    if (index >= documentData.length) { resetReadingState(); return; }
    setActiveParagraph(index);
    setCharIndex(0);
    setCharLength(0);
    const utterance = new SpeechSynthesisUtterance(documentData[index].plainText);
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
    utterance.onend  = () => speakParagraph(index + 1, synth);
    utterance.onerror = () => resetReadingState();
    synth.speak(utterance);
  };

  const toggleReading = () => {
    if (!('speechSynthesis' in window)) {
      alert(textos.sobreNos.alertaSemSuporte);
      return;
    }
    const synth = window.speechSynthesis;
    if (isReading) { synth.cancel(); resetReadingState(); }
    else { setIsReading(true); speakParagraph(0, synth); }
  };

  const renderContent = (index) => {
    const data = documentData[index];
    if (!isReading || activeParagraph !== index) return data.normalJsx;
    return (
      <div className="reading-teleprompter" aria-live="off">
        {data.plainText.substring(0, charIndex)}
        <span className="word-highlight" aria-hidden="true">
          {data.plainText.substring(charIndex, charIndex + charLength)}
        </span>
        {data.plainText.substring(charIndex + charLength)}
      </div>
    );
  };

  return (
    <div className="a11y-page">

      {/* Breadcrumbs */}
      <div className="a11y-page__breadcrumbs container">
        <Breadcrumbs items={[
          { name: textos.geral.inicio,                        path: '/'              },
          { name: textos.acessibilidadePagina.breadcrumb,     path: '/acessibilidade'},
        ]} />
      </div>

      {/* Live region acessibilidade */}
      <div aria-live="polite" className="sr-only">
        {isReading ? textos.acessibilidade.leituraIniciadaPerguntas : textos.acessibilidade.pararLeitura}
      </div>

      {/* Conteúdo principal */}
      <main className="a11y-page__main container" id="conteudo-principal" role="main">
        <div className="a11y-document">

          {/* Cabeçalho de leitura */}
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

          {/* Secções do documento */}
          <article className="a11y-sections">
            {documentData.map((section, index) => (
              <div
                key={index}
                className={`a11y-section ${activeParagraph === index ? 'a11y-section--active' : ''}`}
              >
                {renderContent(index)}
              </div>
            ))}
          </article>

          <hr className="a11y-divider" aria-hidden="true" />

          <p className="a11y-footer-note">
            {textos.acessibilidadePagina.notaRodape}
          </p>

        </div>
        <Outlet />
      </main>
    </div>
  );
}