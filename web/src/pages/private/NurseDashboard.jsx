import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

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

const IconQueue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="4" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <rect x="4" y="16" width="16" height="4" rx="1" />
  </svg>
);

const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

const IconPill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7z" />
    <path d="M8 8l8 8" />
  </svg>
);

const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-4.35-9-8.5A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 9 7.5C19 16.65 12 21 12 21z" />
  </svg>
);

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('fila');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [triagem, setTriagem] = useState({
    tensao: '',
    pulso: '',
    temperatura: '',
    saturacao: '',
    dor: '',
    sintomas: '',
    cor_sugerida: '',
    observacoes: '',
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
    carregarFila();
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

  const carregarFila = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/v1/episodios`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao carregar fila.');
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(e.message);
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) =>
      normalizar(
        [ep.nome_utente, ep.nif_utente, ep.id_epurgencia || ep.id].join(' ')
      ).includes(normalizar(filtro))
    );
  }, [episodios, filtro]);

  const abrirEpisodio = async (ep) => {
    setEpisodioSelecionado(ep);
    setMainMenu('triagem');
    setErro('');
    setMensagem('');

    try {
      const utenteId = ep.num_utente || ep.numutente;
      const [uRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/utentes/${num_utente}`),
        fetch(`${API_URL}/api/v1/medicacaoativa/utente/${num_utente}`),
      ]);

      const uData = await uRes.json();
      const mData = await mRes.json();

      if (!uRes.ok) throw new Error(uData?.detail || 'Erro ao carregar utente.');
      if (!mRes.ok) throw new Error(mData?.detail || 'Erro ao carregar medicação.');

      setUtente(uData || null);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
    } catch (e) {
      setErro(e.message);
    }
  };

  const handleTriagemChange = (e) => {
    const { name, value } = e.target;
    setTriagem((prev) => ({ ...prev, [name]: value }));
  };

  const pedirSugestaoCor = async () => {
    try {
      setMensagem('');
      setErro('');

      const res = await fetch(`${API_URL}/api/v1/predict/tempos-espera/{id_hosp}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente, triagem }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao pedir sugestão.');

      setTriagem((prev) => ({
        ...prev,
        cor_sugerida: data?.cor_sugerida || data?.cor || prev.cor_sugerida,
      }));
    } catch (e) {
      setErro(e.message);
    }
  };

  const gravarTriagem = async (e) => {
    e.preventDefault();
    try {
      setMensagem('');
      setErro('');

      const res = await fetch(`${API_URL}/api/v1/triagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_episodio: episodioSelecionado?.id_episodio || episodioSelecionado?.id,
          ...triagem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao gravar triagem.');

      setMensagem('Triagem gravada com sucesso.');
      await carregarFila();
      setMainMenu('fila');
    } catch (e) {
      setErro(e.message);
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const renderCenter = () => {
    if (mainMenu === 'fila') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.nurse?.filaSemTriagem || 'Fila de episódios abertos sem triagem'}</h2>
          </div>

          <div className="admin-form__group">
            <label>{textos?.geral?.pesquisar || 'Pesquisa rápida'}</label>
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder={textos?.nurse?.placeholderPesquisa || 'Utente, NIF, episódio...'}
            />
          </div>

          <div className="admin-table-card admin-table-card--full">
            <div className="admin-table-card__header">
              <h3>{textos?.nurse?.episodios || 'Episódios'}</h3>
              <span>{episodiosFiltrados.length}</span>
            </div>
            <div className="admin-table-scroll admin-table-scroll--employees">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.nurse?.episodio || 'Episódio'}</th>
                    <th>{textos?.nurse?.utente || 'Utente'}</th>
                    <th>{textos?.nurse?.entrada || 'Entrada'}</th>
                    <th>{textos?.geral?.acoes || 'Ações'}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="4">{textos?.geral?.aCarregar || 'A carregar...'}</td></tr>
                  ) : episodiosFiltrados.length === 0 ? (
                    <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                  ) : (
                    episodiosFiltrados.map((ep) => (
                      <tr key={ep.id_epurgencia || ep.id}>
                        <td>{ep.id_epurgencia || ep.id}</td>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.datahoraentr || '—'}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>
                            {textos?.nurse?.abrir || 'Abrir'}
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
    }

    if (mainMenu === 'triagem') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.nurse?.abrirTriagem || 'Abrir episódio para triagem'}</h2>
          </div>

          {episodioSelecionado ? (
            <div className="admin-table-card">
              <p><strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}</p>
              <p><strong>{textos?.nurse?.entrada || 'Entrada'}:</strong> {episodioSelecionado.datahoraentr || '—'}</p>
              <div className="admin-actions-row">
                <button className="admin-form__submit" type="button" onClick={() => setMainMenu('ficha')}>
                  {textos?.nurse?.verFicha || 'Ver ficha'}
                </button>
                <button className="admin-secondary-button" type="button" onClick={() => setMainMenu('medicacao')}>
                  {textos?.nurse?.verMedicacao || 'Ver medicação'}
                </button>
              </div>
            </div>
          ) : (
            <p>{textos?.nurse?.selecionaFila || 'Seleciona um episódio na fila.'}</p>
          )}
        </section>
      );
    }

    if (mainMenu === 'ficha') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.nurse?.fichaUtente || 'Ficha do utente'}</h2>
          </div>

          {utente ? (
            <div className="admin-table-card">
              <p><strong>{textos?.nurse?.nome || 'Nome'}:</strong> {utente.nome || '—'}</p>
              <p><strong>NIF:</strong> {utente.nif || '—'}</p>
              <p><strong>{textos?.nurse?.dataNascimento || 'Data nascimento'}:</strong> {utente.data_nascimento || utente.data_nascimento || '—'}</p>
              <p><strong>{textos?.nurse?.alergias || 'Alergias'}:</strong> {utente.alergias || '—'}</p>
            </div>
          ) : (
            <p>{textos?.nurse?.abreEpisodioFicha || 'Abre um episódio para consultar a ficha.'}</p>
          )}
        </section>
      );
    }

    if (mainMenu === 'medicacao') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.nurse?.medicacaoAtiva || 'Medicação ativa'}</h2>
          </div>

          <div className="admin-table-card admin-table-card--full">
            <div className="admin-table-card__header">
              <h3>{textos?.nurse?.lista || 'Lista'}</h3>
              <span>{medicacaoAtiva.length}</span>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.nurse?.nome || 'Nome'}</th>
                    <th>{textos?.nurse?.posologia || 'Posologia'}</th>
                    <th>{textos?.nurse?.inicio || 'Início'}</th>
                    <th>{textos?.nurse?.fim || 'Fim'}</th>
                  </tr>
                </thead>
                <tbody>
                  {medicacaoAtiva.length === 0 ? (
                    <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                  ) : (
                    medicacaoAtiva.map((m, i) => (
                      <tr key={i}>
                        <td>{m.nome || '—'}</td>
                        <td>{m.dosagem || '—'}</td>
                        <td>{m.datainicio || '—'}</td>
                        <td>{m.datafim || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.nurse?.registarTriagem || 'Registar triagem'}</h2>
        </div>

        <form className="admin-form" onSubmit={gravarTriagem}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>{textos?.nurse?.tensao || 'Tensão'}</label>
              <input name="tensao" value={triagem.tensao} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.pulso || 'Pulso'}</label>
              <input name="pulso" value={triagem.pulso} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.temperatura || 'Temperatura'}</label>
              <input name="temperatura" value={triagem.temperatura} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.saturacao || 'Saturação'}</label>
              <input name="saturacao" value={triagem.saturacao} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.dor || 'Dor'}</label>
              <input name="dor" value={triagem.dor} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.corSugerida || 'Cor sugerida'}</label>
              <input name="cor_sugerida" value={triagem.cor_sugerida} onChange={handleTriagemChange} />
            </div>
            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>{textos?.nurse?.sintomas || 'Sintomas'}</label>
              <textarea name="sintomas" value={triagem.sintomas} onChange={handleTriagemChange} />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="button" className="admin-secondary-button" onClick={pedirSugestaoCor}>
              {textos?.nurse?.pedirSugestaoIa || 'Pedir sugestão IA'}
            </button>
            <button type="submit" className="admin-form__submit">
              {textos?.nurse?.gravarTriagem || 'Gravar triagem'}
            </button>
          </div>
        </form>
      </section>
    );
  };

  return (
    <main className={`admin-layout nurse-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
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
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'fila' ? 'is-active' : ''}`} onClick={() => setMainMenu('fila')}>
            <IconQueue />
            <span className="link-text">{textos?.nurse?.menuFila || 'Fila sem triagem'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'triagem' ? 'is-active' : ''}`} onClick={() => setMainMenu('triagem')}>
            <IconClipboard />
            <span className="link-text">{textos?.nurse?.menuTriagem || 'Abrir triagem'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'ficha' ? 'is-active' : ''}`} onClick={() => setMainMenu('ficha')}>
            <IconUser />
            <span className="link-text">{textos?.nurse?.menuFicha || 'Ficha do utente'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'medicacao' ? 'is-active' : ''}`} onClick={() => setMainMenu('medicacao')}>
            <IconPill />
            <span className="link-text">{textos?.nurse?.menuMedicacao || 'Medicação ativa'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'registo' ? 'is-active' : ''}`} onClick={() => setMainMenu('registo')}>
            <IconHeart />
            <span className="link-text">{textos?.nurse?.menuRegisto || 'Registar triagem'}</span>
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
            <h1>{textos?.nurse?.tituloPainel || 'Dashboard Enfermeiro'}</h1>
            <p>{textos?.nurse?.descricaoPainel || 'Fila de episódios, contexto clínico e triagem assistida.'}</p>
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