import { Link } from 'react-router-dom';

export default function SemPermissao() {
  return (
    <main className="auth-page">
      <section className="auth-page__card">
        <p className="section-label">Acesso</p>
        <h1>Sem permissão</h1>
        <p>
          Não tens permissões para aceder a esta área do sistema.
        </p>

        <div style={{ marginTop: '1rem' }}>
          <Link to="/" className="login-form__submit">
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}