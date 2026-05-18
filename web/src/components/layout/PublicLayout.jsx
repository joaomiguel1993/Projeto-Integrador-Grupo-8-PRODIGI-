// src/components/layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderPublic from './HeaderPublic';
import FooterLayout from './FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PublicLayout() {
  const { textos } = useLanguage();

  return (
    <div className="site-shell">

      {/* Skip link de acessibilidade */}
      <a href="#conteudo-principal" className="sr-only sr-only-focusable">
        {textos.acessibilidade.saltarConteudo}
      </a>

      <HeaderPublic />

      {/*
        Não usamos <main> aqui — cada página pública define o seu próprio
        <main id="conteudo-principal"> para controlo semântico individual.
        O Outlet renderiza diretamente dentro do site-shell.
      */}
      <div className="site-shell__content">
        <Outlet />
      </div>

      <FooterLayout />

    </div>
  );
}