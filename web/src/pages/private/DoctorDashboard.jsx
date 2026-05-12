import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import '../../styles/doctor-dashboard.css';
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

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 3 2 4-5" />
  </svg>
);

const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconQueue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="4" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <rect x="4" y="16" width="16" height="4" rx="1" />
  </svg>
);

const IconFolder = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </svg>
);

const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
);

const IconPill = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.5 20.5L3.5 13.5a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 1 1-7 7z" />
    <path d="M8 8l8 8" />
  </svg>
);

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('kpis');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [prescricao, setPrescricao] = useState({
    medicamento: '',
    dosagem: '',
    duracao: '',
    via: '',
  });
  const [alta, setAlta] = useState({
    destino: 'alta',
    observacoes: '',
    internamento_destino: '',
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
    carregarEpisodios();
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

  const carregarEpisodios = async () => {
    try {
      setErro('');
      const res = await fetch(`${API_URL}/api/triagens`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao carregar episódios.');
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(e.message);
      setEpisodios([]);
    }
  };

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) =>
      normalizar(
        [
          ep.nome_utente,
          ep.id_epurgencia || ep.id,
          ep.cor_triagem,
          ep.tempo_espera,
        ].join(' ')
      ).includes(normalizar(filtro))
    );
  }, [episodios, filtro]);

  const abrirEpisodio = async (ep) => {
    setEpisodioSelecionado(ep);
    setMainMenu('detalhe');
    setErro('');
    setMensagem('');

    try {
      const utenteId = ep.id_utente || ep.idutente;
      const [uRes, aRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/${utenteId}`),
        fetch(`${API_URL}/api/alertas/${utenteId}`),
        fetch(`${API_URL}/api/medicacaoativa/${utenteId}`),
      ]);

      const uData = await uRes.json();
      const aData = await aRes.json();
      const mData = await mRes.json();

      if (!uRes.ok) throw new Error(uData?.detail || 'Erro ao carregar utente.');
      if (!aRes.ok) throw new Error(aData?.detail || 'Erro ao carregar alertas.');
      if (!mRes.ok) throw new Error(mData?.detail || 'Erro ao carregar medicação.');

      setUtente(uData || null);
      setAlertas(Array.isArray(aData) ? aData : []);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
    } catch (e) {
      setErro(e.message);
    }
  };

  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({ ...prev, [name]: value }));
  };

  const handleAltaChange = (e) => {
    const { name, value } = e.target;
    setAlta((prev) => ({ ...prev, [name]: value }));
  };

  const adicionarPrescricao = async (e) => {
    e.preventDefault();
    try {
      setMensagem('');
      setErro('');

      const res = await fetch(`${API_URL}/api/prescricoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_utente: utente?.id_utente || utente?.idutente,
          ...prescricao,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao criar prescrição.');

      setMensagem('Prescrição registada com sucesso.');
      setPrescricao({ medicamento: '', dosagem: '', duracao: '', via: '' });
      await carregarEpisodios();
    } catch (e) {
      setErro(e.message);
    }
  };

  const registarAlta = async (e) => {
    e.preventDefault();
    try {
      setMensagem('');
      setErro('');

      const episodioId = episodioSelecionado?.id_epurgencia || episodioSelecionado?.id;
      const res = await fetch(`${API_URL}/api/episodios/${episodioId}/alta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alta),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao registar alta.');

      setMensagem('Alta ou internamento registado com sucesso.');
      await carregarEpisodios();
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
    if (mainMenu === 'kpis') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.kpisTitulo || 'Resumo clínico'}</h2>
            <p>{textos?.doctor?.kpisDesc || 'Visão rápida dos episódios triados e estado atual.'}</p>
          </div>

          <div className="admin-report-grid">
            <div className="admin-report-card">
              <h3>{textos?.doctor?.episodiosTriados || 'Episódios triados'}</h3>
              <strong>{episodios.length}</strong>
            </div>
            <div className="admin-report-card">
              <h3>{textos?.doctor?.emEspera || 'Em espera'}</h3>
              <strong>{episodios.filter((ep) => !ep.atendido).length}</strong>
            </div>
            <div className="admin-report-card">
              <h3>{textos?.doctor?.altasHoje || 'Altas hoje'}</h3>
              <strong>{episodios.filter((ep) => ep.alta).length}</strong>
            </div>
            <div className="admin-report-card">
              <h3>{textos?.doctor?.internamentos || 'Internamentos'}</h3>
              <strong>{episodios.filter((ep) => ep.internamento).length}</strong>
            </div>
          </div>
        </section>
      );
    }

    if (mainMenu === 'medias') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.temposMedios || 'Tempos médios por cor'}</h2>
          </div>

          <div className="admin-table-card admin-table-card--full">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{textos?.doctor?.cor || 'Cor'}</th>
                  <th>{textos?.doctor?.tempoMedio || 'Tempo médio'}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Vermelho</td><td>—</td></tr>
                <tr><td>Amarelo</td><td>—</td></tr>
                <tr><td>Verde</td><td>—</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (mainMenu === 'fila') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.filaPrioridade || 'Fila resumida por prioridade'}</h2>
          </div>

          <div className="admin-form__group">
            <label>{textos?.geral?.pesquisar || 'Pesquisar'}</label>
            <input
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder={textos?.doctor?.placeholderPesquisa || 'Utente, cor, episódio...'}
            />
          </div>

          <div className="admin-table-card admin-table-card--full">
            <div className="admin-table-card__header">
              <h3>{textos?.doctor?.episodios || 'Episódios'}</h3>
              <span>{episodiosFiltrados.length}</span>
            </div>
            <div className="admin-table-scroll admin-table-scroll--employees">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.doctor?.utente || 'Utente'}</th>
                    <th>{textos?.doctor?.cor || 'Cor'}</th>
                    <th>{textos?.doctor?.espera || 'Espera'}</th>
                    <th>{textos?.doctor?.acao || 'Ação'}</th>
                  </tr>
                </thead>
                <tbody>
                  {episodiosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td>
                    </tr>
                  ) : (
                    episodiosFiltrados.map((ep) => (
                      <tr key={ep.id_epurgencia || ep.id}>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.cor_triagem || '—'}</td>
                        <td>{ep.tempo_espera || '—'}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>
                            {textos?.doctor?.atender || 'Atender'}
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

    if (mainMenu === 'episodios') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.episodiosTriadosLista || 'Episódios triados'}</h2>
          </div>

          <div className="admin-table-card admin-table-card--full">
            <div className="admin-table-card__header">
              <h3>{textos?.doctor?.listaCompleta || 'Lista completa'}</h3>
              <span>{episodios.length}</span>
            </div>
            <div className="admin-table-scroll admin-table-scroll--employees">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.doctor?.episodio || 'Episódio'}</th>
                    <th>{textos?.doctor?.utente || 'Utente'}</th>
                    <th>{textos?.doctor?.gravidade || 'Gravidade'}</th>
                    <th>{textos?.doctor?.espera || 'Espera'}</th>
                    <th>{textos?.geral?.acoes || 'Ações'}</th>
                  </tr>
                </thead>
                <tbody>
                  {episodios.length === 0 ? (
                    <tr>
                      <td colSpan="5">{textos?.geral?.semResultados || 'Sem resultados'}</td>
                    </tr>
                  ) : (
                    episodios.map((ep) => (
                      <tr key={ep.id_epurgencia || ep.id}>
                        <td>{ep.id_epurgencia || ep.id}</td>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.cor_triagem || '—'}</td>
                        <td>{ep.tempo_espera || '—'}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>
                            {textos?.doctor?.abrirDetalhe || 'Abrir detalhe'}
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

    if (mainMenu === 'detalhe') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.detalheCompleto || 'Detalhe completo do episódio'}</h2>
          </div>

          {episodioSelecionado ? (
            <>
              <div className="admin-table-card">
                <p><strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}</p>
                <p><strong>{textos?.doctor?.cor || 'Cor'}:</strong> {episodioSelecionado.cor_triagem || '—'}</p>
                <p><strong>{textos?.doctor?.espera || 'Espera'}:</strong> {episodioSelecionado.tempo_espera || '—'}</p>
              </div>

              <div className="admin-table-card" style={{ marginTop: '1rem' }}>
                <h3>{textos?.doctor?.alertas || 'Alertas'}</h3>
                {alertas.length > 0 ? (
                  alertas.map((a, i) => <p key={i}>{a.descricao || a.mensagem || '—'}</p>)
                ) : (
                  <p>{textos?.doctor?.semAlertas || 'Sem alertas registados.'}</p>
                )}
              </div>

              <div className="admin-table-card" style={{ marginTop: '1rem' }}>
                <h3>{textos?.doctor?.medicacaoAtiva || 'Medicação ativa'}</h3>
                {medicacaoAtiva.length > 0 ? (
                  <ul>
                    {medicacaoAtiva.map((m, i) => (
                      <li key={i}>{m.nome || '—'} — {m.dosagem || '—'}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{textos?.doctor?.semMedicacao || 'Sem medicação ativa.'}</p>
                )}
              </div>
            </>
          ) : (
            <p>{textos?.doctor?.selecionaTriado || 'Seleciona um episódio triado.'}</p>
          )}
        </section>
      );
    }

    if (mainMenu === 'prescricao') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos?.doctor?.prescricao || 'Prescrição'}</h2>
          </div>

          <form className="admin-form" onSubmit={adicionarPrescricao}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>{textos?.doctor?.medicamento || 'Medicamento'}</label>
                <input name="medicamento" value={prescricao.medicamento} onChange={handlePrescricaoChange} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.doctor?.dosagem || 'Dosagem'}</label>
                <input name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.doctor?.duracao || 'Duração'}</label>
                <input name="duracao" value={prescricao.duracao} onChange={handlePrescricaoChange} />
              </div>
              <div className="admin-form__group">
                <label>{textos?.doctor?.via || 'Via'}</label>
                <input name="via" value={prescricao.via} onChange={handlePrescricaoChange} />
              </div>
            </div>

            <div className="admin-actions-row">
              <button className="admin-form__submit" type="submit">
                {textos?.doctor?.fazerPrescricao || 'Fazer prescrição'}
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.doctor?.altaInternamento || 'Alta ou internamento'}</h2>
        </div>

        <form className="admin-form" onSubmit={registarAlta}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>{textos?.doctor?.destino || 'Destino'}</label>
              <select name="destino" value={alta.destino} onChange={handleAltaChange}>
                <option value="alta">{textos?.doctor?.alta || 'Alta'}</option>
                <option value="internamento">{textos?.doctor?.internamento || 'Internamento'}</option>
              </select>
            </div>

            <div className="admin-form__group">
              <label>{textos?.doctor?.destinoInternamento || 'Destino internamento'}</label>
              <input
                name="internamento_destino"
                value={alta.internamento_destino}
                onChange={handleAltaChange}
              />
            </div>

            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>{textos?.doctor?.observacoes || 'Observações'}</label>
              <textarea name="observacoes" value={alta.observacoes} onChange={handleAltaChange} />
            </div>
          </div>

          <div className="admin-actions-row">
            <button className="admin-form__submit" type="submit">
              {textos?.doctor?.confirmar || 'Confirmar'}
            </button>
          </div>
        </form>
      </section>
    );
  };

  return (
    <main className={`admin-layout doctor-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
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
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'kpis' ? 'is-active' : ''}`} onClick={() => setMainMenu('kpis')}>
            <IconChart />
            <span className="link-text">{textos?.doctor?.menuKpis || 'KPIs'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'medias' ? 'is-active' : ''}`} onClick={() => setMainMenu('medias')}>
            <IconClock />
            <span className="link-text">{textos?.doctor?.menuMedias || 'Tempos médios'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'fila' ? 'is-active' : ''}`} onClick={() => setMainMenu('fila')}>
            <IconQueue />
            <span className="link-text">{textos?.doctor?.menuFila || 'Fila por prioridade'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'episodios' ? 'is-active' : ''}`} onClick={() => setMainMenu('episodios')}>
            <IconFolder />
            <span className="link-text">{textos?.doctor?.menuEpisodios || 'Episódios triados'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'detalhe' ? 'is-active' : ''}`} onClick={() => setMainMenu('detalhe')}>
            <IconClipboard />
            <span className="link-text">{textos?.doctor?.menuDetalhe || 'Detalhe completo'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'prescricao' ? 'is-active' : ''}`} onClick={() => setMainMenu('prescricao')}>
            <IconPill />
            <span className="link-text">{textos?.doctor?.menuPrescricao || 'Prescrição'}</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'alta' ? 'is-active' : ''}`} onClick={() => setMainMenu('alta')}>
            <IconExit />
            <span className="link-text">{textos?.doctor?.menuAlta || 'Alta / internamento'}</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')}>
              PT
            </button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')}>
              EN
            </button>
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
            <h1>{textos?.doctor?.tituloPainel || 'Dashboard Médico'}</h1>
            <p>{textos?.doctor?.descricaoPainel || 'Prioridade, detalhe clínico completo, prescrição e decisão final.'}</p>
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