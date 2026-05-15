// src/components/layout/FooterLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

import fculLogo    from '../../imagens/FCUL-Branco.png';
import iselLogo    from '../../imagens/ISEL-Branco.png';
import iplLogo     from '../../imagens/Politecnicodelisboa-Branco.png';
import prrLogo     from '../../imagens/RepublicaPortuguesaPRR-Branco.png';
import tecnicoLogo from '../../imagens/Tecnico-Branco.png';
import ulisboaLogo from '../../imagens/Ulisboa-Branco.png';

const LOGOS = [
  { src: fculLogo,    alt: 'FCUL'                    },
  { src: iselLogo,    alt: 'ISEL'                    },
  { src: iplLogo,     alt: 'Politécnico de Lisboa'   },
  { src: prrLogo,     alt: 'República Portuguesa PRR'},
  { src: tecnicoLogo, alt: 'Técnico Lisboa'          },
  { src: ulisboaLogo, alt: 'Universidade de Lisboa'  },
];

export default function FooterLayout() {
  const { textos } = useLanguage();
  const anoAtual = new Date().getFullYear();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="site-footer" role="contentinfo">

      {/* ── SUBFOOTER: links + contactos ── */}
      <div className="footer-sub">
        <div className="container footer-sub__inner">

          <nav className="footer-sub__links" aria-label="Rodapé">
            <Link to="/sobre-nos">
              {textos?.footer?.sobreNos || 'Sobre Nós'}
            </Link>
            <Link to="/politica-privacidade">
              {textos?.footer?.privacidade || 'Política de Privacidade'}
            </Link>
            <Link to="/acessibilidade">
              {textos?.footer?.acessibilidade || 'Acessibilidade'}
            </Link>
          </nav>

          <div className="footer-sub__contacts">
            {/* FAQ */}
            <Link to="/FAQS" className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10a4 4 0 118 0c0 2-2 3-3 4a2 2 0 00-1 1m0 4h.01M22 12A10 10 0 112 12a10 10 0 0120 0z" />
              </svg>
              <div className="footer-contact-item__text">
                <span className="footer-contact-item__label">
                  {textos?.footer?.faqLabel || 'Ajuda'}
                </span>
                <span className="footer-contact-item__value">
                  {textos?.footer?.faqValue || 'FAQ'}
                </span>
              </div>
            </Link>

            {/* Telefone */}
            <a href="tel:+351210000000" className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.128a11.042 11.042 0 005.516 5.516l1.128-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div className="footer-contact-item__text">
                <span className="footer-contact-item__label">
                  {textos?.footer?.telefoneLabel || 'Contacto'}
                </span>
                <span className="footer-contact-item__value">
                  {textos?.footer?.telefoneValue || '+351 210 000 000'}
                </span>
              </div>
            </a>
          </div>

        </div>
      </div>

      {/* ── MAIN FOOTER: copyright + logos ── */}
      <div className="footer-main">
        <div className="container footer-main__inner">

          <div className="footer-main__text">
            <p className="footer-main__copy">
              {textos?.footer?.copyright || `© ${anoAtual} SIAGUH. Todos os direitos reservados.`}
            </p>
            <p className="footer-main__entity">
              {textos?.footer?.entidade || 'Sistema Integrado de Apoio à Gestão Hospitalar.'}
            </p>
          </div>

          <div className="footer-logos">
            {LOGOS.map(({ src, alt }) => (
              <img key={alt} src={src} alt={alt} className="footer-logos__img" />
            ))}
          </div>

        </div>

        {/* Botão voltar ao topo */}
        <button
          type="button"
          className="footer-top-btn"
          onClick={scrollToTop}
          aria-label={textos?.footer?.voltarTopo || 'Voltar ao topo'}
          title={textos?.footer?.voltarTopo || 'Voltar ao topo'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

    </footer>
  );
}