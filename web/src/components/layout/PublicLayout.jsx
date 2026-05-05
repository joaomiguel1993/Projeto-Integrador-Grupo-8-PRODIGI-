import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderPublic from './HeaderPublic';
import FooterLayout from './FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext'; // Importação do contexto

/**
 * @file PublicLayout.jsx
 * @description Layout principal para as páginas públicas do portal SIAGUH.
 * Agora integrado com o sistema multi-idioma para garantir que ferramentas de
 * acessibilidade (Skip Links) acompanham o idioma selecionado.
 * 
 * @component
 * @returns {JSX.Element} O layout com Header, conteúdo principal (Outlet) e Footer.
 */
export default function PublicLayout() {
  // Acesso ao dicionário de textos ativo (PT ou EN)
  const { textos } = useLanguage();

  return (
    <div className="site-shell">
      
      {/* 
        Atalho de Acessibilidade (Skip Link): 
        O texto é agora dinâmico e traduzido conforme a escolha do utilizador.
      */}
      <a href="#conteudo-principal" className="sr-only sr-only-focusable">
        {textos.acessibilidade.saltarConteudo}
      </a>

      <HeaderPublic />
      
      {/* 
        O id="conteudo-principal" é o alvo do Skip Link acima.
        O role="main" ajuda tecnologias de assistência a identificar o núcleo da página.
      */}
      <main id="conteudo-principal" role="main">
        <Outlet />
      </main>
      
      <FooterLayout />
      
    </div>
  );
}