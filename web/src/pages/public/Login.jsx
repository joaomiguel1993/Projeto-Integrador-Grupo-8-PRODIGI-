import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLES, STORAGE_KEYS } from '../../constants/roles';
import '../../styles/main.css';

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
  const { textos } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHospitalStep, setShowHospitalStep] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState('');
  const [hospitais, setHospitais] = useState([]);

  const buscarHospitaisDoFuncionario = async (idFunc) => {
    const res = await fetch(`/api/v1/trabalha/funcionario/${idFunc}`);
    if (!res.ok) throw new Error(textos.login.erroHospitais);
    const data = await res.json();

    const lista = Array.isArray(data) ? data : data ? [data] : [];

    return lista
      .map((item) => ({
        idhosp: item?.idhosp ?? item?.id_hosp ?? item?.idHosp ?? item?.hospital?.idhosp ?? item?.hospital?.id_hosp ?? item?.id,
        nome: item?.hospital?.nome ?? item?.nome ?? item?.hospital_nome ?? item?.hospitalName ?? '',
        localizacao: item?.hospital?.localizacao ?? item?.localizacao ?? item?.morada ?? '',
      }))
      .filter((h) => h.idhosp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      setLoading(true);
      const data = await loginRequest({ username, password });

      const role = mapearRole(
        data?.user?.role || data?.role || data?.user?.tipofunc || data?.tipofunc || data?.funcao
      );

      if (!role) throw new Error(textos.login.erroRole);

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token);
      sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user || {}));

      const idFunc = Number(data?.user?.idfunc ?? data?.user?.id_func ?? data?.user?.idFunc ?? data?.idfunc ?? data?.id_func ?? data?.idFunc ?? 0);
      if (idFunc) {
        sessionStorage.setItem('user_idfunc', String(idFunc));
      }

      if (role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
        return;
      }

      if (!idFunc) {
        throw new Error(textos.login.erroHospitais);
      }

      const hospitaisFuncionario = await buscarHospitaisDoFuncionario(idFunc);

      if (!hospitaisFuncionario.length) {
        throw new Error(textos.login.erroHospitais);
      }

      setRoleSelecionada(role);
      setHospitais(hospitaisFuncionario);
      setShowHospitalStep(true);
    } catch (err) {
      Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
      sessionStorage.removeItem('user_idfunc');
      setErro(err.message || textos.login.erroLogin);
    } finally {
      setLoading(false);
    }
  };

  const handleEscolherHospital = (hospital) => {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_HOSPITAL, JSON.stringify(hospital || {}));

    const destinos = {
      [ROLES.RECECIONISTA]: '/rececionista',
      [ROLES.ENFERMEIRO]: '/enfermeiro',
      [ROLES.MEDICO]: '/medico',
    };

    const destino = destinos[normalizarRole(roleSelecionada)];

    if (!destino) {
      setErro(textos.login.erroDestino || 'Destino inválido.');
      return;
    }

    navigate(destino, { replace: true });
  };

  return (
    <main className="login-shell-pro" role="main">
      <div aria-live="assertive" className="sr-only">
        {erro}
        {showHospitalStep && textos.login.ariaPassoHospital}
      </div>

      <section className="login-shell-pro__grid" aria-labelledby="login-title">
        <aside className="login-brand-panel">
          <span className="login-brand-panel__eyebrow">SIAGUH</span>
          <h1 className="login-brand-panel__title">Gestão inteligente para urgências hospitalares.</h1>
          <p className="login-brand-panel__text">
            Acede à plataforma para gerir atendimento, triagem, episódios clínicos e operação hospitalar com maior rapidez e controlo.
          </p>

          <div className="login-brand-panel__highlights">
            <div className="login-brand-chip">
              <strong>Tempo real</strong>
              <span>Filas, estados e contexto hospitalar centralizado.</span>
            </div>
            <div className="login-brand-chip">
              <strong>Acesso por perfil</strong>
              <span>Fluxos dedicados para administração, receção, enfermagem e medicina.</span>
            </div>
          </div>
        </aside>

        <section className="login-card-pro">
          <button
            type="button"
            className="login-page__back login-page__back--pro"
            onClick={() => navigate('/')}
            aria-label={textos.login.ariaVoltar}
          >
            {textos.geral.voltar}
          </button>

          {!showHospitalStep ? (
            <>
              <div className="login-card-pro__header">
                <span className="login-card-pro__step">{textos.login.labelPasso1}</span>
                <h2 id="login-title" className="login-card-pro__title">{textos.login.tituloLogin}</h2>
                <p className="login-card-pro__subtitle">{textos.login.subtituloLogin}</p>
              </div>

              <form className="login-form login-form--pro" onSubmit={handleSubmit}>
                <div className="login-form__group login-form__group--pro">
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

                <div className="login-form__group login-form__group--pro">
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

                {erro && (
                  <p className="login-form__error login-form__error--pro" role="alert">
                    {erro}
                  </p>
                )}

                <button type="submit" className="login-form__submit login-form__submit--pro" disabled={loading}>
                  {loading ? textos.geral.aCarregar : textos.login.btnEntrar}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-card-pro__header">
                <span className="login-card-pro__step">{textos.login.labelPasso2}</span>
                <h2 id="login-title" className="login-card-pro__title">{textos.login.tituloHospital}</h2>
                <p className="login-card-pro__subtitle">{textos.login.subtituloHospital}</p>
              </div>

              {erro && (
                <p className="login-form__error login-form__error--pro" role="alert">
                  {erro}
                </p>
              )}

              <div className="hospital-select-list hospital-select-list--pro" role="list" aria-label={textos.login.tituloHospital}>
                {hospitais.map((hospital, index) => (
                  <button
                    key={hospital.idhosp || hospital.id_hosp || hospital.id || index}
                    type="button"
                    className="hospital-select-card hospital-select-card--pro"
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
      </section>
    </main>
  );
}