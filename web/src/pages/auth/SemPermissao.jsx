// src/pages/errors/SemPermissao.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SemPermissao() {
  const { textos } = useLanguage();

  return (
    <main className="auth-page" role="main">

      <section
        className="auth-page__card"
        role="alert"
        aria-labelledby="titulo-sem-permissao"
      >
        <p className="section-label" aria-hidden="true">
          {textos.acessoNegado.label}
        </p>

        <h1 id="titulo-sem-permissao">
          {textos.acessoNegado.titulo}
        </h1>

        <p>{textos.acessoNegado.mensagem}</p>

        <div className="auth-page__actions">
          <Link
            to="/"
            className="login-form__submit"
            aria-label={textos.acessoNegado.ariaVoltar}
          >
            {textos.acessoNegado.voltar}
          </Link>
        </div>
      </section>

    </main>
  );
}