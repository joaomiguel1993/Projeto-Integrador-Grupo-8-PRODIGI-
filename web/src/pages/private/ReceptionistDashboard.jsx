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

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const IconUserPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M17 11h6" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const IconDoor = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 21h16" />
    <path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    <path d="M10 12h.01" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('pesquisar');
  const [utentes, setUtentes] = useState([]);
  const [episodios, setEpisodios] = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);
  const [novoUtente, setNovoUtente] = useState({
    nome: '',
    nif: '',
    data_nascimento: '',
    sexo: 'M',
    telefone: '',
    email: '',
    morada: '',
  });
  const [novoEpisodio, setNovoEpisodio] = useState({
    motivo: '',
    observacao: '',
  });

  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const nomeUtilizador =
    utilizadorLogado?.nome ||
    utilizadorLogado?.name ||
    utilizadorLogado?.username ||
    'Utilizador';

  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

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
    const userId =
      utilizadorLogado?.id_utilizador ||
      utilizadorLogado?.idutilizador ||
      utilizadorLogado?.id_user ||
      utilizadorLogado?.id ||
      utilizadorLogado?.utilizador_id;

    if (userId) navigate(`/perfil/${userId}`);
    else navigate('/perfil');
  };

  const carregarTudo = async () => {
    setLoading(true);
    setErro('');
    try {
      const [uRes, eRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes`),
        fetch(`${API_URL}/api/episodios/recentes`),
      ]);

      const uData = await uRes.json();
      const eData = await eRes.json();

      if (!uRes.ok) throw new Error(uData?.detail || 'Erro ao carregar utentes.');
      if (!eRes.ok) throw new Error(eData?.detail || 'Erro ao carregar episódios.');

      setUtentes(Array.isArray(uData) ? uData : []);
      setEpisodios(Array.isArray(eData) ? eData : []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar dados.');
      setUtentes([]);
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  const utentesFiltrados = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.numero_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtro));
    });
  }, [utentes, filtro]);

  const selecionarUtente = (u) => {
    setUtenteSelecionado(u);
    setMainMenu('ficha');
    setMensagem('');
    setErro('');
  };

  const handleNovoUtenteChange = (e) => {
    const { name, value } = e.target;
    setNovoUtente((prev) => ({ ...prev, [name]: value }));
  };

  const handleNovoEpisodioChange = (e) => {
    const { name, value } = e.target;
    setNovoEpisodio((prev) => ({ ...prev, [name]: value }));
  };

  const criarUtente = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/utentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUtente),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao criar utente.');

      setMensagem('Utente criado com sucesso.');
      setNovoUtente({
        nome: '',
        nif: '',
        data_nascimento: '',
        sexo: 'M',
        telefone: '',
        email: '',
        morada: '',
      });
      await carregarTudo();
      setMainMenu('pesquisar');
    } catch (e) {
      setErro(e.message);
    }
  };

  const darEntrada = async () => {
    if (!utenteSelecionado) return;

    if (!hospitalAtivo) {
      setErro('Não existe hospital ativo selecionado.');
      return;
    }

    setMensagem('');
    setErro('');

    try {
      const res = await fetch(`${API_URL}/api/epurgencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: utenteSelecionado.id_utente || utenteSelecionado.idutente,
          hospital_id: hospitalAtivo?.id_hosp || hospitalAtivo?.idhosp || hospitalAtivo?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao dar entrada.');

      setMensagem('Entrada registada com sucesso.');
      await carregarTudo();
    } catch (e) {
      setErro(e.message);
    }
  };

  const abrirEpisodio = async () => {
    if (!utenteSelecionado) return;

    setMensagem('');
    setErro('');

    try {
      const res = await fetch(`${API_URL}/api/epurgencia/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utente_id: utenteSelecionado.id_utente || utenteSelecionado.idutente,
          motivo: novoEpisodio.motivo,
          observacao: novoEpisodio.observacao,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao abrir episódio.');

      setMensagem('Episódio aberto com sucesso.');
      setNovoEpisodio({ motivo: '', observacao: '' });
      await carregarTudo();
    } catch (e) {
      setErro(e.message);
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('hospitalAtivo');
    navigate('/login', { replace: true });
  };

  const renderCenter = () => {
    if (loading) return <p>{textos?.geral?.aCarregar || 'A carregar...'}</p>;

    if (mainMenu === 'pesquisar') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.receptionist?.pesquisarUtente || 'Pesquisar utente'}</h2>
          </div>

          <div className="admin-toolbar admin-toolbar--left">
            <button type="button" className="admin-primary-big-button" onClick={() => setMainMenu('criar')}>
              {textos?.receptionist?.novoUtente || 'Novo utente'}
            </button>
          </div>

          <div className="admin-form__group">
            <label>{textos?.receptionist?.pesquisaRapida || 'Pesquisa rápida'}</label>
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder={textos?.receptionist?.placeholderPesquisa || 'Nome, NIF, número de utente...'}
            />
          </div>

          <div className="admin-table-card admin-table-card--full">
            <div className="admin-table-card__header">
              <h3>{textos?.receptionist?.utentes || 'Utentes'}</h3>
              <span>{utentesFiltrados.length}</span>
            </div>
            <div className="admin-table-scroll admin-table-scroll--employees">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.receptionist?.nome || 'Nome'}</th>
                    <th>NIF</th>
                    <th>{textos?.receptionist?.sexo || 'Sexo'}</th>
                    <th>{textos?.geral?.acoes || 'Ações'}</th>
                  </tr>
                </thead>
                <tbody>
                  {utentesFiltrados.length > 0 ? (
                    utentesFiltrados.map((u) => (
                      <tr key={u.id_utente || u.idutente}>
                        <td>{u.nome}</td>
                        <td>{u.nif}</td>
                        <td>{u.sexo}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => selecionarUtente(u)}>
                            {textos?.receptionist?.verFicha || 'Ver ficha'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">{textos?.receptionist?.nenhumUtente || 'Nenhum utente encontrado.'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    if (mainMenu === 'criar') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.receptionist?.novoUtente || 'Novo utente'}</h2>
          </div>

          <form className="admin-form" onSubmit={criarUtente}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>{textos?.receptionist?.nome || 'Nome'}</label>
                <input name="nome" value={novoUtente.nome} onChange={handleNovoUtenteChange} required />
              </div>
              <div className="admin-form__group">
                <label>NIF</label>
                <input name="nif" value={novoUtente.nif} onChange={handleNovoUtenteChange} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.dataNascimento || 'Data nascimento'}</label>
                <input type="date" name="data_nascimento" value={novoUtente.data_nascimento} onChange={handleNovoUtenteChange} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.sexo || 'Sexo'}</label>
                <select name="sexo" value={novoUtente.sexo} onChange={handleNovoUtenteChange}>
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label>{textos?.receptionist?.telefone || 'Telefone'}</label>
                <input name="telefone" value={novoUtente.telefone} onChange={handleNovoUtenteChange} />
              </div>
              <div className="admin-form__group">
                <label>Email</label>
                <input name="email" value={novoUtente.email} onChange={handleNovoUtenteChange} />
              </div>
              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>{textos?.receptionist?.morada || 'Morada'}</label>
                <input name="morada" value={novoUtente.morada} onChange={handleNovoUtenteChange} />
              </div>
            </div>

            <div className="admin-actions-row">
              <button className="admin-form__submit" type="submit">{textos?.receptionist?.criarUtente || 'Criar utente'}</button>
              <button className="admin-secondary-button" type="button" onClick={() => setMainMenu('pesquisar')}>
                {textos?.geral?.cancelar || 'Cancelar'}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (mainMenu === 'ficha') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.receptionist?.fichaBase || 'Ficha base do utente'}</h2>
          </div>

          {utenteSelecionado ? (
            <div className="admin-table-card">
              <p><strong>{textos?.receptionist?.nome || 'Nome'}:</strong> {utenteSelecionado.nome}</p>
              <p><strong>NIF:</strong> {utenteSelecionado.nif || '—'}</p>
              <p><strong>{textos?.receptionist?.telefone || 'Telefone'}:</strong> {utenteSelecionado.telefone || '—'}</p>
              <p><strong>Email:</strong> {utenteSelecionado.email || '—'}</p>
              <p><strong>{textos?.receptionist?.morada || 'Morada'}:</strong> {utenteSelecionado.morada || '—'}</p>
            </div>
          ) : (
            <p>{textos?.receptionist?.selecionaPesquisa || 'Seleciona um utente na pesquisa.'}</p>
          )}
        </section>
      );
    }

    if (mainMenu === 'entrada') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.receptionist?.darEntrada || 'Dar entrada no hospital'}</h2>
          </div>

          <p>{utenteSelecionado ? `Utente selecionado: ${utenteSelecionado.nome}` : (textos?.receptionist?.selecionaPrimeiro || 'Seleciona um utente primeiro.')}</p>

          <div className="admin-actions-row">
            <button className="admin-form__submit" type="button" onClick={darEntrada} disabled={!utenteSelecionado}>
              {textos?.receptionist?.darEntrada || 'Dar entrada'}
            </button>
          </div>
        </section>
      );
    }

    if (mainMenu === 'episodio') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.receptionist?.abrirEpisodio || 'Abrir episódio de urgência'}</h2>
          </div>

          <p>{utenteSelecionado ? `Utente selecionado: ${utenteSelecionado.nome}` : (textos?.receptionist?.selecionaPrimeiro || 'Seleciona um utente primeiro.')}</p>

          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>{textos?.receptionist?.motivo || 'Motivo'}</label>
              <input name="motivo" value={novoEpisodio.motivo} onChange={handleNovoEpisodioChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.receptionist?.observacao || 'Observação'}</label>
              <input name="observacao" value={novoEpisodio.observacao} onChange={handleNovoEpisodioChange} />
            </div>
          </div>

          <div className="admin-actions-row">
            <button className="admin-form__submit" type="button" onClick={abrirEpisodio} disabled={!utenteSelecionado}>
              {textos?.receptionist?.abrirEpisodio || 'Abrir episódio'}
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.receptionist?.episodiosRecentes || 'Episódios recentes'}</h2>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>{hospitalAtivo?.nome || textos?.receptionist?.hospitalAtivo || 'Hospital ativo'}</h3>
          </div>
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
                {episodios.length > 0 ? (
                  episodios.map((ep) => (
                    <tr key={ep.id_epurgencia || ep.id}>
                      <td>{ep.nome_utente || ep.utente_nome || '—'}</td>
                      <td>{ep.datahoraentr || ep.datahora || '—'}</td>
                      <td>{ep.estado || 'Aberto'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">{textos?.receptionist?.semEpisodios || 'Sem episódios recentes.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className={`admin-layout receptionist-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label="Alternar menu lateral"
        >
          <IconMenu />
        </button>

        <div className="admin-sidebar__brand">
          <img src={logo} alt="SIAGUH" className="admin-sidebar__logo" />
        </div>

        <div className="admin-sidebar__divider" />

        <button type="button" className="admin-sidebar__profile" onClick={abrirPerfilUtilizador}>
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">{iniciaisUtilizador}</div>
          <span className="admin-sidebar__profile-name">{nomeUtilizador}</span>
        </button>

        <div className="admin-sidebar__divider" />

        <nav className="admin-sidebar__nav">
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'pesquisar' ? 'is-active' : ''}`} onClick={() => setMainMenu('pesquisar')}>
            <IconSearch />
            <span className="link-text">{textos?.receptionist?.menuPesquisar || 'Pesquisar utente'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'criar' ? 'is-active' : ''}`} onClick={() => setMainMenu('criar')}>
            <IconUserPlus />
            <span className="link-text">{textos?.receptionist?.menuCriar || 'Criar utente'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'ficha' ? 'is-active' : ''}`} onClick={() => setMainMenu('ficha')}>
            <IconUser />
            <span className="link-text">{textos?.receptionist?.menuFicha || 'Ficha base'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'entrada' ? 'is-active' : ''}`} onClick={() => setMainMenu('entrada')}>
            <IconDoor />
            <span className="link-text">{textos?.receptionist?.menuEntrada || 'Dar entrada'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'episodio' ? 'is-active' : ''}`} onClick={() => setMainMenu('episodio')}>
            <IconFolder />
            <span className="link-text">{textos?.receptionist?.menuEpisodio || 'Abrir episódio'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'recentes' ? 'is-active' : ''}`} onClick={() => setMainMenu('recentes')}>
            <IconClock />
            <span className="link-text">{textos?.receptionist?.menuRecentes || 'Entradas recentes'}</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')}>PT</button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')}>EN</button>
          </div>

          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <IconExit />
            <span className="link-text">{textos?.geral?.sair || 'Sair'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper">
        <div className="admin-content-inner">
          <div className="admin-content-top">
            <h1>{textos?.receptionist?.tituloPainel || 'Dashboard Rececionista'}</h1>
            <p>{textos?.receptionist?.descricaoPainel || 'Fluxo rápido de registo, admissão e abertura de episódio.'}</p>
          </div>

          <div className="admin-content-body">
            {erro && <p className="admin-form__error">{erro}</p>}
            {mensagem && <p className="admin-form__success">{mensagem}</p>}
            {renderCenter()}
          </div>
        </div>

        <FooterLayout />
      </section>
    </main>
  );
}