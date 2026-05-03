import React from 'react';
import '../../styles/Footer.css'; 

// Importação das imagens (Atenção ao caminho relativo, ajusta se necessário)
import fculLogo from '../../imagens/FCUL-Branco.png';
import iselLogo from '../../imagens/ISEL-Branco.png';
import iplLogo from '../../imagens/Politecnicodelisboa-Branco.png';
import prrLogo from '../../imagens/RepublicaPortuguesaPRR-Branco.png';
import tecnicoLogo from '../../imagens/Tecnico-Branco.png';
import ulisboaLogo from '../../imagens/Ulisboa-Branco.png';

export default function FooterLayout() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="siaguh-footer">
      {/* --- SUBFOOTER: Links e Contactos --- */}
      <div className="siaguh-subfooter">
        
        <div className="siaguh-subfooter-links">
          <a href="/sobre-nos">Sobre nós</a>
          <a href="/mapa-site">Mapa do Site</a>
          <a href="/acessibilidade">Acessibilidade</a>
          <a href="/politica-privacidade">Política de Privacidade</a>
        </div>

        <div className="siaguh-subfooter-contacts">
          
          <div className="siaguh-contact-item phone-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-label">Telefone</span>
              <span className="siaguh-contact-value">212 112 345</span>
            </div>
          </div>

          <a href="/faqs" className="siaguh-contact-item faq-link">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-value">Perguntas<br />Frequentes</span>
            </div>
          </a>

        </div>
      </div>

      {/* --- FOOTER PRINCIPAL: Copyright, Logos e Botão Topo --- */}
      <div className="siaguh-main-footer">
        
        <div className="siaguh-footer-content-wrapper">
          
          {/* Texto à esquerda em duas linhas (como no anexo) */}
          <div className="siaguh-footer-text">
            <p>&copy; {new Date().getFullYear()} <strong>SIAGUH</strong> - Sistema Integrado de Apoio</p>
            <p>à Gestão de Urgências Hospitalares. Todos os direitos reservados.</p>
          </div>

          {/* Renderização das imagens em linha na ordem solicitada */}
          <div className="siaguh-logos-container">
            <img src={prrLogo} alt="República Portuguesa PRR" />
            <img src={ulisboaLogo} alt="Universidade de Lisboa" />
            <img src={fculLogo} alt="FCUL" />
            <img src={iplLogo} alt="Politécnico de Lisboa" />
            <img src={tecnicoLogo} alt="Técnico Lisboa" />
            <img src={iselLogo} alt="ISEL" />
          </div>
        </div>

        <button onClick={scrollToTop} className="siaguh-btn-top" aria-label="Voltar ao topo" title="Voltar ao topo">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}