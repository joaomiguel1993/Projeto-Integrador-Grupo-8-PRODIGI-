import React from 'react';
import { Outlet } from 'react-router-dom';
import { TEXTOS_PT } from '../../locals/pt';

/**
 * @file AuthLayout.jsx
 * @description Layout base para as páginas de autenticação do sistema SIAGUH.
 * Serve como "casca" (shell) para renderizar as rotas filhas (ex: Login).
 * Como é uma página de entrada, não inclui a navegação principal (Header/Footer completos).
 * 
 * @component
 * @returns {JSX.Element} O layout com o conteúdo da rota injetado no <Outlet />
 */
export default function AuthLayout() {
  return (
    <div className="auth-shell">
      {/* 
        O role="main" é uma boa prática para forçar a identificação do bloco principal.
        O aria-label usa o nosso dicionário para explicar o propósito desta área a utilizadores invisuais.
      */}
      <main 
        className="auth-shell__content" 
        role="main" 
        aria-label={TEXTOS_PT.acessibilidade.areaAutenticacao}
      >
        <Outlet />
      </main>
    </div>
  );
}