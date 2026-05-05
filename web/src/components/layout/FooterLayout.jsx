import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext'; // Integração do Contexto
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
 * @description Componente de Rodapé do sistema SIAGUH com suporte multi-idioma.
 * Renderiza informações institucionais, contactos e logótipos de parceiros.
 * 
 * @component
 * @returns {JSX.Element} O rodapé da aplicação.
 */
export default function FooterLayout() {
  const { textos } = useLanguage(); // Acesso aos textos traduzidos

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anoAtual = new Date().getFullYear();

  return (
    <footer className="siaguh-footer" role="contentinfo" aria-label={textos.footer.ariaLabel}>
      
      {/* --- SUBFOOTER: Links e Contactos --- */}
      <div className="siaguh-subfooter">
                
        {/* Navegação Secundária */}
        <nav className="siaguh-subfooter-links" aria-label={textos.footer.navSecundaria}>
          <Link to="/sobre-nos">{textos.footer.sobreNos}</Link>
          <Link to="/mapa-site">{textos.footer.mapaSite}</Link>
          <Link to="/acessibilidade">{textos.footer.acessibilidade}</Link>
          <Link to="/politica-privacidade">{textos.footer.politicaPrivacidade}</Link>
        </nav>

        <div className="siaguh-subfooter-contacts">
          
          <div className="siaguh-contact-item phone-link">
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-label">{textos.footer.telefone}</span>
              <span className="siaguh-contact-value">{textos.footer.numeroTelefone}</span>
            </div>
          </div>

          <Link to="/faqs" className="siaguh-contact-item faq-link">
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="siaguh-contact-text">
              <span className="siaguh-contact-value">
                {textos.footer.perguntas} <br /> {textos.footer.frequentes}
              </span>
            </div>
          </Link>

        </div>
      </div>

      {/* --- FOOTER PRINCIPAL: Copyright, Logos e Botão Topo --- */}
      <div className="siaguh-main-footer">
        
        <div className="siaguh-footer-content-wrapper">
          
          <div className="siaguh-footer-text">
            <p>&copy; {anoAtual} <strong>PRODIGI</strong> - {textos.footer.projetoIntegrador}</p>
            <p>{textos.footer.direitosReservados}</p>
          </div>

          <div className="siaguh-logos-container">
            <img src={prrLogo} alt={textos.footer.altPrr} />
            <img src={ulisboaLogo} alt={textos.footer.altUlisboa} />
            <img src={fculLogo} alt={textos.footer.altFcul} />
            <img src={iplLogo} alt={textos.footer.altIpl} />
            <img src={tecnicoLogo} alt={textos.footer.altTecnico} />
            <img src={iselLogo} alt={textos.footer.altIsel} />
          </div>
        </div>

        <button 
          onClick={scrollToTop} 
          className="siaguh-btn-top" 
          aria-label={textos.footer.voltarAoTopo} 
          title={textos.footer.voltarAoTopo}
        >
          <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
          </svg>
        </button>

      </div>
    </footer>
  );
}