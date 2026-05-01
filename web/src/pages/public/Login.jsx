import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/auth';

const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const mapearRole = (rawRole) => {
  const role = normalizarRole(rawRole);

  if (['admin', 'administrador'].includes(role)) return 'admin';
  if (['rececionista', 'recepcionista', 'rececao', 'receção'].includes(role)) return 'rececionista';
  if (['enfermeiro', 'enfermagem'].includes(role)) return 'enfermeiro';
  if (['medico', 'médico'].includes(role)) return 'medico';

  return role;
};

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [showHospitalStep, setShowHospitalStep] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState('');
  const [hospitais, setHospitais] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      setLoading(true);

      const data = await loginRequest({ username, password });
      console.log('LOGIN RESPONSE:', data);

      const role = mapearRole(
        data?.user?.role ||
        data?.role ||
        data?.tipofunc ||
        data?.tipoFunc ||
        data?.funcao
      );

      if (!role) {
        throw new Error('Função do utilizador não identificada.');
      }

      sessionStorage.setItem('is_authenticated', 'true');
      sessionStorage.setItem('user_role', role);

      if (data?.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(data));
      }

      if (role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      const hospitaisAutorizados =
        data?.user?.hospitais ||
        data?.hospitais ||
        data?.hospitais_autorizados ||
        data?.hospitaisAutorizados ||
        [];

      if (!Array.isArray(hospitaisAutorizados) || hospitaisAutorizados.length === 0) {
        throw new Error('Este utilizador não tem hospitais autorizados.');
      }

      setRoleSelecionada(role);
      setHospitais(hospitaisAutorizados);
      setShowHospitalStep(true);
    } catch (err) {
      sessionStorage.removeItem('is_authenticated');
      sessionStorage.removeItem('user_role');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('hospital_ativo');
      setErro(err.message || 'Erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleEscolherHospital = (hospital) => {
    sessionStorage.setItem('hospital_ativo', JSON.stringify(hospital));

    const destinos = {
      rececionista: '/rececionista',
      enfermeiro: '/enfermeiro',
      medico: '/medico',
    };

    const destino = destinos[roleSelecionada];

    if (!destino) {
      setErro('Não foi possível determinar a página de destino.');
      return;
    }

    navigate(destino, { replace: true });
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

        {!showHospitalStep ? (
          <>
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
          </>
        ) : (
          <>
            <p className="section-label">Hospital</p>
            <h1 className="login-page__title">Selecionar hospital</h1>
            <p className="login-page__subtitle">
              Escolhe o hospital onde vais trabalhar nesta sessão.
            </p>

            {erro && <p className="login-form__error">{erro}</p>}

            <div className="hospital-select-list">
              {hospitais.map((hospital, index) => (
                <button
                  key={hospital.idhosp || hospital.id || hospital.nome || index}
                  type="button"
                  className="hospital-select-card"
                  onClick={() => handleEscolherHospital(hospital)}
                >
                  <strong>{hospital.nome || `Hospital ${index + 1}`}</strong>
                  <span>{hospital.localizacao || hospital.morada || ''}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}