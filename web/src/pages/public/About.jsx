// src/pages/public/About.jsx
import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/main.css';
import logo from '../../imagens/logo.png';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SobreNos() {
  const { textos, idioma } = useLanguage();
  const [isReading,       setIsReading]       = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex,       setCharIndex]       = useState(0);
  const [charLength,      setCharLength]      = useState(0);

  const paragraphsData = [
    {
      id: 0,
      plainText: textos.sobreNos.p1Texto,
      renderNormal: () => {
        const parts = textos.sobreNos.p1Texto.split(/(Projeto Integrador|Capstone Project|PRODIGI)/g);
        return (
          <>
            {parts.map((part, i) =>
              ['Projeto Integrador', 'Capstone Project', 'PRODIGI'].includes(part)
                ? <strong key={i}>{part}</strong>
                : part
            )}
          </>
        );
      },
    },
    {
      id: 1,
      plainText: textos.sobreNos.p2Texto,
      renderNormal: () => {
        const parts = textos.sobreNos.p2Texto.split(/(Grupo 8|Group 8)/g);
        return (
          <>
            {parts.map((part, i) =>
              ['Grupo 8', 'Group 8'].includes(part)
                ? <strong key={i}>{part}</strong>
                : part
            )}
          </>
        );
      },
    },
    {
      id: 2,
      plainText: textos.sobreNos.p3Texto,
      renderNormal: () => {
        const parts = textos.sobreNos.p3Texto.split(/(Sapos)/g);
        return (
          <>
            {parts.map((part, i) =>
              part === 'Sapos'
                ? <span key={i} className="sapo-emoji">"{part}" 🐸</span>
                : part
            )}
          </>
        );
      },
    },
  ];

  const totalWords  = paragraphsData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
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
    if (index >= paragraphsData.length) { resetReadingState(); return; }
    setActiveParagraph(index);
    const utterance = new SpeechSynthesisUtterance(paragraphsData[index].plainText);
    utterance.lang = idioma === 'pt' ? 'pt-PT' : 'en-US';
    utterance.rate = 0.95;
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

  const renderReadingContent = (index) => {
    const { plainText } = paragraphsData[index];
    return (
      <>
        {plainText.substring(0, charIndex)}
        <span className="word-highlight" aria-hidden="true">
          {plainText.substring(charIndex, charIndex + charLength)}
        </span>
        {plainText.substring(charIndex + charLength)}
      </>
    );
  };

  return (
    <div className="sobre-nos-container">

      {/* ── HERO ── */}
      <div className="hero-background" role="region" aria-label={textos.sobreNos.ariaHero}>
        <div className="container">
          <div className="hero-breadcrumbs">
            <Breadcrumbs items={[
              { name: textos.geral.inicio,                  path: '/'          },
              { name: textos.sobreNos.tituloBreadcrumb,     path: '/sobre-nos' },
            ]} />
          </div>

          <section className="page-hero">
            <h1 className="page-hero__title">
              {textos.sobreNos.heroTituloPrincipal}{' '}
              <span className="highlight-title">{textos.sobreNos.heroTituloDestaque}</span>
            </h1>
            <p className="page-hero__subtitle">{textos.sobreNos.heroSubtitulo}</p>
          </section>
        </div>
      </div>

      {/* Acessibilidade — live region */}
      <div aria-live="polite" className="sr-only">
        {isReading ? textos.acessibilidade.iniciarLeitura : textos.acessibilidade.pararLeitura}
      </div>

      {/* ── CONTEÚDO ── */}
      <main className="container" id="conteudo-principal">

        {/* Texto + leitura em voz alta */}
        <section className="sobre-nos-content">
          <div className="text-box">

            <div className="read-aloud-header">
              <span className="reading-time">
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

            {paragraphsData.map((p, idx) => (
              <p key={idx} className={`normal-text ${activeParagraph === idx ? 'reading-highlight' : ''}`}>
                {isReading && activeParagraph === idx
                  ? renderReadingContent(idx)
                  : p.renderNormal()
                }
              </p>
            ))}

          </div>
        </section>

        {/* Equipa */}
        <section className="equipa-section">
          <h2>{textos.sobreNos.tituloEquipa}</h2>

          <div className="grupo-imagem-container">
            <img src={logo} alt={textos.sobreNos.altFotoEquipa} className="imagem-grupo" />
          </div>

          <div className="membros-lista-container">
            <div className="membros-lista" role="list" aria-label="Membros da equipa">
              {['João Martins', 'João Sacramento', 'Luís Franco', 'Pedro Antunes'].map((nome, i, arr) => (
                <React.Fragment key={nome}>
                  <span className="membro-nome" role="listitem">{nome}</span>
                  {i < arr.length - 1 && <span className="separador" aria-hidden="true">•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}