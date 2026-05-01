import logo from '../../imagens/logo.png';

export default function HeaderPublic() {
  return (
    <header className="header-public">
      <div className="container header-public__inner">
        <div className="brand-mark">
          <img src={logo} alt="Logótipo SIGUI" className="brand-mark__logo" />
          <div className="brand-mark__text">
            <strong className="brand-mark__title">SIAGUH</strong>
            <span className="brand-mark__subtitle">
              Sistema Integrado de Apoio à Gestão de Urgências Hospitalares
            </span>
          </div>
        </div>

        <a href="/login" className="header-login">
          Login
        </a>
      </div>
    </header>
  );
}