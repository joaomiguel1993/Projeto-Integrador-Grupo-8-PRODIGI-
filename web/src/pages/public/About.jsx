import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import { TEXTOS_PT } from '../../locals/pt';
import '../../styles/About.css'; 
import logo from '../../imagens/logo.png';

/**
 * @file SobreNos.jsx
 * @description Página institucional com leitor de voz e realce de palavras.
 * 
 * @component
 * @returns {JSX.Element}
 */
export default function SobreNos() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  const paragraphsData = [
    {
      plainText: TEXTOS_PT.sobreNos.p1Texto,
      normalJsx: <>O <strong>Projeto Integrador</strong> surge como o culminar estratégico e técnico de um percurso de exigência e inovação, materializando-se no sistema <strong>PRODIGI</strong>. Este software de Gestão Hospitalar, focado na otimização de Urgências e Internamentos, representa a fusão entre a arquitetura de sistemas robustos e o apoio à decisão clínica através de Inteligência Artificial. Mais do que uma simples ferramenta digital, o PRODIGI é o resultado final de meses de dedicação, onde cada linha de código foi pensada para melhorar a eficiência do atendimento e a segurança dos dados de saúde.</>
    },
    {
      plainText: TEXTOS_PT.sobreNos.p2Texto,
      normalJsx: <>Este projeto uniu quatro percursos e visões num só grupo de trabalho, o <strong>Grupo 8</strong>, composto por João Martins, João Sacramento, Luís Franco e Pedro Antunes. Ao longo do desenvolvimento desta solução, o que começou por ser uma colaboração académica transformou-se num ambiente de forte companheirismo e de uma amizade sólida que ultrapassou os limites do laboratório. Juntos, estes quatro integrantes enfrentaram desafios técnicos complexos, desde a estruturação da base de dados até à implementação de modelos preditivos, mantendo sempre a união como o seu pilar principal.</>
    },
    {
      plainText: TEXTOS_PT.sobreNos.p3Texto,
      normalJsx: <>Refletindo o espírito de união e a boa disposição que caracterizou cada reunião e sessão de trabalho, o grupo acabou por se autoapelidar, em tom de brincadeira, de <span className="sapo-emoji">"Sapos" 🐸</span>. Este nome de código interno simboliza não só a agilidade e a capacidade de adaptação demonstrada perante os obstáculos, mas também o laço afetivo que se criou entre todos. O PRODIGI é, por isso, mais do que um sistema tecnológico de excelência; é a prova viva de que o sucesso de um projeto integrador reside na harmonia e na cumplicidade daqueles que o constroem.</>
    }
  ];

  const totalWords = paragraphsData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
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
    if (index >= paragraphsData.length) {
      resetReadingState();
      return;
    }
    setActiveParagraph(index);
    const utterance = new SpeechSynthesisUtterance(paragraphsData[index].plainText);
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

  const renderParagraphContent = (index) => {
    const data = paragraphsData[index];
    if (!isReading || activeParagraph !== index) return data.normalJsx;

    const before = data.plainText.substring(0, charIndex);
    const highlightedWord = data.plainText.substring(charIndex, charIndex + charLength);
    const after = data.plainText.substring(charIndex + charLength);

    return (
      <>
        {before}
        <span className="word-highlight" aria-hidden="true">{highlightedWord}</span>
        {after}
      </>
    );
  };

  return (
    <div className="sobre-nos-container">
      <div className="hero-background" role="region" aria-label={TEXTOS_PT.sobreNos.ariaHero}>
        <div className="container">
          <div className="hero-breadcrumbs">
             <Breadcrumbs items={[{ name: TEXTOS_PT.geral.inicio, path: '/' }, { name: TEXTOS_PT.sobreNos.tituloBreadcrumb, path: '/sobre-nos' }]} />
          </div>
          <section className="sobre-nos-hero">
            <h1>{TEXTOS_PT.sobreNos.heroTituloPrincipal} <span className="highlight-title">{TEXTOS_PT.sobreNos.heroTituloDestaque}</span></h1>
            <p className="hero-subtitle">{TEXTOS_PT.sobreNos.heroSubtitulo}</p>
          </section>
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? TEXTOS_PT.acessibilidade.iniciarLeitura : TEXTOS_PT.acessibilidade.pararLeitura}
      </div>

      <main className="container" id="conteudo-principal">
        <section className="sobre-nos-content">
          <div className="text-box">
            <div className="read-aloud-header">
              <span className="reading-time">
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

            <p className={`normal-text ${activeParagraph === 0 ? 'reading-highlight' : ''}`}>{renderParagraphContent(0)}</p>
            <p className={`normal-text ${activeParagraph === 1 ? 'reading-highlight' : ''}`}>{renderParagraphContent(1)}</p>
            <p className={`highlight-text ${activeParagraph === 2 ? 'reading-highlight-special' : ''}`}>{renderParagraphContent(2)}</p>
          </div>
        </section>

        <section className="equipa-section">
          <h2>{TEXTOS_PT.sobreNos.tituloEquipa}</h2>
          <div className="grupo-imagem-container">
            <img src={logo} alt={TEXTOS_PT.sobreNos.altFotoEquipa} className="imagem-grupo" />
          </div>
          <div className="membros-lista-container">
            <div className="membros-lista" role="list" aria-label="Membros da equipa">
              <span className="membro-nome" role="listitem">João Martins</span>
              <span className="separador" aria-hidden="true">•</span>
              <span className="membro-nome" role="listitem">João Sacramento</span>
              <span className="separador" aria-hidden="true">•</span>
              <span className="membro-nome" role="listitem">Luís Franco</span>
              <span className="separador" aria-hidden="true">•</span>
              <span className="membro-nome" role="listitem">Pedro Antunes</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}