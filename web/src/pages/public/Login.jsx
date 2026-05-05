import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/auth';
import { TEXTOS_PT } from '../../locals/pt';
import { ROLES, STORAGE_KEYS } from '../../constants/roles';

/**
 * @file Login.jsx
 * @description Página de autenticação do sistema SIAGUH.
 * Gere o fluxo de login em dois passos: 
 * 1. Introdução de credenciais.
 * 2. Seleção de hospital (para perfis não-admin).
 * 
 * @component
 * @returns {JSX.Element} O formulário de login e seleção de unidade hospitalar.
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

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [showHospitalStep, setShowHospitalStep] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState('');
  const [hospitais, setHospitais] = useState([]);

  /**
   * Submissão do formulário de login
   * @param {Event} e Evento de submissão
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
        throw new Error(TEXTOS_PT.login.erroRole);
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
        throw new Error(TEXTOS_PT.login.erroHospitais);
      }

      setRoleSelecionada(role);
      setHospitais(hospitaisAutorizados);
      setShowHospitalStep(true);
    } catch (err) {
      Object.values(STORAGE_KEYS).forEach(key => sessionStorage.removeItem(key));
      setErro(err.message || TEXTOS_PT.login.erroLogin);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Finaliza o login guardando o hospital ativo
   * @param {Object} hospital Objeto do hospital selecionado
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
      setErro(TEXTOS_PT.login.erroDestino);
      return;
    }

    navigate(destino, { replace: true });
  };

  return (
    <main className="login-page" role="main">
      {/* Região para anúncios de mudanças de estado (ex: erro ou mudança de passo) */}
      <div aria-live="assertive" className="sr-only">
        {erro}
        {showHospitalStep && TEXTOS_PT.login.ariaPassoHospital}
      </div>

      <section className="login-page__card" aria-labelledby="login-title">
        <button
          type="button"
          className="login-page__back"
          onClick={() => navigate('/')}
          aria-label={TEXTOS_PT.login.ariaVoltar}
        >
          {TEXTOS_PT.geral.voltar}
        </button>

        {!showHospitalStep ? (
          <>
            <p className="section-label" aria-hidden="true">{TEXTOS_PT.login.labelPasso1}</p>
            <h1 id="login-title" className="login-page__title">{TEXTOS_PT.login.tituloLogin}</h1>
            <p className="login-page__subtitle">{TEXTOS_PT.login.subtituloLogin}</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-form__group">
                <label htmlFor="username">{TEXTOS_PT.admin.lblUsername}</label>
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
                <label htmlFor="password">{TEXTOS_PT.admin.lblPassword}</label>
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
                {loading ? TEXTOS_PT.geral.aCarregar : TEXTOS_PT.login.btnEntrar}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="section-label" aria-hidden="true">{TEXTOS_PT.login.labelPasso2}</p>
            <h1 id="login-title" className="login-page__title">{TEXTOS_PT.login.tituloHospital}</h1>
            <p className="login-page__subtitle">{TEXTOS_PT.login.subtituloHospital}</p>

            {erro && <p className="login-form__error" role="alert">{erro}</p>}

            <div className="hospital-select-list" role="list" aria-label={TEXTOS_PT.login.tituloHospital}>
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