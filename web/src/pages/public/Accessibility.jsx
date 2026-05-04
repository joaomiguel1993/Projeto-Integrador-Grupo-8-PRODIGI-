import React from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/Accessibility.css';

export default function Accessibility() {
  
  // 1. Define o caminho das migalhas de pão para esta página
  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: 'Acessibilidade', path: '/acessibilidade' }
  ];

  return (
    <div className="accessibility-page-wrapper">
      
      {/* 2. Coloca o componente Breadcrumbs logo no topo da página */}
      <Breadcrumbs items={breadcrumbsLinks} />

      {/* Conteúdo Principal */}
      <main className="accessibility-main-content">
        <div className="accessibility-document">
          <h1>Declaração de Acessibilidade e Usabilidade</h1>
          
          <p className="intro-text">
            O <strong>Grupo 8 (Sapos)</strong> compromete-se a disponibilizar o sítio Web do sistema <strong>PRODIGI – Sistema de Gestão Hospitalar</strong>, em conformidade com o Decreto-Lei n.º 83/2018, de 19 de outubro, que transpõe a Diretiva (UE) 2016/2102 do Parlamento Europeu e do Conselho, relativa à acessibilidade dos sítios Web e das aplicações móveis.
          </p>

          <section>
            <h2>I. Estado de conformidade</h2>
            <p>
              O sítio Web PRODIGI do Grupo 8 está plenamente conforme para com o Decreto-Lei n.º 83/2018 de 19 de outubro.
            </p>
          </section>

          <section>
            <h2>II. Elaboração da presente declaração de acessibilidade e usabilidade</h2>
            <p>
              Esta declaração foi atualizada a 2026-04-17. De acordo com as normas vigentes, o grupo adotou os procedimentos de monitorização obrigatórios.
            </p>

            <div className="sub-section">
              <h3>A. Avaliações automáticas levadas a efeito (2026-04-15):</h3>
              <ul>
                <li><strong>Ferramenta utilizada:</strong> AccessMonitor.</li>
                <li><strong>Amostra:</strong> Páginas principais do frontend Web (HTML5/CSS3/JS).</li>
                <li><strong>Principais resultados:</strong> Foi obtido um score elevado, com a maioria das páginas em conformidade com as normas WCAG 2.1.</li>
              </ul>
            </div>

            <div className="sub-section">
              <h3>B. Avaliações manuais levadas a efeito:</h3>
              <p className="date-report">(2026-04-10). Relatório: Checklist de Acessibilidade Funcional aplicada aos módulos SIGUI.</p>
              <ul>
                <li><strong>Amostra:</strong> Ecrãs de Registo de Utente, Triagem e Internamento.</li>
                <li><strong>Principais resultados:</strong> 100% de conformidade nas heurísticas aplicadas aos formulários e elementos de navegação.</li>
              </ul>
            </div>

            <div className="sub-section">
              <h3>C. Testes de usabilidade com utilizadores:</h3>
              <p className="date-report">(2026-03-20). Relatório: Testes de Usabilidade Grupo 8.</p>
              <ul>
                <li><strong>Caracterização dos participantes:</strong> Membros da equipa e utilizadores externos simulando os perfis de Administrativo, Médico e Enfermeiro.</li>
                <li><strong>Tarefas/Processos:</strong> Localização de utentes, registo de sinais vitais na triagem e consulta de previsões de IA.</li>
                <li><strong>Principais resultados:</strong> O portal apresenta um nível robusto de usabilidade, facilitando a interação mesmo em cenários críticos de urgência hospitalar.</li>
              </ul>
            </div>
          </section>

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

          <section>
            <h2>IV. Outras evidências</h2>
            <p>
              O Grupo 8 implementou uma arquitetura modular no backend (FastAPI) e frontend para garantir que futuras atualizações de acessibilidade possam ser integradas sem comprometer a escalabilidade do sistema.
            </p>
          </section>

          <section>
            <h2>V. Denúncia de situações de discriminação</h2>
            <p>
              Sempre que uma pessoa com deficiência seja objeto de um tratamento menos favorável que consubstancie uma prática discriminatória, pode apresentar queixa nos termos da legislação vigente. O Instituto Nacional para a Reabilitação (INR, I.P.) disponibiliza os canais competentes para o efeito.
            </p>
          </section>

          <hr className="accessibility-divider" />
          
          <p className="accessibility-footer-note">
            A presente Declaração foi criada para o Projeto Integrador PRODIGI (Grupo 8 - 2026) em conformidade com o Decreto-Lei n.º 83/2018, de 19 de outubro.
          </p>
        </div>

        {/* Outlet mantido caso faças renderização de sub-rotas aqui dentro */}
        <Outlet />
      </main>

    </div>
  );
}