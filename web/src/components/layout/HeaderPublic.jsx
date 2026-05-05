import React from 'react';
import { Link } from 'react-router-dom';
import { TEXTOS_PT } from '../../locals/pt'; 
import logo from '../../imagens/logo.png';


/**
 * @file HeaderPublic.jsx
 * @description Cabeçalho público do sistema SIAGUH.
 * É renderizado nas páginas abertas ao público (antes do login), 
 * contendo o logótipo, o nome por extenso do projeto e o botão de acesso à plataforma.
 * Implementa rotas fluidas (React Router) e marcações de acessibilidade (ARIA).
 * 
 * @component
 * @returns {JSX.Element} O cabeçalho público da aplicação.
 */
export default function HeaderPublic() {
  return (
    // role="banner" é a forma standard de dizer aos leitores de ecrã: "Isto é o cabeçalho principal"
    <header className="header-public" role="banner">
      <div className="container header-public__inner">
        
        <div className="brand-mark">
          {/* Link para a página inicial com texto descritivo invisível para leitores de ecrã */}
          <Link to="/" aria-label={TEXTOS_PT.headerPublic.linkInicio}>
            <img 
              src={logo} 
              alt={TEXTOS_PT.headerPublic.altLogo} 
              className="brand-mark__logo" 
            />
          </Link>

          <div className="brand-mark__text">
            {/* O aria-hidden="true" esconde a sigla do leitor de ecrã, pois o subtítulo já diz tudo por extenso */}
            <strong className="brand-mark__title" aria-hidden="true">
              {TEXTOS_PT.headerPublic.titulo}
            </strong>
            <span className="brand-mark__subtitle">
              {TEXTOS_PT.headerPublic.subtitulo}
            </span>
          </div>
        </div>

        <Link to="/login" className="header-login">
          {TEXTOS_PT.headerPublic.botaoLogin}
        </Link>
        
      </div>
    </header>
  );
}