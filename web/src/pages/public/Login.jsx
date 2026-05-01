import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      setLoading(true);

      const data = await login(username, password);
      const role = normalizarRole(data?.user?.role || data?.role);

      const roleRoutes = {
        admin: '/admin',
        medico: '/medico',
        enfermeiro: '/enfermeiro',
        rececionista: '/rececionista',
      };

      const destino = roleRoutes[role];

      if (!destino) {
        throw new Error(`Função sem rota definida: ${data?.user?.role || data?.role}`);
      }

      navigate(destino, { replace: true });
    } catch (err) {
      setErro(err.message || 'Erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-page__card">
        <button
          type="button"
          className="login-page__back"
          onClick={() => navigate('/')}
        >
          ← Voltar
        </button>

        <p className="section-label">Autenticação</p>
        <h1 className="login-page__title">Login</h1>
        <p className="login-page__subtitle">
          Introduz as tuas credenciais para entrares no sistema.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-form__group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {erro && <p className="login-form__error">{erro}</p>}

          <button
            type="submit"
            className="login-form__submit"
            disabled={loading}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}