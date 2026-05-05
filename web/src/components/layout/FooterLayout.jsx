import React from 'react';
import { Link } from 'react-router-dom';
import { TEXTOS_PT } from '../../locals/pt'; 
import '../../styles/Footer.css'; 

// Importação das imagens
import fculLogo from '../../imagens/FCUL-Branco.png';
import iselLogo from '../../imagens/ISEL-Branco.png';
import iplLogo from '../../imagens/Politecnicodelisboa-Branco.png';
import prrLogo from '../../imagens/RepublicaPortuguesaPRR-Branco.png';
import tecnicoLogo from '../../imagens/Tecnico-Branco.png';
import ulisboaLogo from '../../imagens/Ulisboa-Branco.png';

/**
 * @file FooterLayout.jsx
 * @description Componente estrutural que renderiza o Rodapé do sistema SIAGUH.
 * Inclui links de navegação secundária, contactos rápidos, informações de copyright 
 * e os logótipos das instituições parceiras/financiadoras.
 * 
 * @component
 * @returns {JSX.Element} O rodapé (footer) da aplicação, otimizado para acessibilidade.
 */
export default function FooterLayout() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anoAtual = new Date().getFullYear();

  return (
    // role="contentinfo" é a tag de acessibilidade standard para rodapés de páginas web
    <footer className="siaguh-footer" role="contentinfo" aria-label={TEXTOS_PT.footer.ariaLabel}>
      
      {/* --- SUBFOOTER: Links e Contactos --- */}
      <div className="siaguh-subfooter">
                
        {/* Navegação Secundária */}
        <nav className="siaguh-subfooter-links" aria-label={TEXTOS_PT.footer.navSecundaria}>
          <Link to="/sobre-nos">{TEXTOS_PT.footer.sobreNos}</Link>
          <Link to="/mapa-site">{TEXTOS_PT.footer.mapaSite}</Link>
          <Link to="/acessibilidade">{TEXTOS_PT.footer.acessibilidade}</Link>
          <Link to="/politica-privacidade">{TEXTOS_PT.footer.politicaPrivacidade}</Link>
        </nav>

        <div className="siaguh-subfooter-contacts">
          
          <div className="siaguh-contact-item phone-link">
            {/* aria-hidden="true" diz ao leitor de ecrã para ignorar o desenho do ícone */}
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-label">{TEXTOS_PT.footer.telefone}</span>
              <span className="siaguh-contact-value">{TEXTOS_PT.footer.numeroTelefone}</span>
            </div>
          </div>

          <Link to="/faqs" className="siaguh-contact-item faq-link">
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-value">
                {TEXTOS_PT.footer.perguntas} <br /> {TEXTOS_PT.footer.frequentes}
              </span>
            </div>
          </Link>

        </div>
      </div>

      {/* --- FOOTER PRINCIPAL: Copyright, Logos e Botão Topo --- */}
      <div className="siaguh-main-footer">
        
        <div className="siaguh-footer-content-wrapper">
          
          <div className="siaguh-footer-text">
            <p>&copy; {anoAtual} <strong>PRODIGI</strong> - {TEXTOS_PT.footer.projetoIntegrador}</p>
            <p>{TEXTOS_PT.footer.direitosReservados}</p>
          </div>

          <div className="siaguh-logos-container">
            <img src={prrLogo} alt={TEXTOS_PT.footer.altPrr} />
            <img src={ulisboaLogo} alt={TEXTOS_PT.footer.altUlisboa} />
            <img src={fculLogo} alt={TEXTOS_PT.footer.altFcul} />
            <img src={iplLogo} alt={TEXTOS_PT.footer.altIpl} />
            <img src={tecnicoLogo} alt={TEXTOS_PT.footer.altTecnico} />
            <img src={iselLogo} alt={TEXTOS_PT.footer.altIsel} />
          </div>
        </div>

        <button 
          onClick={scrollToTop} 
          className="siaguh-btn-top" 
          aria-label={TEXTOS_PT.footer.voltarAoTopo} 
          title={TEXTOS_PT.footer.voltarAoTopo}
        >
          <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
          </svg>
        </button>

      </div>
    </footer>
  );
}