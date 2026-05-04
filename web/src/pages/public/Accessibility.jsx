import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/Accessibility.css';

const documentData = [
  {
    plainText: "Declaração de Acessibilidade e Usabilidade. O Grupo 8 (Sapos) compromete-se a disponibilizar o sítio Web do sistema PRODIGI, Sistema de Gestão Hospitalar, em conformidade com o Decreto-Lei n.º 83/2018, de 19 de outubro, que transpõe a Diretiva da União Europeia relativa à acessibilidade dos sítios Web e das aplicações móveis.",
    normalJsx: (
      <>
        <h1>Declaração de Acessibilidade e Usabilidade</h1>
        <p className="intro-text">
          O <strong>Grupo 8 (Sapos)</strong> compromete-se a disponibilizar o sítio Web do sistema <strong>PRODIGI – Sistema de Gestão Hospitalar</strong>, em conformidade com o Decreto-Lei n.º 83/2018, de 19 de outubro, que transpõe a Diretiva (UE) 2016/2102 do Parlamento Europeu e do Conselho, relativa à acessibilidade dos sítios Web e das aplicações móveis.
        </p>
      </>
    )
  },
  {
    plainText: "Secção I. Estado de conformidade. O sítio Web PRODIGI do Grupo 8 está plenamente conforme para com o Decreto-Lei n.º 83/2018 de 19 de outubro.",
    normalJsx: (
      <section>
        <h2>I. Estado de conformidade</h2>
        <p>
          O sítio Web PRODIGI do Grupo 8 está plenamente conforme para com o Decreto-Lei n.º 83/2018 de 19 de outubro.
        </p>
      </section>
    )
  },
  {
    plainText: "Secção II. Elaboração da presente declaração de acessibilidade e usabilidade. Esta declaração foi atualizada a 17 de abril de 2026. De acordo com as normas vigentes, o grupo adotou os procedimentos de monitorização obrigatórios.",
    normalJsx: (
      <section>
        <h2>II. Elaboração da presente declaração de acessibilidade e usabilidade</h2>
        <p>
          Esta declaração foi atualizada a 2026-04-17. De acordo com as normas vigentes, o grupo adotou os procedimentos de monitorização obrigatórios.
        </p>
      </section>
    )
  },
  {
    plainText: "A. Avaliações automáticas levadas a efeito a 15 de abril de 2026. Ferramenta utilizada: AccessMonitor. Amostra: Páginas principais do frontend Web. Principais resultados: Foi obtido um score elevado, com a maioria das páginas em conformidade com as normas WCAG 2.1.",
    normalJsx: (
      <div className="sub-section">
        <h3>A. Avaliações automáticas levadas a efeito (2026-04-15):</h3>
        <ul>
          <li><strong>Ferramenta utilizada:</strong> AccessMonitor.</li>
          <li><strong>Amostra:</strong> Páginas principais do frontend Web (HTML5/CSS3/JS).</li>
          <li><strong>Principais resultados:</strong> Foi obtido um score elevado, com a maioria das páginas em conformidade com as normas WCAG 2.1.</li>
        </ul>
      </div>
    )
  },
  {
    plainText: "B. Avaliações manuais levadas a efeito a 10 de abril de 2026. Relatório: Checklist de Acessibilidade Funcional aplicada aos módulos SIGUI. Amostra: Ecrãs de Registo de Utente, Triagem e Internamento. Principais resultados: 100% de conformidade nas heurísticas aplicadas aos formulários e elementos de navegação.",
    normalJsx: (
      <div className="sub-section">
        <h3>B. Avaliações manuais levadas a efeito:</h3>
        <p className="date-report">(2026-04-10). Relatório: Checklist de Acessibilidade Funcional aplicada aos módulos SIGUI.</p>
        <ul>
          <li><strong>Amostra:</strong> Ecrãs de Registo de Utente, Triagem e Internamento.</li>
          <li><strong>Principais resultados:</strong> 100% de conformidade nas heurísticas aplicadas aos formulários e elementos de navegação.</li>
        </ul>
      </div>
    )
  },
  {
    plainText: "C. Testes de usabilidade com utilizadores a 20 de março de 2026. Relatório: Testes de Usabilidade Grupo 8. Caracterização dos participantes: Membros da equipa e utilizadores externos simulando os perfis de Administrativo, Médico e Enfermeiro. Tarefas e Processos: Localização de utentes, registo de sinais vitais na triagem e consulta de previsões de Inteligência Artificial. Principais resultados: O portal apresenta um nível robusto de usabilidade, facilitando a interação mesmo em cenários críticos de urgência hospitalar.",
    normalJsx: (
      <div className="sub-section">
        <h3>C. Testes de usabilidade com utilizadores:</h3>
        <p className="date-report">(2026-03-20). Relatório: Testes de Usabilidade Grupo 8.</p>
        <ul>
          <li><strong>Caracterização dos participantes:</strong> Membros da equipa e utilizadores externos simulando os perfis de Administrativo, Médico e Enfermeiro.</li>
          <li><strong>Tarefas/Processos:</strong> Localização de utentes, registo de sinais vitais na triagem e consulta de previsões de IA.</li>
          <li><strong>Principais resultados:</strong> O portal apresenta um nível robusto de usabilidade, facilitando a interação mesmo em cenários críticos de urgência hospitalar.</li>
        </ul>
      </div>
    )
  },
  {
    plainText: "Secção III. Contacto e solicitação de informação relativa ao sítio Web. Para contactar, enviar sugestões ou solicitar informação adicional relativamente às funcionalidades do sistema PRODIGI desenvolvido pelo Grupo 8, utilize o contacto dos responsáveis: João Martins, João Sacramento, Luís Franco e Pedro Antunes. Correio eletrónico: grupo 8 underscore prodigi arroba exemplo ponto pt.",
    normalJsx: (
      <section>
        <h2>III. Contacto e solicitação de informação relativa ao sítio Web</h2>
        <p>
          Para contactar, enviar sugestões ou solicitar informação adicional relativamente às funcionalidades do sistema PRODIGI desenvolvido pelo Grupo 8, utilize o contacto dos responsáveis:
        </p>
        <ul className="contact-list">
          <li><strong>Responsáveis:</strong> João Martins, João Sacramento, Luís Franco e Pedro Antunes.</li>
          <li><strong>Correio eletrónico:</strong> <a href="mailto:grupo8_prodigi@exemplo.pt">grupo8_prodigi@exemplo.pt</a> (ou o e-mail institucional do vosso curso).</li>
        </ul>
      </section>
    )
  },
  {
    plainText: "Secção IV. Outras evidências. O Grupo 8 implementou uma arquitetura modular no backend e frontend para garantir que futuras atualizações de acessibilidade possam ser integradas sem comprometer a escalabilidade do sistema.",
    normalJsx: (
      <section>
        <h2>IV. Outras evidências</h2>
        <p>
          O Grupo 8 implementou uma arquitetura modular no backend (FastAPI) e frontend para garantir que futuras atualizações de acessibilidade possam ser integradas sem comprometer a escalabilidade do sistema.
        </p>
      </section>
    )
  },
  {
    plainText: "Secção V. Denúncia de situações de discriminação. Sempre que uma pessoa com deficiência seja objeto de um tratamento menos favorável que consubstancie uma prática discriminatória, pode apresentar queixa nos termos da legislação vigente. O Instituto Nacional para a Reabilitação disponibiliza os canais competentes para o efeito.",
    normalJsx: (
      <section>
        <h2>V. Denúncia de situações de discriminação</h2>
        <p>
          Sempre que uma pessoa com deficiência seja objeto de um tratamento menos favorável que consubstancie uma prática discriminatória, pode apresentar queixa nos termos da legislação vigente. O Instituto Nacional para a Reabilitação (INR, I.P.) disponibiliza os canais competentes para o efeito.
        </p>
      </section>
    )
  }
];

export default function Accessibility() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Calcula o tempo de leitura (Média de 200 palavras por minuto)
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

    // Dispara a cada nova palavra para aplicar o cursor
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

    utterance.onend = () => speakParagraph(index + 1, synth);
    utterance.onerror = () => resetReadingState();

    synth.speak(utterance);
  };

  // Renderiza o conteúdo. Se for a secção atual que está a ser lida, extrai apenas o texto simples
  // e ilumina a palavra, mas envolve-o num bloco visualmente distinto para não estragar as listas do HTML.
  const renderContent = (index) => {
    const data = documentData[index];

    if (!isReading || activeParagraph !== index) {
      return data.normalJsx;
    }

    // Oculta visualmente o JSX normal e mostra a versão do "Teleponto/Karaoke"
    const before = data.plainText.substring(0, charIndex);
    const highlightedWord = data.plainText.substring(charIndex, charIndex + charLength);
    const after = data.plainText.substring(charIndex + charLength);

    return (
      <div className="reading-teleprompter">
        {before}
        <span className="word-highlight">{highlightedWord}</span>
        {after}
      </div>
    );
  };

  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: 'Acessibilidade', path: '/acessibilidade' }
  ];

  return (
    <div className="accessibility-page-wrapper">
      
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      <div aria-live="polite" className="sr-only">
        {isReading ? 'Leitura em voz alta iniciada. O texto lido aparecerá destacado.' : 'Leitura em voz alta parada.'}
      </div>

      <main className="accessibility-main-content container">
        <div className="accessibility-document">
          
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

          <div className="document-sections">
            {documentData.map((section, index) => (
              <div key={index} className={`section-wrapper ${activeParagraph === index ? 'is-active-reading' : ''}`}>
                {renderContent(index)}
              </div>
            ))}
          </div>

          <hr className="accessibility-divider" />
          
          <p className="accessibility-footer-note">
            A presente Declaração foi criada para o Projeto Integrador PRODIGI (Grupo 8 - 2026) em conformidade com o Decreto-Lei n.º 83/2018, de 19 de outubro.
          </p>
        </div>

        <Outlet />
      </main>
    </div>
  );
}