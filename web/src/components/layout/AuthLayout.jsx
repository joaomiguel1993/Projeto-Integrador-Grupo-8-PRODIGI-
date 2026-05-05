import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * @file AuthLayout.jsx
 * @description Layout base para as páginas de autenticação do sistema SIAGUH.
 * Agora integrado com o sistema multi-idioma para garantir acessibilidade global.
 * 
 * @component
 * @returns {JSX.Element} O layout com o conteúdo da rota injetado no <Outlet />
 */
export default function AuthLayout() {
  // Acede aos textos dinâmicos (PT ou EN) através do contexto
  const { textos } = useLanguage();

  return (
    <div className="auth-shell">
      {/* 
        O aria-label é agora dinâmico, utilizando a chave 'areaAutenticacao' 
        do dicionário ativo (definido em pt.js ou en.js).
      */}
      <main 
        className="auth-shell__content" 
        role="main" 
        aria-label={textos.acessibilidade.areaAutenticacao}
      >
        <Outlet />
      </main>
    </div>
  );
}