import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import logo from '../../imagens/logo.png';

export default function HeaderPublic() {
  const { idioma, textos, mudarIdioma } = useLanguage();

  return (
    <header className="header-public header-public--hero" role="banner">
      <div className="container header-public__inner header-public__inner--hero">
        <Link to="/" className="brand-mark brand-mark--hero brand-mark--hero-plain" aria-label={textos.headerPublic.linkInicio}>
          <img
            src={logo}
            alt={textos.headerPublic.altLogo}
            className="brand-mark__logo brand-mark__logo--hero brand-mark__logo--hero-xl"
          />

          <div className="brand-mark__text brand-mark__text--hero">
            <strong className="brand-mark__title brand-mark__title--hero" aria-hidden="true">
              {textos.headerPublic.titulo}
            </strong>
            <span className="brand-mark__subtitle brand-mark__subtitle--hero">
              {textos.headerPublic.subtitulo}
            </span>
          </div>
        </Link>

        <div className="header-public__actions header-public__actions--hero">
          <div className="language-selector language-selector--hero" role="group" aria-label="Seleção de idioma">
            <button
              type="button"
              className={`lang-btn lang-btn--hero ${idioma === 'pt' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('pt')}
              aria-label="Português"
              aria-pressed={idioma === 'pt'}
            >
              PT
            </button>
            <span className="lang-divider lang-divider--hero" aria-hidden="true">/</span>
            <button
              type="button"
              className={`lang-btn lang-btn--hero ${idioma === 'en' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('en')}
              aria-label="English"
              aria-pressed={idioma === 'en'}
            >
              EN
            </button>
          </div>

          <Link to="/login" className="header-login header-login--hero">
            {textos.headerPublic.botaoLogin}
          </Link>
        </div>
      </div>
    </header>
  );
}
