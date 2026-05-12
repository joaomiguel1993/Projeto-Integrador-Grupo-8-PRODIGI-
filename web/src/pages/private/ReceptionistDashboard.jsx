import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import '../../styles/receptionist-dashboard.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Normaliza strings para comparação (remove acentos e converte para minúsculas).
 * @param {string} texto - O texto a ser normalizado.
 * @returns {string} Texto normalizado.
 */
const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// --- Ícones Componentizados ---
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

/**
 * @component ReceptionistDashboard
 * @description Dashboard principal para o perfil de Rececionista. Permite a gestão de utentes e abertura de episódios.
 */
export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  // --- Estados de UI ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('pesquisar');
  const [filtro, setFiltro] = useState('');
  const [filtroEpisodios, setFiltroEpisodios] = useState('');
  
  // --- Estados de Dados ---
  const [utentes, setUtentes] = useState([]);
  const [episodios, setEpisodios] = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);
  
  // --- Estados de Formulário ---
  const [novoUtente, setNovoUtente] = useState({
    nome: '', nif: '', data_nascimento: '', sexo: 'M', telefone: '', email: '', morada: '',
  });
  const [novoEpisodio, setNovoEpisodio] = useState({ motivo: '', observacao: '' });

  /** @section Lógica de Utilizador Logado */
  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch { return {}; }
  }, []);

  const nomeExibicao = utilizadorLogado?.nome || utilizadorLogado?.username || textos.geral.utilizador;
  const iniciaisUtilizador = nomeExibicao.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const storedHospital = sessionStorage.getItem('hospitalAtivo');
    if (storedHospital) {
      try { setHospitalAtivo(JSON.parse(storedHospital)); } catch { setHospitalAtivo(null); }
    }
    carregarTudo();
  }, []);

  /**
   * Navega para a página de perfil do utilizador atual.
   */
  const abrirPerfilUtilizador = () => {
    const userId = utilizadorLogado?.id_utilizador || utilizadorLogado?.id_user || utilizadorLogado?.id || utilizadorLogado?.idfunc;
    userId ? navigate(`/perfil/${userId}`) : navigate('/perfil');
  };

  /**
   * Carrega utentes e episódios da API.
   */
  const carregarTudo = async () => {
    setLoading(true);
    setErro('');
    try {
      const [uRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/`), // ADICIONADA BARRA FINAL
        fetch(`${API_URL}/api/episodios/`), // ADICIONADA BARRA FINAL
      ]);
      const uData = await uRes.json();
      const eData = await eRes.json();
      if (!uRes.ok || !eRes.ok) throw new Error(textos.receptionist.erroCarga);
      setUtentes(Array.isArray(uData) ? uData : []);
      setEpisodios(Array.isArray(eData) ? eData : []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  /** @section Filtros Dinâmicos */
  const utentesFiltrados = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.numero_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtro));
    });
  }, [utentes, filtro]);

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) => {
      const texto = [ep.nome_utente, ep.utente_nome, ep.estado].join(' ');
      return normalizar(texto).includes(normalizar(filtroEpisodios));
    });
  }, [episodios, filtroEpisodios]);

  /**
   * Seleciona um utente para visualizar a ficha.
   * @param {Object} u - Objeto do utente.
   */
  const selecionarUtente = (u) => {
    setUtenteSelecionado(u);
    setMainMenu('ficha');
    setMensagem('');
  };

  /**
   * Prepara o formulário para edição de um utente existente.
   * @param {Object} u - Objeto do utente.
   */
  const prepararEdicao = (u) => {
    setUtenteSelecionado(u);
    setNovoUtente({ ...u });
    setMainMenu('criar');
  };

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Envia os dados do utente (Criação ou Edição) para a API.
   */
  const criarOuEditarUtente = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    
    // Captura o identificador (Ajustado para cobrir num_utente ou id_utente)
    const numUtente = novoUtente.num_utente || novoUtente.id_utente || novoUtente.idutente;
    const isEditing = !!numUtente;
    
    // CORREÇÃO AQUI: As rotas foram corrigidas de acordo com o Swagger e a variável está certa
    const url = isEditing ? `${API_URL}/api/utentes/${numUtente}` : `${API_URL}/api/utentes/`;
    
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUtente),
      });
      
      if (!res.ok) throw new Error(textos.receptionist.erroProcessamento);
      
      setMensagem(isEditing ? textos.receptionist.sucessoUpdate : textos.receptionist.sucessoCriar);
      setNovoUtente({ nome: '', nif: '', data_nascimento: '', sexo: 'M', telefone: '', email: '', morada: '' });
      await carregarTudo();
      setMainMenu('pesquisar');
    } catch (e) {
      setErro(e.message);
    }
  };

  /**
   * Cria um novo episódio de urgência para o utente selecionado.
   */
  const abrirEpisodio = async () => {
    if (!utenteSelecionado) return;
    try {
      // CORREÇÃO AQUI: Rota atualizada para /api/episodios/ sem texto extra
      const res = await fetch(`${API_URL}/api/episodios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Garante que manda o identificador correto do utente
          utente_id: utenteSelecionado.num_utente || utenteSelecionado.id_utente || utenteSelecionado.idutente,
          motivo: novoEpisodio.motivo,
          observacao: novoEpisodio.observacao,
        }),
      });
      
      if (!res.ok) throw new Error(textos.receptionist.erroEpisodio);
      
      setMensagem(textos.receptionist.sucessoEpisodio);
      setNovoEpisodio({ motivo: '', observacao: '' });
      await carregarTudo();
    } catch (e) { 
      setErro(e.message); 
    }
  };

  const fazerLogout = () => {
    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  /**
   * Renderiza o conteúdo central baseado no estado do mainMenu.
   */
  const renderCenter = () => {
    if (loading) return <p role="status">{textos.geral.aCarregar}</p>;

    switch (mainMenu) {
      case 'pesquisar':
        return (
          <section className="admin-panel-section" aria-labelledby="title-pesquisar">
            <div className="admin-panel-section__header">
              <h2 id="title-pesquisar">{textos.receptionist.pesquisarUtente}</h2>
            </div>
            <div className="admin-toolbar admin-toolbar--left">
              <button type="button" className="admin-primary-big-button" onClick={() => {
                setNovoUtente({ nome: '', nif: '', data_nascimento: '', sexo: 'M', telefone: '', email: '', morada: '' });
                setMainMenu('criar');
              }}>
                {textos.receptionist.novoUtente}
              </button>
            </div>
            <div className="admin-form__group">
              <label htmlFor="search-input">{textos.receptionist.pesquisaRapida}</label>
              <input id="search-input" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder={textos.receptionist.placeholderPesquisa} />
            </div>
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-scroll admin-table-scroll--employees">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{textos.receptionist.nome}</th>
                      <th>{textos.receptionist.nif}</th>
                      <th>{textos.receptionist.sexo}</th>
                      <th>{textos.geral.acoes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utentesFiltrados.map((u) => (
                      <tr key={u.num_utente || u.id_utente || u.idutente}>
                        <td>{u.nome}</td>
                        <td>{u.nif}</td>
                        <td>{u.sexo}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => selecionarUtente(u)} style={{ marginRight: '8px' }}>
                            {textos.receptionist.verFicha}
                          </button>
                          <button type="button" className="admin-secondary-button" onClick={() => prepararEdicao(u)}>
                            {textos.geral.editar}
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

      case 'criar':
        return (
          <section className="admin-panel-section" aria-labelledby="title-criar">
            <div className="admin-panel-section__header">
              <h2 id="title-criar">{novoUtente.num_utente || novoUtente.id_utente || novoUtente.idutente ? textos.geral.editar : textos.receptionist.novoUtente}</h2>
            </div>
            <form className="admin-form" onSubmit={criarOuEditarUtente}>
              <div className="admin-form__grid">
                <div className="admin-form__group"><label>{textos.receptionist.nome}</label><input name="nome" value={novoUtente.nome} onChange={(e) => handleInputChange(e, setNovoUtente)} required /></div>
                <div className="admin-form__group"><label>{textos.receptionist.nif}</label><input name="nif" value={novoUtente.nif} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
                <div className="admin-form__group"><label>{textos.receptionist.dataNascimento}</label><input type="date" name="data_nascimento" value={novoUtente.data_nascimento} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
                <div className="admin-form__group">
                  <label>{textos.receptionist.sexo}</label>
                  <select name="sexo" value={novoUtente.sexo} onChange={(e) => handleInputChange(e, setNovoUtente)}>
                    <option value="M">M</option><option value="F">F</option>
                  </select>
                </div>
                <div className="admin-form__group"><label>{textos.receptionist.telefone}</label><input name="telefone" value={novoUtente.telefone} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
                <div className="admin-form__group"><label>{textos.receptionist.email}</label><input name="email" value={novoUtente.email} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
                <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}><label>{textos.receptionist.morada}</label><input name="morada" value={novoUtente.morada} onChange={(e) => handleInputChange(e, setNovoUtente)} /></div>
              </div>
              <div className="admin-actions-row">
                <button className="admin-form__submit" type="submit">{textos.geral.guardar}</button>
                <button className="admin-secondary-button" type="button" onClick={() => setMainMenu('pesquisar')}>{textos.geral.cancelar}</button>
              </div>
            </form>
          </section>
        );

      case 'ficha':
        return (
          <section className="admin-panel-section" aria-labelledby="title-ficha">
            <div className="admin-panel-section__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="title-ficha">{textos.receptionist.fichaBase}</h2>
              {utenteSelecionado && (
                <button type="button" className="admin-primary-big-button" onClick={() => prepararEdicao(utenteSelecionado)}>
                  {textos.geral.editar}
                </button>
              )}
            </div>
            {utenteSelecionado ? (
              <div className="admin-table-card">
                <p><strong>{textos.receptionist.nome}:</strong> {utenteSelecionado.nome}</p>
                <p><strong>{textos.receptionist.nif}:</strong> {utenteSelecionado.nif || '—'}</p>
                <p><strong>{textos.receptionist.telefone}:</strong> {utenteSelecionado.telefone || '—'}</p>
                <p><strong>{textos.receptionist.email}:</strong> {utenteSelecionado.email || '—'}</p>
                <p><strong>{textos.receptionist.morada}:</strong> {utenteSelecionado.morada || '—'}</p>
              </div>
            ) : <p>{textos.receptionist.selecionaUtente}</p>}
          </section>
        );

      case 'episodio':
        return (
          <section className="admin-panel-section" aria-labelledby="title-episodio">
            <div className="admin-panel-section__header"><h2 id="title-episodio">{textos.receptionist.menuEpisodio}</h2></div>
            <p>{utenteSelecionado ? `${textos.receptionist.utente}: ${utenteSelecionado.nome}` : textos.receptionist.selecionaPrimeiro}</p>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label>{textos.receptionist.motivo}</label><input name="motivo" value={novoEpisodio.motivo} onChange={(e) => handleInputChange(e, setNovoEpisodio)} /></div>
              <div className="admin-form__group"><label>{textos.receptionist.observacao}</label><input name="observacao" value={novoEpisodio.observacao} onChange={(e) => handleInputChange(e, setNovoEpisodio)} /></div>
            </div>
            <div className="admin-actions-row">
              <button className="admin-form__submit" type="button" onClick={abrirEpisodio} disabled={!utenteSelecionado}>{textos.receptionist.abrirEpisodioBtn}</button>
            </div>
          </section>
        );

      default: // recentes
        return (
          <section className="admin-panel-section" aria-labelledby="title-recentes">
            <div className="admin-panel-section__header">
              <h2 id="title-recentes">{textos.receptionist.episodiosRecentes}</h2>
            </div>
            <div className="admin-form__group" style={{ marginBottom: '20px' }}>
              <label htmlFor="search-episodes">{textos.receptionist.pesquisaEpisodios}</label>
              <input id="search-episodes" value={filtroEpisodios} onChange={(e) => setFiltroEpisodios(e.target.value)} placeholder={textos.receptionist.placeholderEpisodios} />
            </div>
            <div className="admin-table-card admin-table-card--full">
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{textos.receptionist.utente}</th>
                      <th>{textos.receptionist.entrada}</th>
                      <th>{textos.receptionist.estado}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {episodiosFiltrados.map((ep) => (
                      <tr key={ep.cod_ep_urgenc || ep.id_epurgencia || ep.id}>
                        <td>{ep.nome_utente || ep.utente_nome || '—'}</td>
                        <td>{ep.datahoraentr || ep.datahora || '—'}</td>
                        <td>{ep.estado || textos.receptionist.estadoAberto}</td>
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
      <aside className="admin-sidebar" role="navigation" aria-label={textos.receptionist.ariaSidebar}>
        <button 
          type="button" 
          className="admin-sidebar__toggle" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label={textos.receptionist.ariaToggleSidebar}
        >
          <IconMenu />
        </button>
        <div className="admin-sidebar__brand">
          <img src={logo} alt="SIAGUH Logo" className="admin-sidebar__logo" />
        </div>
        <div className="admin-sidebar__divider" />
        
        <button type="button" className="admin-sidebar__profile" onClick={abrirPerfilUtilizador} aria-label={textos.receptionist.ariaPerfil}>
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">{iniciaisUtilizador}</div>
          <span className="admin-sidebar__profile-name">{nomeExibicao}</span>
        </button>
        
        <div className="admin-sidebar__divider" />
        <nav className="admin-sidebar__nav">
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'pesquisar' ? 'is-active' : ''}`} onClick={() => setMainMenu('pesquisar')}>
            <IconSearch /><span className="link-text">{textos.receptionist.menuPesquisar}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'episodio' ? 'is-active' : ''}`} onClick={() => setMainMenu('episodio')}>
            <IconFolder /><span className="link-text">{textos.receptionist.menuEpisodio}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'recentes' ? 'is-active' : ''}`} onClick={() => setMainMenu('recentes')}>
            <IconClock /><span className="link-text">{textos.receptionist.menuRecentes}</span>
          </button>
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')} aria-pressed={idioma === 'pt'}>PT</button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')} aria-pressed={idioma === 'en'}>EN</button>
          </div>
          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <IconExit /><span className="link-text">{textos.geral.sair}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper" role="region" aria-labelledby="dashboard-title">
        <div className="admin-content-inner">
          <div className="admin-content-top">
            <h1 id="dashboard-title">{textos.receptionist.tituloPainel}</h1>
            <p>{textos.receptionist.descricaoPainel}</p>
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