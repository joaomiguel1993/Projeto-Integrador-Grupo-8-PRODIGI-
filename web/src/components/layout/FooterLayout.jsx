export default function FooterLayout() {
  return (
    <footer className="footer-layout">
      <div className="container footer-layout__inner">
        <p>&copy; {new Date().getFullYear()} SIAGUH - Sistema Integrado de Apoio à Gestão de Urgências Hospitalares. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
