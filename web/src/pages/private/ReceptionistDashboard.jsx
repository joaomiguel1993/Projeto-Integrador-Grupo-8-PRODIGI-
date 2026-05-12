import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import '../../styles/receptionist-dashboard.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const emptyUtente = {
  nome: '',
  nif: '',
  data_nascimento: '',
  sexo: 'M',
  morada: '',
  telefone: '',
  email: '',
  numutent: '',
};

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
);
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
);
const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" /></svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
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

  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const nomeExibicao = utilizadorLogado?.nome || utilizadorLogado?.username || textos?.geral?.utilizador || 'Utilizador';
  const iniciaisUtilizador = nomeExibicao.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const storedHospital = sessionStorage.getItem('hospitalAtivo');
    if (storedHospital) {
      try {
        setHospitalAtivo(JSON.parse(storedHospital));
      } catch {
        setHospitalAtivo(null);
      }
    }
    carregarTudo();
  }, []);

  const abrirPerfilUtilizador = () => {
    const userId = utilizadorLogado?.id_utilizador || utilizadorLogado?.id_user || utilizadorLogado?.id || utilizadorLogado?.idfunc || utilizadorLogado?.IdFunc;
    userId ? navigate(`/perfil/${userId}`) : navigate('/perfil');
  };

  const carregarTudo = async () => {
    setLoading(true);
    setErro('');
    try {
      const [uRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/`),
        fetch(`${API_URL}/api/episodios/`),
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
      const texto = [u.nome, u.nif, u.numero_utente, u.num_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtro));
    });
  }, [utentes, filtro]);

  const utentesParaEntrada = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.numero_utente, u.num_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtroEntrada));
    });
  }, [utentes, filtroEntrada]);

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) => {
      const texto = [ep.nome_utente, ep.utente_nome, ep.estado].join(' ');
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
      data_nascimento: u?.datanasc ?? '',
      sexo: u?.sexo ?? 'M',
      morada: u?.localidade ?? '',
      telefone: u?.telefone ?? '',
      email: u?.email ?? '',
      numutent: u?.numutent ?? '',
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

    const numUtente = novoUtente.numutent;
    const isEditing = !!numUtente;
    const url = isEditing
      ? `${API_URL}/api/utentes/${numUtente}`
      : `${API_URL}/api/utentes/`;

    const payloadUtente = {
      nome: novoUtente.nome ?? '',
      nif: novoUtente.nif ?? '',
      datanasc: novoUtente.data_nascimento || null,
      sexo: novoUtente.sexo ?? 'M',
      localidade: novoUtente.morada ?? '',
      telefone: novoUtente.telefone ?? '',
      email: novoUtente.email ?? '',
    };

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadUtente),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || 'Erro ao processar dados do utente.');
      }

      setMensagem(
        isEditing
          ? (textos?.receptionist?.sucessoUpdate || 'Utente atualizado com sucesso.')
          : (textos?.receptionist?.sucessoCriar || 'Utente criado com sucesso.')
      );

      setNovoUtente(emptyUtente);
      setUtenteSelecionado(data);
      await carregarTudo();
      setUtentesView('ficha');
      setMainMenu('utentes');
    } catch (e) {
      setErro(e.message || 'Erro ao guardar utente.');
    }
  };

  const abrirEpisodio = async () => {
    if (!utenteSelecionado) {
      setErro(textos?.receptionist?.selecionaPrimeiro || 'Selecione primeiro um utente.');
      return;
    }

    const numUtente =
      utenteSelecionado?.num_utente ||
      utenteSelecionado?.numero_utente ||
      utenteSelecionado?.NumUtent ||
      utenteSelecionado?.id_utente ||
      utenteSelecionado?.idutente;

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
      const res = await fetch(`${API_URL}/api/episodios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          num_utent: numUtente,
          idhosp: idHosp,
        }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ? JSON.stringify(detail.detail) : 'Erro ao abrir episódio.');
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

  const fazerLogout = () => {
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const renderUtentes = () => {
    if (utentesView === 'criar') {
      return (
        <section className="admin-panel-section" aria-labelledby="title-criar">
          <div className="admin-panel-section__header">
            <h2 id="title-criar">{novoUtente.num_utente || novoUtente.id_utente || novoUtente.idutente ? (textos?.geral?.editar || 'Editar') : (textos?.receptionist?.novoUtente || 'Novo utente')}</h2>
          </div>
          <form className="admin-form" onSubmit={criarOuEditarUtente}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label>{textos?.receptionist?.nome || 'Nome'}</label><input name="nome" value={novoUtente.nome || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} required /></div>
              <div className="admin-form__group"><label>{textos?.receptionist?.nif || 'NIF'}</label><input name="nif" value={novoUtente.nif || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
              <div className="admin-form__group"><label>{textos?.receptionist?.dataNascimento || 'Data de nascimento'}</label><input type="date" name="data_nascimento" value={novoUtente.data_nascimento || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.sexo || 'Sexo'}</label>
                <select name="sexo" value={novoUtente.sexo || 'M'} onChange={(e) => handleInputChange(e, setNovoUtente)}>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="admin-form__group"><label>{textos?.receptionist?.telefone || 'Telefone'}</label><input name="telefone" value={novoUtente.telefone || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
              <div className="admin-form__group"><label>{textos?.receptionist?.email || 'Email'}</label><input name="email" value={novoUtente.email || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}><label>{textos?.receptionist?.morada || 'Morada'}</label><input name="morada" value={novoUtente.morada || ''} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
            </div>
            <div className="admin-actions-row">
              <button className="admin-form__submit" type="submit">{textos?.geral?.guardar || 'Guardar'}</button>
              <button className="admin-secondary-button" type="button" onClick={() => setUtentesView('lista')}>{textos?.geral?.cancelar || 'Cancelar'}</button>
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
            <div className="admin-table-card">
              <p><strong>{textos?.receptionist?.nome || 'Nome'}:</strong> {utenteSelecionado.nome || '—'}</p>
              <p><strong>{textos?.receptionist?.nif || 'NIF'}:</strong> {utenteSelecionado.nif || '—'}</p>
              <p><strong>{textos?.receptionist?.dataNascimento || 'Data de nascimento'}:</strong> {utenteSelecionado.datanasc || '—'}</p>
              <p><strong>{textos?.receptionist?.sexo || 'Sexo'}:</strong> {utenteSelecionado.sexo || '—'}</p>
              <p><strong>{textos?.receptionist?.morada || 'Localidade'}:</strong> {utenteSelecionado.localidade || '—'}</p>
              <p><strong>{textos?.receptionist?.telefone || 'Telefone'}:</strong> {utenteSelecionado.telefone || '—'}</p>
              <p><strong>{textos?.receptionist?.email || 'Email'}:</strong> {utenteSelecionado.email || '—'}</p>

              <div className="admin-actions-row" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="admin-form__submit"
                  onClick={() => prepararEdicao(utenteSelecionado)}
                >
                  {textos?.common?.edit || 'Editar'}
                </button>
              </div>
            </div>
          ) : (
            <p>{textos?.receptionist?.selecionaUtente || 'Selecione um utente.'}</p>
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
          <input id="search-input" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder={textos?.receptionist?.placeholderPesquisa || 'Pesquisar por nome, NIF ou telefone'} />
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
                {utentesFiltrados.map((u, index) => (
                  <tr key={`utente-${u.num_utente || u.id_utente || u.idutente || index}`}>
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
                ))}
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

            <div className="admin-form__group">
              <label htmlFor="search-entrada">{textos?.receptionist?.pesquisaRapida || 'Pesquisa rápida'}</label>
              <input
                id="search-entrada"
                value={filtroEntrada}
                onChange={(e) => setFiltroEntrada(e.target.value)}
                placeholder={textos?.receptionist?.placeholderPesquisa || 'Pesquisar por nome, NIF ou telefone'}
              />
            </div>

            <div className="admin-table-card admin-table-card--full" style={{ marginBottom: '1rem' }}>
              <div className="admin-table-scroll admin-table-scroll--employees">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{textos?.receptionist?.nome || 'Nome'}</th>
                      <th>{textos?.receptionist?.nif || 'NIF'}</th>
                      <th>{textos?.receptionist?.telefone || 'Telefone'}</th>
                      <th>{textos?.geral?.acoes || 'Ações'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utentesParaEntrada.map((u, index) => (
                      <tr key={`entrada-${u.num_utente || u.id_utente || u.idutente || index}`}>
                        <td>{u.nome}</td>
                        <td>{u.nif || '—'}</td>
                        <td>{u.telefone || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => {
                              setUtenteSelecionado(u);
                              setMensagem('');
                              setErro('');
                            }}
                          >
                            {textos?.receptionist?.selecionaUtente || 'Selecionar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {utenteSelecionado && (
              <div className="admin-table-card" style={{ marginBottom: '1rem' }}>
                <p><strong>{textos?.receptionist?.utente || 'Utente'}:</strong> {utenteSelecionado.nome}</p>
                <p><strong>{textos?.receptionist?.nif || 'NIF'}:</strong> {utenteSelecionado.nif || '—'}</p>
                <p><strong>{textos?.receptionist?.telefone || 'Telefone'}:</strong> {utenteSelecionado.telefone || '—'}</p>
                <p><strong>Hospital ativo:</strong> {hospitalAtivo?.nome || hospitalAtivo?.Nome || 'Não identificado'}</p>
              </div>
            )}

            <div className="admin-actions-row">
              <button className="admin-form__submit" type="button" onClick={abrirEpisodio} disabled={!utenteSelecionado || !hospitalAtivo}>
                {textos?.receptionist?.abrirEpisodioBtn || 'Dar entrada no hospital'}
              </button>
            </div>
          </section>
        );

      default:
        return (
          <section className="admin-panel-section" aria-labelledby="title-recentes">
            <div className="admin-panel-section__header">
              <h2 id="title-recentes">{textos?.receptionist?.episodiosRecentes || 'Entradas recentes'}</h2>
            </div>
            <div className="admin-form__group" style={{ marginBottom: '20px' }}>
              <label htmlFor="search-episodes">{textos?.receptionist?.pesquisaEpisodios || 'Pesquisar episódios'}</label>
              <input id="search-episodes" value={filtroEpisodios} onChange={(e) => setFiltroEpisodios(e.target.value)} placeholder={textos?.receptionist?.placeholderEpisodios || 'Pesquisar por utente ou estado'} />
            </div>
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{textos?.receptionist?.utente || 'Utente'}</th>
                      <th>{textos?.receptionist?.entrada || 'Entrada'}</th>
                      <th>{textos?.receptionist?.estado || 'Estado'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {episodiosFiltrados.map((ep, index) => (
                      <tr key={`episodio-${ep.cod_ep_urgenc || ep.id_epurgencia || ep.id || index}`}>
                        <td>{ep.nome_utente || ep.utente_nome || '—'}</td>
                        <td>{ep.datahoraentr || ep.datahora || '—'}</td>
                        <td>{ep.estado || textos?.receptionist?.estadoAberto || 'aberto'}</td>
                      </tr>
                    ))}
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

        <button type="button" className="admin-sidebar__profile" onClick={abrirPerfilUtilizador} aria-label={textos?.receptionist?.ariaPerfil || 'Abrir perfil'}>
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">{iniciaisUtilizador}</div>
          <span className="admin-sidebar__profile-name">{nomeExibicao}</span>
        </button>

        <div className="admin-sidebar__divider" />
        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'utentes' ? 'is-active' : ''}`}
            onClick={() => {
              setMainMenu('utentes');
              setUtentesView('lista');
            }}
          >
            <IconSearch /><span className="link-text">{textos?.receptionist?.menuPesquisar || 'Utentes'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'episodio' ? 'is-active' : ''}`} onClick={() => setMainMenu('episodio')}>
            <IconFolder /><span className="link-text">{textos?.receptionist?.menuEpisodio || 'Dar entrada'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'recentes' ? 'is-active' : ''}`} onClick={() => setMainMenu('recentes')}>
            <IconClock /><span className="link-text">{textos?.receptionist?.menuRecentes || 'Entradas recentes'}</span>
          </button>
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')} aria-pressed={idioma === 'pt'}>PT</button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')} aria-pressed={idioma === 'en'}>EN</button>
          </div>
          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <IconExit /><span className="link-text">{textos?.geral?.sair || 'Sair'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper" role="region" aria-labelledby="dashboard-title">
        <div className="admin-content-inner">
          <div className="admin-content-top">
            <h1 id="dashboard-title">{textos?.receptionist?.tituloPainel || 'Painel do rececionista'}</h1>
            <p>{textos?.receptionist?.descricaoPainel || 'Gerir utentes e dar entrada no hospital.'}</p>
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
