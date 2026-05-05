import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderPublic from './HeaderPublic';
import FooterLayout from './FooterLayout';
import { TEXTOS_PT } from '../../locals/pt'; 

/**
 * @file PublicLayout.jsx
 * @description Layout principal para as páginas públicas do portal SIAGUH 
 * (ex: Início, Sobre Nós, Acessibilidade, FAQs).
 * Engloba as rotas filhas com o Cabeçalho Público e o Rodapé.
 * Inclui um atalho "Skip Link" para utilizadores que navegam por teclado.
 * 
 * @component
 * @returns {JSX.Element} O layout com Header, conteúdo principal (Outlet) e Footer.
 */
export default function PublicLayout() {
  return (
    <div className="site-shell">
      
      {/* 
        Atalho de Acessibilidade (Skip Link): 
        Fica escondido visualmente, mas aparece se o utilizador pressionar a tecla "Tab".
        Leva o foco diretamente para o bloco <main> abaixo.
      */}
      <a href="#conteudo-principal" className="sr-only sr-only-focusable">
        {TEXTOS_PT.acessibilidade.saltarConteudo}
      </a>

      <HeaderPublic />
      
      {/* Adicionámos o id="conteudo-principal" para que o link acima funcione */}
      <main id="conteudo-principal" role="main">
        <Outlet />
      </main>
      
      <FooterLayout />
      
    </div>
  );
}