import React from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/PrivacyPolicy.css';

export default function PrivacyPolicy() {

  // 1. Define o caminho das migalhas de pão para esta página
  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: 'Política de Privacidade', path: '/politica-privacidade' }
  ];

  return (
    <div className="privacy-page-wrapper">
      
      {/* 2. Coloca o componente Breadcrumbs no topo, fora do container branco do documento */}
      <Breadcrumbs items={breadcrumbsLinks} />

      <main className="privacy-main-content">
        <div className="privacy-document">
          <h1>Política de Privacidade — SIAGUH</h1>
          
          <section>
            <h2>1. Enquadramento Geral</h2>
            <p>
              Esta Política de Privacidade aplica-se ao <strong>SIAGUH</strong>, incluindo o portal web, aplicação móvel Android e sistemas de triagem, desenvolvidos pelo Grupo 8, no âmbito do Projeto Integrador de 2026. O sistema é concebido para a gestão eficiente de urgências e internamentos, garantindo a proteção de dados sensíveis através de medidas técnicas e organizativas adequadas ao risco clínico.
            </p>
          </section>

          <section>
            <h2>2. Responsável pelo Tratamento e Encarregado de Proteção de Dados</h2>
            <p>
              A entidade responsável pelo tratamento de dados é o Grupo 8, com supervisão académica no âmbito do projeto PRODIGI/SIAGUH. Para questões sobre privacidade ou exercício de direitos, os utilizadores podem contactar o Encarregado de Proteção de Dados do grupo através do e-mail: <a href="mailto:dpo_grupo8@exemplo.pt">dpo_grupo8@exemplo.pt</a>.
            </p>
          </section>

          <section>
            <h2>3. Dados Pessoais Tratados</h2>
            <p>O SIAGUH recolhe e trata dados necessários para a operação hospitalar segura:</p>
            <ul>
              <li><strong>Dados Demográficos:</strong> Nome, data de nascimento, NIF, número de utente e contactos.</li>
              <li><strong>Dados de Saúde:</strong> Sintomas, antecedentes clínicos, registos de triagem (sinais vitais), atos médicos e prescrições.</li>
              <li><strong>Dados de IA:</strong> Resultados do processamento de linguagem natural e algoritmos de previsão para sugestão de cor de triagem e tempo de espera.</li>
            </ul>
          </section>

          <section>
            <h2>4. Finalidades e Fundamentos Jurídicos</h2>
            <p>O tratamento de dados no SIAGUH fundamenta-se na gestão e prestação de cuidados de saúde e no consentimento do titular:</p>
            <ul>
              <li><strong>Triagem Clínica:</strong> Utilização de IA para sugestão da cor da pulseira (Manchester).</li>
              <li><strong>Apoio à Decisão:</strong> Previsão de tempos de espera e gestão de camas de internamento.</li>
              <li><strong>Segurança:</strong> Autenticação de profissionais via JWT e auditoria de acessos para prevenção de fraude.</li>
            </ul>
          </section>

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

          <section>
            <h2>6. Prazo de Conservação e Comunicação</h2>
            <ul>
              <li><strong>Conservação:</strong> Os dados são mantidos apenas pelo período estritamente necessário à prestação de cuidados de saúde e cumprimento de obrigações legais de arquivo clínico.</li>
              <li><strong>Comunicação:</strong> Os dados podem ser partilhados entre profissionais do hospital (médicos/enfermeiros) e, em casos de emergência, com entidades externas (INEM) ou por ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2>7. Direitos dos Titulares</h2>
            <p>Os utentes e profissionais gozam dos direitos previstos no RGPD:</p>
            <ul>
              <li><strong>Acesso, Retificação e Apagamento:</strong> (quando aplicável ao historial clínico).</li>
              <li><strong>Oposição a Decisões Automatizadas:</strong> O direito de solicitar que uma triagem seja revista exclusivamente por um humano.</li>
              <li><strong>Portabilidade:</strong> Receber os dados em formato estruturado (JSON/CSV).</li>
            </ul>
          </section>

          <section>
            <h2>8. Atualização e Foro</h2>
            <p>
              Esta política foi atualizada em 17 de abril de 2026. Qualquer litígio será dirimido nos tribunais competentes da comarca de Lisboa, regendo-se pela lei portuguesa.
            </p>
          </section>

          <hr className="privacy-divider" />
          
          <p className="privacy-footer-note">
            <strong>Nota:</strong> Este sistema foi desenvolvido para fins académicos pelo Grupo 8 (João Martins, João Sacramento, Luís Franco e Pedro Antunes).
          </p>
        </div>
      </main>
    </div>
  );
}