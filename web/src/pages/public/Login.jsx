/**
 * @file Login.jsx
 * @description Componente de autenticação profissional para o ecossistema SIAGUH.
 * Trata da submissão de credenciais, mapeamento semântico dos perfis clínicos (Roles),
 * armazenamento seguro de tokens JWT e gestão do ecrã de seleção da unidade hospitalar ativa.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../../services/auth';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLES, STORAGE_KEYS } from '../../constants/roles';
import '../../styles/main.css';

/**
 * Limpa, normaliza e passa para minúsculas uma string representativa de uma Role.
 * @param {string} role - String bruta extraída da resposta da API.
 * @returns {string} String limpa e sem acentuação gráfica.
 */
const normalizarRole = (role) =>
  String(role || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/**
 * Converte as nomenclaturas operacionais do backend para as constantes rígidas de segurança do ecossistema React.
 * @param {string} rawRole - Função ou cargo clínico devolvido pela base de dados.
 * @returns {string} Constante mapeada pertencente ao enumerador ROLES.
 */
const mapearRole = (rawRole) => {
  const role = normalizarRole(rawRole);
  if (['admin', 'administrador'].includes(role)) return ROLES.ADMIN;
  if (['rececionista', 'recepcionista', 'rececao', 'receção'].includes(role)) return ROLES.RECECIONISTA;
  if (['enfermeiro', 'enfermagem'].includes(role)) return ROLES.ENFERMEIRO;
  if (['medico', 'médico'].includes(role)) return ROLES.MEDICO;
  return role;
};

/**
 * Componente View correspondente ao formulário multifásico de Autenticação.
 * @component
 */
export default function Login() {
  const navigate = useNavigate();
  const { textos } = useLanguage();

  // Instanciação de aliases de segurança para evitar quebras no sistema multilingue
  const tLogin = textos?.login || {};
  const tAdmin = textos?.admin || {};
  const tGeral = textos?.geral || {};

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHospitalStep, setShowHospitalStep] = useState(false);
  const [roleSelecionada, setRoleSelecionada] = useState('');
  const [hospitais, setHospitais] = useState([]);

  /**
   * Valida as credenciais na API, inicializa a sessão e determina se o utilizador segue 
   * direto para a Administração ou se necessita de escolher um hospital de serviço.
   * @async
   * @param {React.FormEvent} e - Evento nativo de submissão do formulário.
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

      if (!role) throw new Error(tLogin.erroRole ?? 'Perfil de acesso não identificado.');

      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'true');
      sessionStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data?.user || data));

      if (data?.access_token) {
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      }

      if (role === ROLES.ADMIN) {
        navigate('/admin', { replace: true });
        return;
      }

      const hospitaisAutorizados = data?.user?.hospitais || data?.hospitais || data?.hospitais_autorizados || [];

      if (!Array.isArray(hospitaisAutorizados) || hospitaisAutorizados.length === 0) {
        throw new Error(tLogin.erroHospitais ?? 'Nenhum hospital associado a este utilizador.');
      }

      setRoleSelecionada(role);
      setHospitais(hospitaisAutorizados);
      setShowHospitalStep(true);
    } catch (err) {
      Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
      setErro(err.message || (tLogin.erroLogin ?? 'Credenciais inválidas ou erro de rede.'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda a infraestrutura selecionada na sessão ativa e despacha o utilizador para a sua respetiva área de trabalho.
   * @param {Object} hospital - Objeto contendo os metadados do hospital escolhido.
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
      setErro(tLogin.erroDestino ?? 'Erro ao encaminhar utilizador para o painel clínico.');
      return;
    }

    navigate(destino, { replace: true });
  };

  return (
    <main className="login-shell-pro" role="main">
      <div aria-live="assertive" className="sr-only">
        {erro}
        {showHospitalStep && (tLogin.ariaPassoHospital ?? 'Passo dois: Selecione o hospital de serviço.')}
      </div>

      <section className="login-shell-pro__grid" aria-labelledby="login-title">
        {/* CORREÇÃO INTERNACIONALIZAÇÃO: Remoção total de strings em hardcode da secção institucional lateral */}
        <aside className="login-brand-panel">
          <span className="login-brand-panel__eyebrow">SIAGUH</span>
          <h1 className="login-brand-panel__title">
            {tLogin.brandTitle ?? 'Gestão inteligente para urgências hospitalares.'}
          </h1>
          <p className="login-brand-panel__text">
            {tLogin.brandDescription ?? 'Acede à plataforma para gerir atendimento, triagem, episódios clínicos e operação hospitalar com maior rapidez e controlo.'}
          </p>

          <div className="login-brand-panel__highlights">
            <div className="login-brand-chip">
              <strong>{tLogin.chipLiveTitle ?? 'Tempo real'}</strong>
              <span>{tLogin.chipLiveText ?? 'Filas, estados e contexto hospitalar centralizado.'}</span>
            </div>
            <div className="login-brand-chip">
              <strong>{tLogin.chipRolesTitle ?? 'Acesso por perfil'}</strong>
              <span>{tLogin.chipRolesText ?? 'Fluxos dedicados para administração, receção, enfermagem e medicina.'}</span>
            </div>
          </div>
        </aside>

        <section className="login-card-pro">
          <button
            type="button"
            className="login-page__back login-page__back--pro"
            onClick={() => navigate('/')}
            aria-label={tLogin.ariaVoltar ?? 'Voltar para o ecrã público inicial'}
          >
            {tGeral.voltar || 'Voltar'}
          </button>

          {!showHospitalStep ? (
            <>
              <div className="login-card-pro__header">
                <span className="login-card-pro__step">{tLogin.labelPasso1 ?? 'Passo 1 de 2'}</span>
                <h2 id="login-title" className="login-card-pro__title">{tLogin.tituloLogin ?? 'Autenticação Profissional'}</h2>
                <p className="login-card-pro__subtitle">{tLogin.subtituloLogin ?? 'Introduza os seus dados para aceder ao painel operacional.'}</p>
              </div>

              <form className="login-form login-form--pro" onSubmit={handleSubmit}>
                <div className="login-form__group login-form__group--pro">
                  <label htmlFor="username">{tAdmin.lblUsername ?? 'Utilizador'}</label>
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
                  <label htmlFor="password">{tAdmin.lblPassword ?? 'Palavra-passe'}</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {erro && <p className="login-form__error login-form__error--pro" role="alert">{erro}</p>}

                <button type="submit" className="login-form__submit login-form__submit--pro" disabled={loading}>
                  {loading ? (tGeral.aCarregar ?? 'A carregar...') : (tLogin.btnEntrar ?? 'Entrar')}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="login-card-pro__header">
                <span className="login-card-pro__step">{tLogin.labelPasso2 ?? 'Passo 2 de 2'}</span>
                <h2 id="login-title" className="login-card-pro__title">{tLogin.tituloHospital ?? 'Unidade de Serviço'}</h2>
                <p className="login-card-pro__subtitle">{tLogin.subtituloHospital ?? 'Selecione o hospital onde se encontra em funções de serviço clínico.'}</p>
              </div>

              {erro && <p className="login-form__error login-form__error--pro" role="alert">{erro}</p>}

              <div className="hospital-select-list hospital-select-list--pro" role="list" aria-label={tLogin.tituloHospital ?? 'Unidades Autorizadas'}>
                {hospitais.map((hospital, index) => (
                  <button
                    key={hospital.idhosp || hospital.id_hosp || index}
                    type="button"
                    className="hospital-select-card hospital-select-card--pro"
                    onClick={() => handleEscolherHospital(hospital)}
                    role="listitem"
                  >
                    <strong>{hospital.nome || `${tLogin.termoHospital ?? 'Hospital'} ${index + 1}`}</strong>
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
