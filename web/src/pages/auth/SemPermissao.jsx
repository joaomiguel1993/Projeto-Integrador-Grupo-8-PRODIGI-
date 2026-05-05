import React from 'react';
import { Link } from 'react-router-dom';
import { TEXTOS_PT } from '../../locals/pt'; 

/**
 * @file SemPermissao.jsx
 * @description Página de Erro 403 (Acesso Negado).
 * Exibida quando um utilizador tenta aceder a uma rota protegida 
 * para a qual não tem o nível de privilégio (Role) adequado.
 * 
 * @component
 * @returns {JSX.Element} A página de aviso de falta de permissões com botão de retorno.
 */
export default function SemPermissao() {
  return (
    <main className="auth-page" role="main">
      
      {/* 
        role="alert" informa imediatamente os leitores de ecrã de que se trata de uma mensagem de erro/aviso.
        aria-labelledby liga a caixa ao título principal para dar contexto.
      */}
      <section 
        className="auth-page__card" 
        role="alert" 
        aria-labelledby="titulo-sem-permissao"
      >
        {/* aria-hidden="true" porque a label "Acesso" é apenas visual, o título principal já diz o que se passa */}
        <p className="section-label" aria-hidden="true">
          {TEXTOS_PT.acessoNegado.label}
        </p>
        
        <h1 id="titulo-sem-permissao">
          {TEXTOS_PT.acessoNegado.titulo}
        </h1>
        
        <p>
          {TEXTOS_PT.acessoNegado.mensagem}
        </p>

        <div style={{ marginTop: '1rem' }}>
          <Link 
            to="/" 
            className="login-form__submit"
            aria-label={TEXTOS_PT.acessoNegado.ariaVoltar}
          >
            {TEXTOS_PT.acessoNegado.voltar}
          </Link>
        </div>
      </section>
      
    </main>
  );
}