import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';
import { apiFetch } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const emptyUtente = {
  nome: '',
  nif: '',
  data_nasc: '',
  sexo: 'M',
  localidade: '',
  telefone: '',
  email: '',
  num_utent: '',
};

const getToken = () =>
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('accessToken') ||
  null;

const authFetch = (url, options = {}) => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('utentes');
  const [utentesView, setUtentesView] = useState('lista');
  const [filtro, setFiltro] = useState('');
  const [filtroEntrada, setFiltroEntrada] = useState('');
  const [filtroEpisodios, setFiltroEpisodios] = useState('');
  const [utentes, setUtentes] = useState([]);
  const [episodios, setEpisodios] = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);
  const [novoUtente, setNovoUtente] = useState(emptyUtente);

   const nomeHospital =
    hospitalAtivo?.nome ||
    hospitalAtivo?.Nome ||
    hospitalAtivo?.designacao ||
    hospitalAtivo?.designacao_hospital ||
    'Dashboard Rececionista';
  
  const utilizadorLogado = useMemo(() => {
    const possibleKeys = [
      STORAGE_KEYS?.USER,
      STORAGE_KEYS?.AUTH_USER,
      STORAGE_KEYS?.CURRENT_USER,
      'user',
      'utilizador',
      'authUser',
    ].filter(Boolean);
    for (const key of possibleKeys) {
      try {
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch { }
    }
    return {};
  }, []);

  const userId = useMemo(() => {
    return (
      utilizadorLogado?.id_utilizador ||
      utilizadorLogado?.id_user ||
      utilizadorLogado?.id ||
      utilizadorLogado?.idfunc ||
      utilizadorLogado?.IdFunc ||
      utilizadorLogado?.idFunc ||
      utilizadorLogado?.idutilizador
    );
  }, [utilizadorLogado]);

  const nomeExibicao =
    utilizadorLogado?.nome ||
    utilizadorLogado?.username ||
    utilizadorLogado?.nome_utilizador ||
    utilizadorLogado?.email ||
    textos?.geral?.utilizador ||
    'Utilizador';

  const iniciaisUtilizador = nomeExibicao
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const storedHospital = sessionStorage.getItem(STORAGE_KEYS.ACTIVE_HOSPITAL);
    if (storedHospital) {
      try {
        setHospitalAtivo(JSON.parse(storedHospital));
      } catch {
        setHospitalAtivo(null);
      }
    } else {
      setHospitalAtivo(null);
    }
    carregarTudo();
  }, []);

  const abrirPerfilUtilizador = () => {
    navigate('/perfil');
  };

  const carregarTudo = async () => {
    setLoading(true);
    setErro('');
    try {
      const [uRes, eRes] = await Promise.all([
        authFetch(`${API_URL}/api/v1/utentes/`),
        authFetch(`${API_URL}/api/v1/episodios/`),
      ]);
      const uData = await uRes.json().catch(() => []);
      const eData = await eRes.json().catch(() => []);
      
      if (!uRes.ok || !eRes.ok) {
        throw new Error(textos?.receptionist?.erroCarga || 'Erro ao carregar dados.');
      }
      setUtentes(Array.isArray(uData) ? uData : []);
      setEpisodios(Array.isArray(eData) ? eData : []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const utentesFiltrados = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.num_utent, u.numutent, u.numero_utente, u.num_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtro));
    });
  }, [utentes, filtro]);

  const utentesParaEntrada = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.num_utent, u.numutent, u.numero_utente, u.num_utente, u.telefone, u.email].join(' ');
      return normalizar(texto).includes(normalizar(filtroEntrada));
    });
  }, [utentes, filtroEntrada]);

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) => {
      const texto = [
        ep.nome_utente, ep.utente_nome, ep.nomeutente, ep.nomeUtente,
        ep.utente?.nome, ep.nome, ep.estado,
        ep.datahoraentr, ep.datahora, ep.datahorafim, ep.data_fim,
      ].join(' ');
      return normalizar(texto).includes(normalizar(filtroEpisodios));
    });
  }, [episodios, filtroEpisodios]);

  const selecionarUtente = (u) => {
    setUtenteSelecionado(u);
    setUtentesView('ficha');
    setMensagem('');
    setErro('');
  };

  const prepararEdicao = (u) => {
    setUtenteSelecionado(u);
    setNovoUtente({
      nome: u?.nome ?? '',
      nif: u?.nif ?? '',
      data_nasc: u?.data_nasc ?? '',
      sexo: u?.sexo ?? 'M',
      localidade: u?.localidade ?? '',
      telefone: u?.telefone ?? '',
      email: u?.email ?? '',
      num_utent: u?.num_utent ?? '',
    });
    setUtentesView('criar');
    setMainMenu('utentes');
    setMensagem('');
    setErro('');
  };

  const prepararNovoUtente = () => {
    setUtenteSelecionado(null);
    setNovoUtente(emptyUtente);
    setUtentesView('criar');
    setMainMenu('utentes');
    setMensagem('');
    setErro('');
  };

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const criarOuEditarUtente = async (e) => {
    e.preventDefault();

    setMensagem('');
    setErro('');

    const isEditing = !!utenteSelecionado;

    const numUtente =
      utenteSelecionado?.num_utent ||
      utenteSelecionado?.numutent ||
      utenteSelecionado?.num_utente ||
      utenteSelecionado?.numero_utente;

    const url = isEditing
      ? `${API_URL}/api/v1/utentes/${numUtente}`
      : `${API_URL}/api/v1/utentes/`;

    const payloadUtente = {
      nome: novoUtente.nome,
      nif: novoUtente.nif,
      data_nasc: novoUtente.data_nasc,
      sexo: novoUtente.sexo,
      localidade: novoUtente.localidade,
      telefone: novoUtente.telefone,
      email: novoUtente.email,
    };

    console.log('Payload enviado:', payloadUtente);
    console.log('URL:', url);

    try {
      const res = await authFetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify(payloadUtente),
      });

      const data = await res.json().catch(() => null);

      console.log('Resposta backend:', data);

      if (!res.ok) {
        throw new Error(
          JSON.stringify(data?.detail || data || 'Erro ao guardar utente.')
        );
      }

      setMensagem(
        isEditing
          ? 'Utente atualizado com sucesso.'
          : 'Utente criado com sucesso.'
      );

      setNovoUtente(emptyUtente);

      await carregarTudo();

      setUtentesView('lista');
    } catch (e) {
      console.error(e);
      setErro(e.message || 'Erro ao guardar utente.');
    }
  };

  const abrirEpisodio = async () => {
    console.log('utenteSelecionado:', utenteSelecionado);
    const numUtente =
      utenteSelecionado?.num_utent ||
      utenteSelecionado?.numutent ||
      utenteSelecionado?.num_utente ||
      utenteSelecionado?.numero_utente;
    console.log('numUtente resolvido:', numUtente);
    if (!numUtente) {
      setErro(textos?.receptionist?.selecionaPrimeiro || 'Selecione primeiro um utente.');
      return;
    }
    const idHosp =
      hospitalAtivo?.idhosp ||
      hospitalAtivo?.IdHosp ||
      hospitalAtivo?.id_hosp ||
      hospitalAtivo?.id;
    if (!idHosp) {
      setErro('Nenhum hospital ativo selecionado.');
      return;
    }
    try {
      const res = await authFetch(`${API_URL}/api/v1/episodios/`, {
        method: 'POST',
        body: JSON.stringify({
          num_utent: numUtente,
          id_hosp: idHosp,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        let mensagemErro = 'Erro ao abrir episódio.';
        if (data?.detail) {
          if (typeof data.detail === 'string') {
            mensagemErro = data.detail;
          } else if (Array.isArray(data.detail)) {
            mensagemErro = data.detail
              .map((e) => {
                if (typeof e === 'string') return e;
                if (e?.msg && e?.loc) return `${e.loc.join(' > ')}: ${e.msg}`;
                return JSON.stringify(e);
              })
              .join(' | ');
          } else if (typeof data.detail === 'object') {
            mensagemErro = JSON.stringify(data.detail);
          }
        }
        throw new Error(mensagemErro);
      }
      setMensagem(textos?.receptionist?.sucessoEpisodio || 'Episódio aberto com sucesso.');
      setUtenteSelecionado(null);
      setFiltroEntrada('');
      await carregarTudo();
      setMainMenu('recentes');
    } catch (e) {
      setErro(e.message || 'Erro ao abrir episódio.');
    }
  };

  const abrirEpisodioDoUtente = () => {
    if (!utenteSelecionado) {
      setErro('Selecione primeiro um utente.');
      return;
    }
    setMainMenu('episodio');
    setFiltroEntrada(
      utenteSelecionado?.nome ||
      utenteSelecionado?.num_utent ||
      utenteSelecionado?.numutent ||
      ''
    );
  };

  const fazerLogout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch { }

    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const renderUtentes = () => {
    if (utentesView === 'criar') {
      return (
        <section className="admin-panel-section" aria-labelledby="title-criar">
          <div className="admin-panel-section__header">
            <h2 id="title-criar">
              {utenteSelecionado
                ? textos?.geral?.editar || 'Editar'
                : textos?.receptionist?.novoUtente || 'Novo utente'}
            </h2>
          </div>
          <form className="admin-form" onSubmit={criarOuEditarUtente}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>{textos?.receptionist?.nome || 'Nome'}</label>
                <input name="nome" value={novoUtente.nome || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} required />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.nif || 'NIF'}</label>
                <input name="nif" value={novoUtente.nif || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.dataNascimento || 'Data de nascimento'}</label>
                <input type="date" name="data_nasc" value={novoUtente.data_nasc || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.sexo || 'Sexo'}</label>
                <select name="sexo" value={novoUtente.sexo || 'M'} onChange={(e) => handleInputChange(e, setNovoUtente)}>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.telefone || 'Telefone'}</label>
                <input name="telefone" value={novoUtente.telefone || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.email || 'Email'}</label>
                <input name="email" value={novoUtente.email || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} />
              </div>
              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>{textos?.receptionist?.localidade || 'Localidade'}</label>
                <input name="localidade" value={novoUtente.localidade || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} />
              </div>
            </div>
            <div className="admin-actions-row">
              <button className="admin-form__submit" type="submit">
                {textos?.geral?.guardar || 'Guardar'}
              </button>
              <button className="admin-secondary-button" type="button" onClick={() => setUtentesView('lista')}>
                {textos?.geral?.cancelar || 'Cancelar'}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (utentesView === 'ficha') {
      return (
        <section className="admin-panel-section" aria-labelledby="title-ficha">
          <div className="admin-panel-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 id="title-ficha">{textos?.receptionist?.fichaBase || 'Ficha base'}</h2>
            <div className="admin-actions-row" style={{ marginLeft: 'auto' }}>
              <button type="button" className="admin-secondary-button" onClick={() => setUtentesView('lista')}>
                {textos?.geral?.voltar || 'Voltar'}
              </button>
              {utenteSelecionado && (
                <button type="button" className="admin-primary-big-button" onClick={() => prepararEdicao(utenteSelecionado)}>
                  {textos?.geral?.editar || 'Editar'}
                </button>
              )}
            </div>
          </div>
          {utenteSelecionado ? (
            <div className="patient-card">
              <div className="patient-card__header">
                <div className="patient-card__avatar">
                  {(utenteSelecionado.nome || '?').charAt(0).toUpperCase()}
                </div>
                <div className="patient-card__intro">
                  <h2 className="patient-card__name">{utenteSelecionado.nome || 'Utente sem nome'}</h2>
                  <div className="patient-card__badges">
                    <span className="patient-badge">NIF: {utenteSelecionado.nif || '—'}</span>
                    <span className="patient-badge">
                      Nº Utente: {utenteSelecionado.num_utent || utenteSelecionado.numutent || utenteSelecionado.num_utente || '—'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="patient-card__section">
                <h3 className="patient-card__section-title">Dados pessoais</h3>
                <div className="patient-card__grid">
                  <div className="patient-info">
                    <span className="patient-info__label">{textos?.receptionist?.dataNascimento || 'Data de nascimento'}</span>
                    <span className="patient-info__value">{utenteSelecionado.data_nasc || '—'}</span>
                  </div>
                  <div className="patient-info">
                    <span className="patient-info__label">{textos?.receptionist?.sexo || 'Sexo'}</span>
                    <span className="patient-info__value">{utenteSelecionado.sexo || '—'}</span>
                  </div>
                  <div className="patient-info">
                    <span className="patient-info__label">{textos?.receptionist?.localidade || 'Localidade'}</span>
                    <span className="patient-info__value">{utenteSelecionado.localidade || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="patient-card__section">
                <h3 className="patient-card__section-title">Contactos</h3>
                <div className="patient-card__grid">
                  <div className="patient-info">
                    <span className="patient-info__label">{textos?.receptionist?.telefone || 'Telefone'}</span>
                    <span className="patient-info__value">{utenteSelecionado.telefone || '—'}</span>
                  </div>
                  <div className="patient-info">
                    <span className="patient-info__label">{textos?.receptionist?.email || 'Email'}</span>
                    <span className="patient-info__value">{utenteSelecionado.email || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="patient-card__actions">
                <button type="button" className="patient-btn patient-btn--secondary" onClick={() => prepararEdicao(utenteSelecionado)}>
                  {textos?.common?.edit || 'Editar'}
                </button>
                <button type="button" className="patient-btn patient-btn--primary" onClick={abrirEpisodioDoUtente}>
                  {textos?.receptionist?.abrirEpisodioBtn || 'Dar entrada no hospital'}
                </button>
              </div>
            </div>
          ) : (
            <div className="patient-empty">
              <h3>Sem utente selecionado</h3>
              <p>{textos?.receptionist?.selecionaUtente || 'Selecione um utente para ver a ficha.'}</p>
            </div>
          )}
        </section>
      );
    }

    return (
      <section className="admin-panel-section" aria-labelledby="title-utentes">
        <div className="admin-panel-section__header">
          <h2 id="title-utentes">{textos?.receptionist?.pesquisarUtente || 'Utentes'}</h2>
        </div>
        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={prepararNovoUtente}>
            {textos?.receptionist?.novoUtente || 'Novo utente'}
          </button>
        </div>
        <div className="admin-form__group">
          <label htmlFor="search-input">{textos?.receptionist?.pesquisaRapida || 'Pesquisa rápida'}</label>
          <input
            id="search-input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder={textos?.receptionist?.placeholderPesquisa || 'Pesquisar por nome, NIF ou telefone'}
          />
        </div>
        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{textos?.receptionist?.nome || 'Nome'}</th>
                  <th>{textos?.receptionist?.nif || 'NIF'}</th>
                  <th>{textos?.receptionist?.sexo || 'Sexo'}</th>
                  <th>{textos?.geral?.acoes || 'Ações'}</th>
                </tr>
              </thead>
              <tbody>
                {utentesFiltrados.length === 0 ? (
                  <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                ) : (
                  utentesFiltrados.map((u, index) => (
                    <tr key={`utente-${u.numutent || u.num_utente || u.id_utente || u.idutente || index}`}>
                      <td>{u.nome}</td>
                      <td>{u.nif || '—'}</td>
                      <td>{u.sexo || '—'}</td>
                      <td>
                        <button type="button" className="admin-secondary-button" onClick={() => selecionarUtente(u)} style={{ marginRight: '8px' }}>
                          {textos?.receptionist?.verFicha || 'Ver ficha'}
                        </button>
                        <button type="button" className="admin-secondary-button" onClick={() => prepararEdicao(u)}>
                          {textos?.geral?.editar || 'Editar'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const renderCenter = () => {
    if (loading) return <p role="status">{textos?.geral?.aCarregar || 'A carregar...'}</p>;

    switch (mainMenu) {
      case 'utentes':
        return renderUtentes();

      case 'episodio':
        return (
          <section className="admin-panel-section" aria-labelledby="title-episodio">
            <div className="admin-panel-section__header">
              <h2 id="title-episodio">{textos?.receptionist?.menuEpisodio || 'Dar entrada'}</h2>
            </div>
            <div className="episode-search-shell">
              <div className="episode-search-topbar">
                <div>
                  <span className="episode-search-topbar__eyebrow">Abertura de episódio</span>
                  <h3 className="episode-search-topbar__title">Selecionar utente</h3>
                  <p className="episode-search-topbar__text">
                    Pesquise por número de utente, NIF ou nome e escolha o utente para continuar.
                  </p>
                </div>
                <div className="episode-search-topbar__meta">
                  <span>{utentesParaEntrada.length} resultados</span>
                  <span>Hospital: {hospitalAtivo?.nome || hospitalAtivo?.Nome || 'Não selecionado'}</span>
                </div>
              </div>

              <div className="episode-search-box">
                <div className="episode-search-box__icon"><IconSearch /></div>
                <input
                  id="search-entrada"
                  className="episode-search-box__input"
                  value={filtroEntrada}
                  onChange={(e) => setFiltroEntrada(e.target.value)}
                  placeholder="Pesquisar por número de utente, NIF ou nome"
                />
                {filtroEntrada && (
                  <button type="button" className="episode-search-box__clear" onClick={() => setFiltroEntrada('')}>
                    Limpar
                  </button>
                )}
              </div>

              {!utentesParaEntrada.length ? (
                <div className="episode-results-empty">
                  <h4>Sem resultados</h4>
                  <p>Não foi encontrado nenhum utente com os critérios indicados.</p>
                </div>
              ) : (
                <div className="episode-horizontal-grid">
                  {utentesParaEntrada.map((u, index) => {
                    const numeroUtente =
                      u?.num_utent || u?.numutent || u?.num_utente || u?.numero_utente;

                    const utenteEncontrado = utentes.find(
                      (utente) =>
                        String(utente?.num_utent || utente?.numutent || utente?.num_utente || utente?.numero_utente) ===
                        String(numeroUtente)
                    );

                    const isSelected =
                      String(
                        utenteSelecionado?.num_utent ||
                        utenteSelecionado?.numutent ||
                        utenteSelecionado?.num_utente ||
                        utenteSelecionado?.numero_utente
                      ) === String(numeroUtente);

                    return (
                      <button
                        key={`entrada-${numeroUtente || index}`}
                        type="button"
                        className={`episode-mini-card ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setUtenteSelecionado(u);
                          setMensagem('');
                          setErro('');
                        }}
                      >

                        <div className="episode-mini-card__header">
                          <div className="episode-mini-card__avatar">
                            {(u.nome || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="episode-mini-card__identity">
                            <h4>{u.nome || 'Utente'}</h4>
                            <p>Nº Utente: {numeroUtente || '—'}</p>
                          </div>
                        </div>
                        <div className="episode-mini-card__body">
                          <span><strong>NIF:</strong> {u.nif || '—'}</span>
                          <span><strong>Telefone:</strong> {u.telefone || '—'}</span>
                        </div>
                        {isSelected && <div className="episode-mini-card__selected">Selecionado</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="episode-patient-panel">
              {!utenteSelecionado ? (
                <div className="episode-patient-empty">
                  <div className="episode-patient-empty__icon">+</div>
                  <h3>Seleciona um utente</h3>
                  <p>Escolhe um utente para continuar com a abertura do episódio.</p>
                </div>
              ) : (
                <div className="episode-patient-card">
                  <div className="episode-patient-card__top">
                    <div className="episode-patient-card__avatar">
                      {(utenteSelecionado.nome || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="episode-patient-card__identity">
                      <h3>{utenteSelecionado.nome || 'Utente'}</h3>
                      <p>
                        Nº Utente: {utenteSelecionado.num_utent || utenteSelecionado.numutent || utenteSelecionado.num_utente || utenteSelecionado.numero_utente || '—'}
                      </p>
                    </div>
                  </div>
                  <div className="episode-patient-card__grid">
                    <div className="episode-data-item">
                      <span className="episode-data-item__label">NIF</span>
                      <span className="episode-data-item__value">{utenteSelecionado.nif || '—'}</span>
                    </div>
                    <div className="episode-data-item">
                      <span className="episode-data-item__label">Data de nascimento</span>
                      <span className="episode-data-item__value">{utenteSelecionado.data_nasc || '—'}</span>
                    </div>
                    <div className="episode-data-item">
                      <span className="episode-data-item__label">Telefone</span>
                      <span className="episode-data-item__value">{utenteSelecionado.telefone || '—'}</span>
                    </div>
                    <div className="episode-data-item">
                      <span className="episode-data-item__label">Email</span>
                      <span className="episode-data-item__value">{utenteSelecionado.email || '—'}</span>
                    </div>
                    <div className="episode-data-item">
                      <span className="episode-data-item__label">Hospital ativo</span>
                      <span className="episode-data-item__value">
                        {hospitalAtivo?.nome || hospitalAtivo?.Nome || 'Não identificado'}
                      </span>
                    </div>
                  </div>
                  {!hospitalAtivo && (
                    <p className="admin-form__error" role="alert">Nenhum hospital ativo selecionado.</p>
                  )}
                  <div className="episode-patient-card__actions">
                    <button type="button" className="episode-btn episode-btn--secondary" onClick={() => prepararEdicao(utenteSelecionado)}>
                      Editar dados
                    </button>
                    <button
                      className="episode-btn episode-btn--primary"
                      type="button"
                      onClick={abrirEpisodio}
                      disabled={!utenteSelecionado || !hospitalAtivo}
                    >
                      {textos?.receptionist?.abrirEpisodioBtn || 'Dar entrada no hospital'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        );

      case 'recentes':
      default:
        return (
          <section className="admin-panel-section" aria-labelledby="title-recentes">
            <div className="admin-panel-section__header">
              <h2 id="title-recentes">{textos?.receptionist?.episodiosRecentes || 'Entradas recentes'}</h2>
            </div>
            <div className="admin-form__group" style={{ marginBottom: '20px' }}>
              <label htmlFor="search-episodes">{textos?.receptionist?.pesquisaEpisodios || 'Pesquisar episódios'}</label>
              <input
                id="search-episodes"
                value={filtroEpisodios}
                onChange={(e) => setFiltroEpisodios(e.target.value)}
                placeholder={textos?.receptionist?.placeholderEpisodios || 'Pesquisar por utente ou estado'}
              />
            </div>
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{textos?.receptionist?.utente || 'Utente'}</th>
                      <th>{textos?.receptionist?.entrada || 'Entrada'}</th>
                      <th>{textos?.receptionist?.termino || 'Término'}</th>
                      <th>{textos?.receptionist?.estado || 'Estado'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {episodiosFiltrados.length > 0 ? (
                      episodiosFiltrados.map((ep, index) => {
                        const numeroUtenteEp =
                          ep.numutent || ep.num_utent || ep.num_utente || ep.numero_utente ||
                          ep.utente?.num_utent || ep.utente?.numutent || ep.utente?.num_utente;

                        const nomeUtenteDireto =
                          ep.nome_utente || ep.utente_nome || ep.nomeutente ||
                          ep.nomeUtente || ep.utente?.nome || ep.nome;

                        const utenteEncontrado = utentes.find(
                          (u) => String(u?.num_utent || u?.numutent || u?.num_utente || u?.numero_utente) === String(numeroUtenteEp)
                        );

                        const nomeUtente = nomeUtenteDireto || utenteEncontrado?.nome || '—';

                        const valorData =
                          ep.data_hora_entr ||
                          ep.data_hora_inicio ||
                          ep.datahoraentr ||
                          ep.datahora ||
                          ep.data_entrada ||
                          ep.created_at ||
                          ep.dataentrada;

                        const valorTermino =
                          ep.data_hora_saida ||
                          ep.data_hora_fim ||
                          ep.datahorasaida ||
                          ep.datahora_saida ||
                          ep.datasaida ||
                          ep.data_saida ||
                          ep.datahorafim ||
                          ep.data_fim ||
                          ep.fim ||
                          null;
                        const formatarData = (valor) => {
                          if (!valor) {
                            return {
                              data: '—',
                              hora: '—',
                            };
                          }

                          // Corrige formato vindo do PostgreSQL/FastAPI
                          const dataCorrigida = String(valor).replace(' ', 'T');

                          const d = new Date(dataCorrigida);

                          if (Number.isNaN(d.getTime())) {
                            console.log('DATA INVÁLIDA:', valor);

                            return {
                              data: '—',
                              hora: '—',
                            };
                          }

                          return {
                            data: d.toLocaleDateString('pt-PT'),
                            hora: d.toLocaleTimeString('pt-PT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }),
                          };
                        };

                        const { data: dataTexto, hora: horaTexto } = formatarData(valorData);
                        const { data: dataTermino, hora: horaTermino } = formatarData(valorTermino);

                        return (
                          <tr key={`episodio-${ep.cod_ep_urgenc || ep.id_epurgencia || ep.id || index}`} className="recent-entry-row">
                            <td>
                              <div className="recent-entry-patient">
                                <div className="recent-entry-patient__avatar">
                                  {(nomeUtente || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="recent-entry-patient__info">
                                  <span className="recent-entry-patient__name">{nomeUtente}</span>
                                  <span className="recent-entry-patient__meta">
                                    Episódio #{ep.cod_ep_urgenc || ep.id_epurgencia || ep.id || '—'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="episode-date-time">
                                <span className="episode-date-time__date">{dataTexto}</span>
                                <span className="episode-date-time__time">{horaTexto}</span>
                              </div>
                            </td>
                            <td>
                              <div className="episode-date-time">
                                <span className="episode-date-time__date">{dataTermino}</span>
                                <span className="episode-date-time__time">{horaTermino}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`recent-entry-status recent-entry-status--${String(ep.estado || 'aberto').toLowerCase()}`}>
                                {ep.estado || textos?.receptionist?.estadoAberto || 'aberto'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4">Sem episódios recentes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <main className={`admin-layout receptionist-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar" role="navigation" aria-label={textos?.receptionist?.ariaSidebar || 'Menu lateral'}>
        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={textos?.receptionist?.ariaToggleSidebar || 'Alternar menu lateral'}
        >
          <IconMenu />
        </button>

        <div className="admin-sidebar__brand">
          <img src={logo} alt="SIAGUH Logo" className="admin-sidebar__logo" />
        </div>

        <div className="admin-sidebar__divider" />

        <button
          type="button"
          className="admin-sidebar__profile"
          onClick={abrirPerfilUtilizador}
          aria-label={textos?.receptionist?.ariaPerfil || 'Abrir perfil'}
        >
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">
            {iniciaisUtilizador}
          </div>
          <span className="admin-sidebar__profile-name">{nomeExibicao}</span>
        </button>

        <div className="admin-sidebar__divider" />

        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'utentes' ? 'is-active' : ''}`}
            onClick={() => { setMainMenu('utentes'); setUtentesView('lista'); }}
          >
            <IconSearch />
            <span className="link-text">{textos?.receptionist?.menuPesquisar || 'Utentes'}</span>
          </button>
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'episodio' ? 'is-active' : ''}`}
            onClick={() => setMainMenu('episodio')}
          >
            <IconFolder />
            <span className="link-text">{textos?.receptionist?.menuEpisodio || 'Dar entrada'}</span>
          </button>
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'recentes' ? 'is-active' : ''}`}
            onClick={() => setMainMenu('recentes')}
          >
            <IconClock />
            <span className="link-text">{textos?.receptionist?.menuRecentes || 'Entradas recentes'}</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')} aria-pressed={idioma === 'pt'}>PT</button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')} aria-pressed={idioma === 'en'}>EN</button>
          </div>
          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <IconExit />
            <span className="link-text">{textos?.geral?.sair || 'Sair'}</span>
          </button>
        </div>
      </aside>



      <section className="admin-content-wrapper">
        <div className="admin-panel-section">
          <div className="admin-panel-section">
            <h1>Painel do rececionista</h1>
            <h3>{nomeHospital}</h3>
          </div>
          <div className="admin-content-body">
            {erro && <p className="admin-form__error" role="alert">{erro}</p>}
            {mensagem && <p className="admin-form__success" role="status">{mensagem}</p>}
            {renderCenter()}
          </div>
        </div>
        <FooterLayout />
      </section>
    </main>
  );
}