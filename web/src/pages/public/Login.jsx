import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/auth';
import { useLanguage } from '../../contexts/LanguageContext'; // Integração do Contexto
import { ROLES, STORAGE_KEYS } from '../../constants/roles';

/**
 * @file Login.jsx
 * @description Página de autenticação do sistema SIAGUH com suporte multi-idioma.
 * Gere o fluxo de login e a seleção de unidade hospitalar ativa.
 * 
 * @component
 */

const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const mapearRole = (rawRole) => {
  const role = normalizarRole(rawRole);
  if (['admin', 'administrador'].includes(role)) return ROLES.ADMIN;
  if (['rececionista', 'recepcionista', 'rececao', 'receção'].includes(role)) return ROLES.RECECIONISTA;
  if (['enfermeiro', 'enfermagem'].includes(role)) return ROLES.ENFERMEIRO;
  if (['medico', 'médico'].includes(role)) return ROLES.MEDICO;
  return role;
};

export default function Login() {
  const navigate = useNavigate();
  const { textos } = useLanguage(); // Acesso aos textos dinâmicos (PT/EN)

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [showHospitalStep, setShowHospitalStep] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState('');
  const [hospitais, setHospitais] = useState([]);

  /**
   * Submissão do formulário de login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      setLoading(true);
      const data = await loginRequest({ username, password });

      const role = mapearRole(
        data?.user?.role || data?.role || data?.tipofunc || data?.tipoFunc || data?.funcao
      );

      if (!role) {
        throw new Error(textos.login.erroRole);
      }

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'true');
      sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data?.user || data));

      if (role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
        return;
      }

      const hospitaisAutorizados = data?.user?.hospitais || data?.hospitais || data?.hospitais_autorizados || [];

      if (!Array.isArray(hospitaisAutorizados) || hospitaisAutorizados.length === 0) {
        throw new Error(textos.login.erroHospitais);
      }

      setRoleSelecionada(role);
      setHospitais(hospitaisAutorizados);
      setShowHospitalStep(true);
    } catch (err) {
      // Limpa dados de sessão exceto a preferência de idioma
      Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
      setErro(err.message || textos.login.erroLogin);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finaliza o login guardando o hospital ativo
   */
  const handleEscolherHospital = (hospital) => {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_HOSPITAL, JSON.stringify(hospital));

    const destinos = {
      [ROLES.RECECIONISTA]: '/rececionista',
      [ROLES.ENFERMEIRO]: '/enfermeiro',
      [ROLES.MEDICO]: '/medico',
    };

    const destino = destinos[roleSelecionada];
    if (!destino) {
      setErro(textos.login.erroDestino);
      return;
    }

    navigate(destino, { replace: true });
  };

  return (
    <main className="login-page" role="main">
      {/* Feedback para leitores de ecrã sobre erros ou mudança de passo */}
      <div aria-live="assertive" className="sr-only">
        {erro}
        {showHospitalStep && textos.login.ariaPassoHospital}
      </div>

      <section className="login-page__card" aria-labelledby="login-title">
        <button
          type="button"
          className="login-page__back"
          onClick={() => navigate('/')}
          aria-label={textos.login.ariaVoltar}
        >
          {textos.geral.voltar}
        </button>

        {!showHospitalStep ? (
          <>
            <p className="section-label" aria-hidden="true">{textos.login.labelPasso1}</p>
            <h1 id="login-title" className="login-page__title">{textos.login.tituloLogin}</h1>
            <p className="login-page__subtitle">{textos.login.subtituloLogin}</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-form__group">
                <label htmlFor="username">{textos.admin.lblUsername}</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="login-form__group">
                <label htmlFor="password">{textos.admin.lblPassword}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {erro && <p className="login-form__error" role="alert">{erro}</p>}

              <button
                type="submit"
                className="login-form__submit"
                disabled={loading}
              >
                {loading ? textos.geral.aCarregar : textos.login.btnEntrar}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="section-label" aria-hidden="true">{textos.login.labelPasso2}</p>
            <h1 id="login-title" className="login-page__title">{textos.login.tituloHospital}</h1>
            <p className="login-page__subtitle">{textos.login.subtituloHospital}</p>

            {erro && <p className="login-form__error" role="alert">{erro}</p>}

            <div className="hospital-select-list" role="list" aria-label={textos.login.tituloHospital}>
              {hospitais.map((hospital, index) => (
                <button
                  key={hospital.idhosp || index}
                  type="button"
                  className="hospital-select-card"
                  onClick={() => handleEscolherHospital(hospital)}
                  role="listitem"
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