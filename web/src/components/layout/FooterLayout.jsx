import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import "../../styles/layout/footer.css";

import fculLogo from '../../imagens/FCUL-Branco.png';
import iselLogo from '../../imagens/ISEL-Branco.png';
import iplLogo from '../../imagens/Politecnicodelisboa-Branco.png';
import prrLogo from '../../imagens/RepublicaPortuguesaPRR-Branco.png';
import tecnicoLogo from '../../imagens/Tecnico-Branco.png';
import ulisboaLogo from '../../imagens/Ulisboa-Branco.png';

export default function FooterLayout() {
  const { textos } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const anoAtual = new Date().getFullYear();

  return (
    <footer className="siaguh-footer">
      <div className="siaguh-subfooter">
        <div className="siaguh-subfooter-links">
          <Link to="/sobre-nos">{textos?.footer?.termos || 'Sobre Nós'}</Link>
          <Link to="/politica-privacidade">{textos?.footer?.privacidade || 'Política de Privacidade'}</Link>
          <Link to="/acessibilidade">{textos?.footer?.acessibilidade || 'Acessibilidade'}</Link>
        </div>

        <div className="siaguh-subfooter-contacts">
          <a href="/faq" className="siaguh-contact-item faq-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10a4 4 0 118 0c0 2-2 3-3 4a2 2 0 00-1 1m0 4h.01M22 12A10 10 0 112 12a10 10 0 0120 0z"
              />
            </svg>

            <div className="siaguh-contact-text">
              <span className="siaguh-contact-label">{textos?.footer?.faqLabel || 'Ajuda'}</span>
              <Link to="/FAQS" className="siaguh-contact-value">
                               {textos?.footer?.faqValue || 'FAQ'}
              </Link>
            </div>
          </a>

          <a href="tel:+351210000000" className="siaguh-contact-item phone-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.516 5.516l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>

            <div className="siaguh-contact-text">
              <span className="siaguh-contact-label">{textos?.footer?.telefoneLabel || 'Contacto'}</span>
              <span className="siaguh-contact-value">{textos?.footer?.telefoneValue || '+351 210 000 000'}</span>
            </div>
          </a>
        </div>
      </div>

      <div className="siaguh-main-footer">
        <button
          type="button"
          className="siaguh-btn-top"
          onClick={scrollToTop}
          aria-label={textos?.footer?.voltarTopo || 'Voltar ao topo'}
          title={textos?.footer?.voltarTopo || 'Voltar ao topo'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        <div className="siaguh-footer-content-wrapper">
          <div className="siaguh-footer-text">
            <p>{textos?.footer?.copyright || `© ${anoAtual} SIAGUH. Todos os direitos reservados.`}</p>
            <p>{textos?.footer?.entidade || 'Sistema Integrado de Apoio à Gestão Hospitalar.'}</p>
          </div>

          <div className="siaguh-logos-container">
            <img src={fculLogo} alt="FCUL" />
            <img src={iselLogo} alt="ISEL" />
            <img src={iplLogo} alt="Politécnico de Lisboa" />
            <img src={prrLogo} alt="PRR" />
            <img src={tecnicoLogo} alt="Técnico" />
            <img src={ulisboaLogo} alt="Universidade de Lisboa" />
          </div>
        </div>
      </div>
    </footer>
  );
}