import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import { STORAGE_KEYS } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA  = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const TRIAGEM_VAZIA = {
  tensao: '',
  pulso: '',
  temperatura: '',
  saturacao: '',
  dor: '',
  sintomas: '',
  observacoes: '',
  cor_sugerida: '',
};

const CORES_MANCHESTER = [
  { valor: 'vermelho', label: 'Vermelho', hex: '#e53e3e' },
  { valor: 'laranja',  label: 'Laranja',  hex: '#dd6b20' },
  { valor: 'amarelo',  label: 'Amarelo',  hex: '#d69e2e' },
  { valor: 'verde',    label: 'Verde',    hex: '#38a169' },
  { valor: 'azul',     label: 'Azul',     hex: '#3182ce' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16M4 12h16M4 17h16" />
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
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);
const IconSpinner = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ animation: 'spin 1s linear infinite', display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>
    <circle cx="12" cy="12" r="10" strokeOpacity=".3" />
    <path d="M12 2a10 10 0 0 1 10 10" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const SvgSearch = () => (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

const SvgCheck = () => (
  <svg {...iconProps}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SvgInfo = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const SvgX = () => (
  <svg {...iconProps}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const SvgChevronLeft = () => (
  <svg {...iconProps}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const SvgChevronRight = () => (
  <svg {...iconProps}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const SvgFileText = () => (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M8 9h2" />
  </svg>
);

function IconButton({ icon, children, className = '', ...props }) {
  return (
    <button className={`admin-secondary-button ${className}`.trim()} {...props}>
      <span className="btn-icon">{icon}</span>
      <span className="btn-text">{children}</span>
    </button>
  );
}

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu]                     = useState('fila');
  const [episodios, setEpisodios]                   = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente]                         = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva]         = useState([]);
  const [loading, setLoading]                       = useState(false);
  const [loadingContexto, setLoadingContexto]       = useState(false);
  const [loadingIA, setLoadingIA]                   = useState(false);
  const [loadingGravar, setLoadingGravar]           = useState(false);
  const [erro, setErro]                             = useState('');
  const [mensagem, setMensagem]                     = useState('');
  const [filtro, setFiltro]                         = useState('');
  const [triagem, setTriagem]                       = useState(TRIAGEM_VAZIA);

  const utilizadorLogado = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const nomeUtilizador = utilizadorLogado?.nome || utilizadorLogado?.name || utilizadorLogado?.username || 'Utilizador';
  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  useEffect(() => { carregarFila(); }, []);

  // ── Navegação ──────────────────────────────────────────────────────────────

  const abrirPerfilUtilizador = () => {
    const userId =
      utilizadorLogado?.id_utilizador ||
      utilizadorLogado?.idutilizador  ||
      utilizadorLogado?.id_user       ||
      utilizadorLogado?.id            ||
      utilizadorLogado?.utilizador_id;
    navigate(userId ? `/perfil/${userId}` : '/perfil');
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // ── API calls ──────────────────────────────────────────────────────────────

  const carregarFila = async () => {
    setLoading(true);
    setErro('');
    try {
      const idHosp =
        utilizadorLogado?.id_hospital ||
        utilizadorLogado?.hospital_id ||
        utilizadorLogado?.idhosp;

      const url = idHosp
        ? `${API_URL}/api/v1/episodios/sem-triagem?id_hosp=${idHosp}`
        : `${API_URL}/api/v1/episodios/sem-triagem`;

      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao carregar episódios.');
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(e.message);
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  // EpisodioOut: cod_ep_urgenc, num_utent, id_hosp, data_hora_entr, estado
  const abrirEpisodio = async (ep) => {
    setEpisodioSelecionado(ep);
    setUtente(null);
    setMedicacaoAtiva([]);
    setTriagem(TRIAGEM_VAZIA);
    setErro('');
    setMensagem('');
    setMainMenu('triagem');

    const utenteId = ep.num_utent;
    if (!utenteId) return;

    setLoadingContexto(true);
    try {
      const [uRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/utentes/${utenteId}`),
        fetch(`${API_URL}/api/v1/medicacao-ativa/utente/${utenteId}`),
      ]);

      const uData = await uRes.json();
      const mData = await mRes.json();

      if (!uRes.ok) throw new Error(uData?.detail || 'Erro ao carregar utente.');
      if (!mRes.ok) throw new Error(mData?.detail || 'Erro ao carregar medicação.');

      setUtente(uData || null);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
      await carregarHistorico(num_utente);

      const codEp = ep.id_epurgencia || ep.id || ep.CodEpUrgenc || ep.cod_epurgenc;
      if (codEp) {
        const tRes = await fetch(`${API_URL}/api/v1/triagens/${codEp}`);
        if (tRes.ok) {
          const tData = await tRes.json();
          setTriagem((prev) => ({
            ...prev,
            tensao: tData?.sistolica && tData?.diastolica ? `${tData.sistolica}/${tData.diastolica}` : prev.tensao,
            pulso: tData?.freqcard || prev.pulso,
            temperatura: tData?.temperatura || prev.temperatura,
            saturacao: tData?.spo2 || prev.saturacao,
            dor: tData?.nivel_dor || prev.dor,
            sintomas: tData?.sintomas || prev.sintomas,
            cor_sugerida: tData?.cortriagem || prev.cor_sugerida,
          }));
        }
      }
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoadingContexto(false);
    }
  };

  const handleTriagemChange = (e) => {
    const { name, value } = e.target;
    setTriagem((prev) => ({ ...prev, [name]: value }));
  };

  const pedirSugestaoCor = async () => {
    setMensagem('');
    setErro('');
    setLoadingIA(true);
    try {
      const idHosp =
        utilizadorLogado?.id_hospital ||
        utilizadorLogado?.hospital_id ||
        episodioSelecionado?.id_hosp ||
        1;

      const res = await fetch(`${API_IA}/api/v1/triagem/sugestao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_hospital: idHosp, utente, triagem }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao pedir sugestão IA.');

      const corSugerida = data?.cor_sugerida || data?.cor || '';
      setTriagem((prev) => ({ ...prev, cor_sugerida: corSugerida }));
      setMensagem(`Sugestão IA: ${corSugerida || 'sem resultado'}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoadingIA(false);
    }
  };

  const gravarTriagem = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    setLoadingGravar(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/triagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_episodio: episodioSelecionado?.cod_ep_urgenc,
          ...triagem,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao gravar triagem.');

      setMensagem('Triagem gravada com sucesso.');
      setEpisodioSelecionado(null);
      setUtente(null);
      setMedicacaoAtiva([]);
      setTriagem(TRIAGEM_VAZIA);
      await carregarFila();
      setMainMenu('fila');
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoadingGravar(false);
    }
  };

  // ── Filtro — campos reais do EpisodioOut ───────────────────────────────────

  const episodiosFiltrados = useMemo(() =>
    episodios.filter((ep) =>
      normalizar([ep.cod_ep_urgenc, ep.num_utent].join(' '))
        .includes(normalizar(filtro))
    ),
    [episodios, filtro]
  );

  // ── Cor badge Manchester ───────────────────────────────────────────────────

  const corHex = useMemo(() => {
    const c = CORES_MANCHESTER.find(
      (x) => normalizar(x.valor) === normalizar(triagem.cor_sugerida)
    );
    return c?.hex || null;
  }, [triagem.cor_sugerida]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER SECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const renderBannerEpisodio = () => {
    if (!episodioSelecionado) return null;
    return (
      <div className="admin-table-card" style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ flex: 1, minWidth: 200, paddingLeft: 8 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
            {loadingContexto
              ? <><IconSpinner />A carregar dados do utente…</>
              : utente?.nome || `Utente #${episodioSelecionado.num_utent}`}
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #666)' }}>
            Episódio #{episodioSelecionado.cod_ep_urgenc}
            {' · '}
            Entrada:{' '}
            {episodioSelecionado.data_hora_entr
              ? new Date(episodioSelecionado.data_hora_entr).toLocaleString('pt-PT')
              : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="admin-secondary-button" type="button" onClick={() => setMainMenu('ficha')}>
            {textos?.nurse?.verFicha || 'Ficha'}
          </button>
          <button className="admin-secondary-button" type="button" onClick={() => setMainMenu('medicacao')}>
            {textos?.nurse?.verMedicacao || 'Medicação'}
          </button>
          <button className="admin-form__submit" type="button" onClick={() => setMainMenu('registo')}>
            {textos?.nurse?.registarTriagem || 'Registar triagem'}
          </button>
        </div>
      </div>
    );
  };

  const renderFila = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.filaSemTriagem || 'Fila de episódios sem triagem'}</h2>
      </div>

      <div className="admin-form__group">
        <label>{textos?.geral?.pesquisar || 'Pesquisa rápida'}</label>
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={textos?.nurse?.placeholderPesquisa || 'N.º episódio, N.º utente…'}
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
                <th>{textos?.nurse?.utente   || 'N.º Utente'}</th>
                <th>{textos?.nurse?.entrada  || 'Entrada'}</th>
                <th>{textos?.nurse?.estado   || 'Estado'}</th>
                <th>{textos?.geral?.acoes    || 'Ações'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5"><IconSpinner />{textos?.geral?.aCarregar || 'A carregar…'}</td></tr>
              ) : episodiosFiltrados.length === 0 ? (
                <tr><td colSpan="5">{textos?.geral?.semResultados || 'Nenhum episódio aguarda triagem.'}</td></tr>
              ) : (
                episodiosFiltrados.map((ep) => (
                  <tr key={ep.cod_ep_urgenc}>
                    <td>#{ep.cod_ep_urgenc}</td>
                    <td>{ep.num_utent}</td>
                    <td>
                      {ep.data_hora_entr
                        ? new Date(ep.data_hora_entr).toLocaleString('pt-PT')
                        : '—'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: 12,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: '#e8f4e8',
                        color: '#2d6a2d',
                      }}>
                        {ep.estado}
                      </span>
                    </td>
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

  const renderTriagem = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.abrirTriagem || 'Episódio seleccionado'}</h2>
      </div>
      {episodioSelecionado
        ? renderBannerEpisodio()
        : <p>{textos?.nurse?.selecionaFila || 'Selecciona um episódio na fila para iniciar a triagem.'}</p>
      }
    </section>
  );

  const renderFicha = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.fichaUtente || 'Ficha do utente'}</h2>
      </div>
      {episodioSelecionado && renderBannerEpisodio()}
      {utente ? (
        <div className="admin-table-card" style={{ padding: '16px 24px' }}>
          <p><strong>{textos?.nurse?.nome || 'Nome'}:</strong> {utente.nome || '—'}</p>
          <p><strong>NIF:</strong> {utente.nif || '—'}</p>
          <p><strong>{textos?.nurse?.dataNascimento || 'Data de nascimento'}:</strong> {utente.data_nascimento || '—'}</p>
          <p><strong>{textos?.nurse?.alergias || 'Alergias'}:</strong> {utente.alergias || 'Não registadas'}</p>
          <p><strong>{textos?.nurse?.contacto || 'Contacto'}:</strong> {utente.telemovel || utente.telefone || '—'}</p>
        </div>
      ) : loadingContexto ? (
        <p><IconSpinner />A carregar ficha…</p>
      ) : (
        <p>{textos?.nurse?.abreEpisodioFicha || 'Abre um episódio para consultar a ficha.'}</p>
      )}
    </section>
  );

  const renderMedicacao = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.medicacaoAtiva || 'Medicação ativa'}</h2>
      </div>
      {episodioSelecionado && renderBannerEpisodio()}
      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>{textos?.nurse?.lista || 'Lista'}</h3>
          <span>{medicacaoAtiva.length}</span>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{textos?.nurse?.nome      || 'Nome'}</th>
                <th>{textos?.nurse?.posologia || 'Posologia'}</th>
                <th>{textos?.nurse?.inicio    || 'Início'}</th>
                <th>{textos?.nurse?.fim       || 'Fim'}</th>
              </tr>
            </thead>
            <tbody>
              {loadingContexto ? (
                <tr><td colSpan="4"><IconSpinner />A carregar…</td></tr>
              ) : medicacaoAtiva.length === 0 ? (
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

  const renderRegisto = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.registarTriagem || 'Registar triagem'}</h2>
      </div>
      {episodioSelecionado && renderBannerEpisodio()}
      {!episodioSelecionado ? (
        <p>{textos?.nurse?.selecionaFila || 'Selecciona um episódio na fila para registar a triagem.'}</p>
      ) : (
        <form className="admin-form" onSubmit={gravarTriagem}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>{textos?.nurse?.tensao || 'Tensão arterial'}</label>
              <input name="tensao" value={triagem.tensao} onChange={handleTriagemChange} placeholder="ex: 120/80" />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.pulso || 'Pulso (bpm)'}</label>
              <input name="pulso" value={triagem.pulso} onChange={handleTriagemChange} placeholder="ex: 72" type="number" min="0" max="300" />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.temperatura || 'Temperatura (°C)'}</label>
              <input name="temperatura" value={triagem.temperatura} onChange={handleTriagemChange} placeholder="ex: 36.8" type="number" min="30" max="45" step="0.1" />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.saturacao || 'Saturação O₂ (%)'}</label>
              <input name="saturacao" value={triagem.saturacao} onChange={handleTriagemChange} placeholder="ex: 98" type="number" min="0" max="100" />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.dor || 'Dor (0–10)'}</label>
              <input name="dor" value={triagem.dor} onChange={handleTriagemChange} placeholder="ex: 3" type="number" min="0" max="10" />
            </div>
            <div className="admin-form__group">
              <label>{textos?.nurse?.corSugerida || 'Cor de triagem (Manchester)'}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select name="cor_sugerida" value={triagem.cor_sugerida} onChange={handleTriagemChange} style={{ flex: 1 }}>
                  <option value="">— seleccionar —</option>
                  {CORES_MANCHESTER.map((c) => (
                    <option key={c.valor} value={c.valor}>{c.label}</option>
                  ))}
                </select>
                {corHex && (
                  <span style={{
                    display: 'inline-block', width: 28, height: 28,
                    borderRadius: '50%', background: corHex,
                    border: '2px solid rgba(0,0,0,.15)', flexShrink: 0,
                  }} title={triagem.cor_sugerida} />
                )}
              </div>
            </div>
            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>{textos?.nurse?.sintomas || 'Sintomas / queixa principal'}</label>
              <textarea name="sintomas" value={triagem.sintomas} onChange={handleTriagemChange} rows={3} placeholder="Descreva os sintomas referidos pelo utente…" />
            </div>
            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>{textos?.nurse?.observacoes || 'Observações do enfermeiro'}</label>
              <textarea name="observacoes" value={triagem.observacoes} onChange={handleTriagemChange} rows={2} placeholder="Notas adicionais…" />
            </div>
          </div>
          <div className="admin-actions-row">
            <button type="button" className="admin-secondary-button" onClick={pedirSugestaoCor} disabled={loadingIA}>
              {loadingIA ? <><IconSpinner />A processar…</> : (textos?.nurse?.pedirSugestaoIa || 'Sugestão IA')}
            </button>
            <button type="submit" className="admin-form__submit" disabled={loadingGravar}>
              {loadingGravar ? <><IconSpinner />A gravar…</> : (textos?.nurse?.gravarTriagem || 'Gravar triagem')}
            </button>
          </div>
        </form>
      )}
    </section>
  );

  const renderCenter = () => {
    switch (mainMenu) {
      case 'fila':      return renderFila();
      case 'triagem':   return renderTriagem();
      case 'ficha':     return renderFicha();
      case 'medicacao': return renderMedicacao();
      case 'registo':   return renderRegisto();
      default:          return renderFila();
    }
  };

  return (
    <main className={`admin-layout nurse-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <button type="button" className="admin-sidebar__toggle" onClick={() => setIsSidebarCollapsed((prev) => !prev)} aria-label="Alternar menu lateral">
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
          {[
            { key: 'fila',      Icon: IconQueue,     label: textos?.nurse?.menuFila      || 'Fila sem triagem'  },
            { key: 'triagem',   Icon: IconClipboard, label: textos?.nurse?.menuTriagem   || 'Abrir triagem'     },
            { key: 'ficha',     Icon: IconUser,      label: textos?.nurse?.menuFicha     || 'Ficha do utente'   },
            { key: 'medicacao', Icon: IconPill,      label: textos?.nurse?.menuMedicacao || 'Medicação ativa'   },
            { key: 'registo',   Icon: IconHeart,     label: textos?.nurse?.menuRegisto   || 'Registar triagem'  },
          ].map(({ key, Icon, label }) => (
            <button key={key} type="button" className={`admin-sidebar__link ${mainMenu === key ? 'is-active' : ''}`} onClick={() => setMainMenu(key)}>
              <Icon />
              <span className="link-text">{label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button type="button" className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`} onClick={() => mudarIdioma('pt')}>PT</button>
            <span>/</span>
            <button type="button" className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`} onClick={() => mudarIdioma('en')}>EN</button>
          </div>
          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <SvgExit />
            <span className="link-text">{textos?.geral?.sair || 'Sair'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper">
        <div className="admin-content-inner">
          <div className="admin-content-top">
            <h1>{textos?.nurse?.tituloPainel   || 'Dashboard Enfermeiro'}</h1>
            <p>{textos?.nurse?.descricaoPainel  || 'Fila de episódios, contexto clínico e triagem assistida.'}</p>
          </div>
          <div className="admin-content-body">
            {erro     && <p className="admin-form__error">{erro}</p>}
            {mensagem && <p className="admin-form__success">{mensagem}</p>}
            {mainMenu === 'sala' && renderSalaDeEspera()}
            {mainMenu === 'triagem' && renderTriagem()}
            {mainMenu === 'processo' && renderProcessoClinico()}
          </div>
        </div>
        <FooterLayout />
      </section>
    </main>
  );
}