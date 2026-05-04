import React, { useState, useEffect } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/PrivacyPolicy.css';

// Estrutura que separa o texto falado (plainText) do texto visível (normalJsx)
const documentData = [
  {
    plainText: "Política de Privacidade SIAGUH. Secção 1. Enquadramento Geral. Esta Política de Privacidade aplica-se ao SIAGUH, incluindo o portal web, aplicação móvel Android e sistemas de triagem, desenvolvidos pelo Grupo 8, no âmbito do Projeto Integrador de 2026. O sistema é concebido para a gestão eficiente de urgências e internamentos, garantindo a proteção de dados sensíveis através de medidas técnicas e organizativas adequadas ao risco clínico.",
    normalJsx: (
      <>
        <h1>Política de Privacidade — SIAGUH</h1>
        <section>
          <h2>1. Enquadramento Geral</h2>
          <p>
            Esta Política de Privacidade aplica-se ao <strong>SIAGUH</strong>, incluindo o portal web, aplicação móvel Android e sistemas de triagem, desenvolvidos pelo Grupo 8, no âmbito do Projeto Integrador de 2026. O sistema é concebido para a gestão eficiente de urgências e internamentos, garantindo a proteção de dados sensíveis através de medidas técnicas e organizativas adequadas ao risco clínico.
          </p>
        </section>
      </>
    )
  },
  {
    plainText: "Secção 2. Responsável pelo Tratamento e Encarregado de Proteção de Dados. A entidade responsável pelo tratamento de dados é o Grupo 8, com supervisão académica no âmbito do projeto PRODIGI SIAGUH. Para questões sobre privacidade ou exercício de direitos, os utilizadores podem contactar o Encarregado de Proteção de Dados do grupo através do e-mail: d p o underscore grupo 8 arroba exemplo ponto pt.",
    normalJsx: (
      <section>
        <h2>2. Responsável pelo Tratamento e Encarregado de Proteção de Dados</h2>
        <p>
          A entidade responsável pelo tratamento de dados é o Grupo 8, com supervisão académica no âmbito do projeto PRODIGI/SIAGUH. Para questões sobre privacidade ou exercício de direitos, os utilizadores podem contactar o Encarregado de Proteção de Dados do grupo através do e-mail: <a href="mailto:dpo_grupo8@exemplo.pt">dpo_grupo8@exemplo.pt</a>.
        </p>
      </section>
    )
  },
  {
    plainText: "Secção 3. Dados Pessoais Tratados. O SIAGUH recolhe e trata dados necessários para a operação hospitalar segura: Dados Demográficos, como Nome, data de nascimento, N I F, número de utente e contactos. Dados de Saúde, como Sintomas, antecedentes clínicos, registos de triagem, atos médicos e prescrições. E Dados de Inteligência Artificial, que são os Resultados do processamento de linguagem natural e algoritmos de previsão para sugestão de cor de triagem e tempo de espera.",
    normalJsx: (
      <section>
        <h2>3. Dados Pessoais Tratados</h2>
        <p>O SIAGUH recolhe e trata dados necessários para a operação hospitalar segura:</p>
        <ul>
          <li><strong>Dados Demográficos:</strong> Nome, data de nascimento, NIF, número de utente e contactos.</li>
          <li><strong>Dados de Saúde:</strong> Sintomas, antecedentes clínicos, registos de triagem (sinais vitais), atos médicos e prescrições.</li>
          <li><strong>Dados de IA:</strong> Resultados do processamento de linguagem natural e algoritmos de previsão para sugestão de cor de triagem e tempo de espera.</li>
        </ul>
      </section>
    )
  },
  {
    plainText: "Secção 4. Finalidades e Fundamentos Jurídicos. O tratamento de dados fundamenta-se na gestão e prestação de cuidados de saúde e no consentimento do titular, para: Triagem Clínica, com utilização de IA para sugestão da cor da pulseira de Manchester; Apoio à Decisão, para previsão de tempos de espera e gestão de camas; e Segurança, com autenticação de profissionais e auditoria de acessos para prevenção de fraude.",
    normalJsx: (
      <section>
        <h2>4. Finalidades e Fundamentos Jurídicos</h2>
        <p>O tratamento de dados no SIAGUH fundamenta-se na gestão e prestação de cuidados de saúde e no consentimento do titular:</p>
        <ul>
          <li><strong>Triagem Clínica:</strong> Utilização de IA para sugestão da cor da pulseira (Manchester).</li>
          <li><strong>Apoio à Decisão:</strong> Previsão de tempos de espera e gestão de camas de internamento.</li>
          <li><strong>Segurança:</strong> Autenticação de profissionais via JWT e auditoria de acessos para prevenção de fraude.</li>
        </ul>
      </section>
    )
  },
  {
    plainText: "Secção 5. Utilização de Inteligência Artificial no SIAGUH. O sistema integra IA para apoio à triagem. Informamos que a Inteligência Artificial não decide de forma autónoma, servindo apenas como suporte à decisão do profissional de saúde. O utilizador humano pode sempre validar, corrigir ou ignorar a sugestão. Os dados de IA são utilizados unicamente para melhorar a precisão do atendimento e reduzir o risco clínico.",
    normalJsx: (
      <section>
        <h2>5. Utilização de Inteligência Artificial no SIAGUH</h2>
        <p>O SIAGUH integra um sistema de IA para apoio à triagem. Informamos que:</p>
        <div className="highlight-box">
          <ul>
            <li>A IA <strong>não decide de forma autónoma</strong>, servindo apenas como suporte à decisão do profissional de saúde (Enfermeiro/Médico).</li>
            <li>O utilizador humano pode sempre validar, corrigir ou ignorar a sugestão da IA.</li>
            <li>Os dados de IA são utilizados para melhorar a precisão do atendimento e reduzir o risco clínico.</li>
          </ul>
        </div>
      </section>
    )
  },
  {
    plainText: "Secção 6. Prazo de Conservação e Comunicação. Conservação: Os dados são mantidos apenas pelo período estritamente necessário à prestação de cuidados de saúde e cumprimento de obrigações legais de arquivo clínico. Comunicação: Os dados podem ser partilhados entre profissionais do hospital e, em casos de emergência, com entidades externas, como o INEM, ou por ordem judicial.",
    normalJsx: (
      <section>
        <h2>6. Prazo de Conservação e Comunicação</h2>
        <ul>
          <li><strong>Conservação:</strong> Os dados são mantidos apenas pelo período estritamente necessário à prestação de cuidados de saúde e cumprimento de obrigações legais de arquivo clínico.</li>
          <li><strong>Comunicação:</strong> Os dados podem ser partilhados entre profissionais do hospital (médicos/enfermeiros) e, em casos de emergência, com entidades externas (INEM) ou por ordem judicial.</li>
        </ul>
      </section>
    )
  },
  {
    plainText: "Secção 7. Direitos dos Titulares. Os utentes e profissionais gozam dos direitos previstos no Regulamento Geral sobre a Proteção de Dados, nomeadamente: Acesso, Retificação e Apagamento do historial clínico. Oposição a Decisões Automatizadas, o direito de solicitar que uma triagem seja revista exclusivamente por um humano. E Portabilidade, para receber os dados em formato estruturado.",
    normalJsx: (
      <section>
        <h2>7. Direitos dos Titulares</h2>
        <p>Os utentes e profissionais gozam dos direitos previstos no RGPD:</p>
        <ul>
          <li><strong>Acesso, Retificação e Apagamento:</strong> (quando aplicável ao historial clínico).</li>
          <li><strong>Oposição a Decisões Automatizadas:</strong> O direito de solicitar que uma triagem seja revista exclusivamente por um humano.</li>
          <li><strong>Portabilidade:</strong> Receber os dados em formato estruturado (JSON/CSV).</li>
        </ul>
      </section>
    )
  },
  {
    plainText: "Secção 8. Atualização e Foro. Esta política foi atualizada em 17 de abril de 2026. Qualquer litígio será dirimido nos tribunais competentes da comarca de Lisboa, regendo-se pela lei portuguesa.",
    normalJsx: (
      <section>
        <h2>8. Atualização e Foro</h2>
        <p>
          Esta política foi atualizada em 17 de abril de 2026. Qualquer litígio será dirimido nos tribunais competentes da comarca de Lisboa, regendo-se pela lei portuguesa.
        </p>
      </section>
    )
  }
];

export default function PrivacyPolicy() {
  const [isReading, setIsReading] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Calcula tempo médio de leitura (200 palavras por minuto)
  const totalWords = documentData.reduce((acc, p) => acc + p.plainText.split(/\s+/).length, 0);
  const readingTime = Math.ceil(totalWords / 200);

  // Limpa o synth de voz caso o utilizador mude de página a meio da leitura
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

    // Dispara a cada nova palavra lida (o "cursor")
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

  const renderContent = (index) => {
    const data = documentData[index];

    // Mostra o visual original com listas e negritos se NÃO estiver a ser lido
    if (!isReading || activeParagraph !== index) {
      return data.normalJsx;
    }

    // Mostra o teleponto palavra-a-palavra se ESTIVER a ser lido
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
    { name: 'Política de Privacidade', path: '/politica-privacidade' }
  ];

  return (
    <div className="privacy-page-wrapper">
      
      <div className="container" style={{ paddingTop: '1.5rem', marginBottom: '-1.5rem' }}>
        <Breadcrumbs items={breadcrumbsLinks} />
      </div>

      {/* Região invisível para acessibilidade */}
      <div aria-live="polite" className="sr-only">
        {isReading ? 'Leitura em voz alta iniciada. O texto lido aparecerá destacado.' : 'Leitura em voz alta parada.'}
      </div>

      <main className="privacy-main-content container">
        <div className="privacy-document">
          
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

          <hr className="privacy-divider" />
          
          <p className="privacy-footer-note">
            <strong>Nota:</strong> Este sistema foi desenvolvido para fins académicos pelo Grupo 8 (João Martins, João Sacramento, Luís Franco e Pedro Antunes).
          </p>
        </div>
      </main>
    </div>
  );
}