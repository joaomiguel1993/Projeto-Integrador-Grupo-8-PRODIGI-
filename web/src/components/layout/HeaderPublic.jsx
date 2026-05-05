import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext'; // Importar o hook de idioma
import logo from '../../imagens/logo.png';

/**
 * @file HeaderPublic.jsx
 * @description Cabeçalho público do sistema SIAGUH com suporte multi-idioma (PT/EN).
 * 
 * @component
 * @returns {JSX.Element} O cabeçalho público da aplicação.
 */
export default function HeaderPublic() {
  // Aceder aos textos dinâmicos e à função de mudar idioma do contexto
  const { idioma, textos, mudarIdioma } = useLanguage();

  return (
    <header className="header-public" role="banner">
      <div className="container header-public__inner">
        
        <div className="brand-mark">
          <Link to="/" aria-label={textos.headerPublic.linkInicio}>
            <img 
              src={logo} 
              alt={textos.headerPublic.altLogo} 
              className="brand-mark__logo" 
            />
          </Link>

          <div className="brand-mark__text">
            <strong className="brand-mark__title" aria-hidden="true">
              {textos.headerPublic.titulo}
            </strong>
            <span className="brand-mark__subtitle">
              {textos.headerPublic.subtitulo}
            </span>
          </div>
        </div>

        {/* --- NOVO: SELETOR DE IDIOMAS --- */}
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="language-selector" role="group" aria-label="Seleção de idioma">
            <button 
              type="button"
              className={`lang-btn ${idioma === 'pt' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('pt')}
              aria-label="Português"
              aria-pressed={idioma === 'pt'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: idioma === 'pt' ? 'bold' : 'normal', color: 'inherit' }}
            >
              PT
            </button>
            <span aria-hidden="true" style={{ opacity: 0.3 }}>|</span>
            <button 
              type="button"
              className={`lang-btn ${idioma === 'en' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('en')}
              aria-label="English"
              aria-pressed={idioma === 'en'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: idioma === 'en' ? 'bold' : 'normal', color: 'inherit' }}
            >
              EN
            </button>
          </div>

          <Link to="/login" className="header-login">
            {textos.headerPublic.botaoLogin}
          </Link>
        </div>
        
      </div>
    </header>
  );
}