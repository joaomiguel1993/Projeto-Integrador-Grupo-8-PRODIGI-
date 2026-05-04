import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/About.css'; 
import logo from '../../imagens/logo.png';

// Estruturamos os dados para separar o texto limpo (para a voz) do JSX (para a visualização normal)
const paragraphsData = [
  {
    plainText: "O Projeto Integrador surge como o culminar estratégico e técnico de um percurso de exigência e inovação, materializando-se no sistema PRODIGI. Este software de Gestão Hospitalar, focado na otimização de Urgências e Internamentos, representa a fusão entre a arquitetura de sistemas robustos e o apoio à decisão clínica através de Inteligência Artificial. Mais do que uma simples ferramenta digital, o PRODIGI é o resultado final de meses de dedicação, onde cada linha de código foi pensada para melhorar a eficiência do atendimento e a segurança dos dados de saúde.",
    normalJsx: <>O <strong>Projeto Integrador</strong> surge como o culminar estratégico e técnico de um percurso de exigência e inovação, materializando-se no sistema <strong>PRODIGI</strong>. Este software de Gestão Hospitalar, focado na otimização de Urgências e Internamentos, representa a fusão entre a arquitetura de sistemas robustos e o apoio à decisão clínica através de Inteligência Artificial. Mais do que uma simples ferramenta digital, o PRODIGI é o resultado final de meses de dedicação, onde cada linha de código foi pensada para melhorar a eficiência do atendimento e a segurança dos dados de saúde.</>
  },
  {
    plainText: "Este projeto uniu quatro percursos e visões num só grupo de trabalho, o Grupo 8, composto por João Martins, João Sacramento, Luís Franco e Pedro Antunes. Ao longo do desenvolvimento desta solução, o que começou por ser uma colaboração académica transformou-se num ambiente de forte companheirismo e de uma amizade sólida que ultrapassou os limites do laboratório. Juntos, estes quatro integrantes enfrentaram desafios técnicos complexos, desde a estruturação da base de dados até à implementação de modelos preditivos, mantendo sempre a união como o seu pilar principal.",
    normalJsx: <>Este projeto uniu quatro percursos e visões num só grupo de trabalho, o <strong>Grupo 8</strong>, composto por João Martins, João Sacramento, Luís Franco e Pedro Antunes. Ao longo do desenvolvimento desta solução, o que começou por ser uma colaboração académica transformou-se num ambiente de forte companheirismo e de uma amizade sólida que ultrapassou os limites do laboratório. Juntos, estes quatro integrantes enfrentaram desafios técnicos complexos, desde a estruturação da base de dados até à implementação de modelos preditivos, mantendo sempre a união como o seu pilar principal.</>
  },
  {
    plainText: "Refletindo o espírito de união e a boa disposição que caracterizou cada reunião e sessão de trabalho, o grupo acabou por se autoapelidar, em tom de brincadeira, de Sapos. Este nome de código interno simboliza não só a agilidade e a capacidade de adaptação demonstrada perante os obstáculos, mas também o laço afetivo que se criou entre todos. O PRODIGI é, por isso, mais do que um sistema tecnológico de excelência; é a prova viva de que o sucesso de um projeto integrador reside na harmonia e na cumplicidade daqueles que o constroem.",
    normalJsx: <>Refletindo o espírito de união e a boa disposição que caracterizou cada reunião e sessão de trabalho, o grupo acabou por se autoapelidar, em tom de brincadeira, de <span className="sapo-emoji">"Sapos" 🐸</span>. Este nome de código interno simboliza não só a agilidade e a capacidade de adaptação demonstrada perante os obstáculos, mas também o laço afetivo que se criou entre todos. O PRODIGI é, por isso, mais do que um sistema tecnológico de excelência; é a prova viva de que o sucesso de um projeto integrador reside na harmonia e na cumplicidade daqueles que o constroem.</>
  }
];

export default function SobreNos() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Calcula o tempo de leitura (Média de 200 palavras por minuto)
  const totalWords = paragraphsData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  // Para a leitura caso o utilizador saia da página
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
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
    setCharIndex(0);
    setCharLength(0);

    const utterance = new SpeechSynthesisUtterance(paragraphsData[index].plainText);
    utterance.lang = 'pt-PT';
    utterance.rate = 0.95;

    // EVENTO MÁGICO: Dispara a cada nova palavra lida!
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCharIndex(event.charIndex);
        // Alguns navegadores não dão o charLength, calculamos a palavra seguinte se falhar
        let length = event.charLength;
        if (!length) {
          const match = event.target.text.substring(event.charIndex).match(/^\S+/);
          length = match ? match[0].length : 1;
        }
        setCharLength(length);
      }
    };

    utterance.onend = () => speakParagraph(index + 1, synth);
    utterance.onerror = () => resetReadingState();

    synth.speak(utterance);
  };

  // Função que decide o que renderizar: O texto original ou o texto com a palavra iluminada
  const renderParagraphContent = (index) => {
    const data = paragraphsData[index];

    // Se NÃO estiver a ler ESTE parágrafo, mostra o texto normal (com negritos e emojis)
    if (!isReading || activeParagraph !== index) {
      return data.normalJsx;
    }

    // Se ESTIVER a ler ESTE parágrafo, divide o texto em 3 partes para iluminar a palavra
    const before = data.plainText.substring(0, charIndex);
    const highlightedWord = data.plainText.substring(charIndex, charIndex + charLength);
    const after = data.plainText.substring(charIndex + charLength);

    return (
      <>
        {before}
        <span className="word-highlight">{highlightedWord}</span>
        {after}
      </>
    );
  };

  const breadcrumbsItems = [
    { name: 'Início', path: '/' },
    { name: 'Sobre Nós', path: '/sobre-nos' }
  ];

  return (
    <div className="sobre-nos-container">
      
      {/* Container do Cabeçalho Verde (Hero) */}
      <div className="hero-background">
        <div className="container">
          {/* Envolvemos as migalhas numa classe para lhes retirar o fundo branco no CSS */}
          <div className="hero-breadcrumbs">
             <Breadcrumbs items={breadcrumbsItems} />
          </div>
          <section className="sobre-nos-hero">
            <h1>Sobre o Projeto <span className="highlight-title">Integrador</span></h1>
            <p className="hero-subtitle">Grupo 8: Inovação, Companheirismo e Excelência Técnica.</p>
          </section>
        </div>
      </div>

      {/* Região invisível para Leitores de Ecrã (Acessibilidade) */}
      <div aria-live="polite" className="sr-only">
        {isReading ? 'Leitura em voz alta iniciada.' : 'Leitura em voz alta parada.'}
      </div>

      <main className="container">
        {/* Cartão Branco Sobreposto */}
        <section className="sobre-nos-content">
          <div className="text-box">
            
            {/* Controlos do Leitor de Voz + Tempo de Leitura */}
            <div className="read-aloud-header">
              <span className="reading-time">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ~{readingTime} min de leitura
              </span>
              
              <button 
                type="button"
                className={`btn-read-aloud ${isReading ? 'is-reading' : ''}`}
                onClick={toggleReading}
                aria-pressed={isReading}
                aria-label={isReading ? "Parar leitura em voz alta" : "Ouvir o texto desta página"}
              >
                <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {isReading ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
                {isReading ? "Parar Leitura" : "Ouvir Texto"}
              </button>
            </div>

            <p className={`normal-text ${activeParagraph === 0 ? 'reading-highlight' : ''}`}>
              {renderParagraphContent(0)}
            </p>

            <p className={`normal-text ${activeParagraph === 1 ? 'reading-highlight' : ''}`}>
              {renderParagraphContent(1)}
            </p>

            <p className={`highlight-text ${activeParagraph === 2 ? 'reading-highlight-special' : ''}`}>
              {renderParagraphContent(2)}
            </p>
          </div>
        </section>

        {/* Secção da Fotografia de Grupo */}
        <section className="equipa-section">
          <h2>A Equipa por trás do Projeto SIAGUH</h2>
          
          <div className="grupo-imagem-container">
            <img src={logo} alt="Fotografia do Grupo 8 - Os Sapos em ambiente hospitalar animado" className="imagem-grupo" />
          </div>

          <div className="membros-lista-container">
            <div className="membros-lista">
              <span className="membro-nome">João Martins</span>
              <span className="separador">•</span>
              <span className="membro-nome">João Sacramento</span>
              <span className="separador">•</span>
              <span className="membro-nome">Luís Franco</span>
              <span className="separador">•</span>
              <span className="membro-nome">Pedro Antunes</span>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}