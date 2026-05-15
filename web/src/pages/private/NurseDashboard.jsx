import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

const SvgMenu = () => (
  <svg {...iconProps} strokeWidth="2.4">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

const SvgList = () => (
  <svg {...iconProps}>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);

const SvgClipboard = () => (
  <svg {...iconProps}>
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
);

const SvgHeart = () => (
  <svg {...iconProps}>
    <path d="M12 21s-7-4.35-9-8.5A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 9 7.5C19 16.65 12 21 12 21z" />
  </svg>
);

const SvgExit = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

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

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('sala');
  const [salaTab, setSalaTab] = useState('sem');
  const [episodios, setEpisodios] = useState([]);
  const [filtrosSala, setFiltrosSala] = useState({ sem: '', em: '', triados: '', desistencias: '' });
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const nomeUtilizador = utilizadorLogado?.nome || utilizadorLogado?.name || utilizadorLogado?.username || 'Utilizador';
  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  const nomeHospital =
    hospitalAtivo?.nome ||
    hospitalAtivo?.Nome ||
    hospitalAtivo?.designacao ||
    hospitalAtivo?.designacao_hospital ||
    'Dashboard Enfermeiro';

  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: nomeHospital, path: '/nurse' },
  ];

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
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/v1/episodios/`);
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

  const mapEstado = {
    sem: (ep) => ep.estado === 'aberto' || ep.estado === 'sem_triagem',
    em: (ep) => ep.estado === 'em_triagem' || ep.estado === 'triagem',
    triados: (ep) => ep.estado === 'triado' || ep.estado === 'concluido',
    desistencias: (ep) => ep.estado === 'desistencia' || ep.estado === 'nao_compareceu',
  };

  const episodiosFiltrados = useMemo(
    () => ({
      sem: (episodios || []).filter((ep) =>
        mapEstado.sem(ep) &&
        normalizar([ep.nome_utente, ep.nif_utente, ep.datahoraentr].join(' ')).includes(normalizar(filtrosSala.sem))
      ),
      em: (episodios || []).filter((ep) =>
        mapEstado.em(ep) &&
        normalizar([ep.nome_utente, ep.nif_utente, ep.datahoraini_triagem || ep.datahoraentr].join(' ')).includes(normalizar(filtrosSala.em))
      ),
      triados: (episodios || []).filter((ep) =>
        mapEstado.triados(ep) &&
        normalizar([ep.nome_utente, ep.nif_utente, ep.datahora_triagem || ep.datahoraentr].join(' ')).includes(normalizar(filtrosSala.triados))
      ),
      desistencias: (episodios || []).filter((ep) =>
        mapEstado.desistencias(ep) &&
        normalizar([ep.nome_utente, ep.nif_utente, ep.datahora_desistencia || ep.datahoraentr].join(' ')).includes(normalizar(filtrosSala.desistencias))
      ),
    }),
    [episodios, filtrosSala]
  );

  const carregarHistorico = async (num_utente) => {
    const res = await fetch(`${API_URL}/api/v1/utentes/${num_utente}/historico`);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.detail || 'Erro ao carregar histórico.');
    setHistorico(Array.isArray(data) ? data : []);
  };

  const abrirEpisodio = async (ep) => {
    setErro('');
    setMensagem('');
    setEpisodioSelecionado(ep);
    setMainMenu('triagem');

    try {
      const num_utente = ep.num_utente || ep.numutente || ep.NumUtent || ep.numutent || ep.numUtente;
      if (!num_utente) throw new Error('Identificador do utente não encontrado no episódio.');

      const [uRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/utentes/${num_utente}`),
        fetch(`${API_URL}/api/v1/medicacao-ativa/utente/${num_utente}`),
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
    }
  };

  const handleTriagemChange = (e) => {
    const { name, value } = e.target;
    setTriagem((prev) => ({ ...prev, [name]: value }));
  };

  const pedirSugestaoCor = async () => {
    setErro('');
    setMensagem('');
    try {
      const res = await fetch(`${API_IA}/predict/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodio: episodioSelecionado, utente, triagem, enfermeiro: utilizadorLogado }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro na previsão IA.');
      setTriagem((prev) => ({ ...prev, cor_sugerida: data?.cor_sugerida || data?.cor || prev.cor_sugerida }));
    } catch (e) {
      setErro(e.message);
    }
  };

  const gravarTriagem = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      const payload = {
        cod_epurgenc: episodioSelecionado?.id_epurgencia || episodioSelecionado?.id || episodioSelecionado?.CodEpUrgenc,
        sintomas: triagem.sintomas,
        temperatura: triagem.temperatura,
        freqcard: triagem.pulso,
        spo2: triagem.saturacao,
        nivel_dor: triagem.dor,
        cortriagem: triagem.cor_sugerida,
        observacoes: triagem.observacoes,
      };

      const res = await fetch(`${API_URL}/api/v1/triagens/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao gravar triagem.');

      setMensagem(textos?.nurse?.gravarOk || 'Triagem gravada com sucesso.');
      await carregarEpisodios();
      setMainMenu('sala');
      setSalaTab('triados');
    } catch (e) {
      setErro(e.message);
    }
  };

  const abrirProcessoClinico = async (num_utente) => {
    setErro('');
    setMensagem('');
    try {
      await carregarHistorico(num_utente);
      setMainMenu('processo');
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

  const renderSalaDeEspera = () => {
    const tabs = [
      { id: 'sem', label: 'Sem triagem', icon: <SvgList /> },
      { id: 'em', label: 'Em triagem', icon: <SvgClipboard /> },
      { id: 'triados', label: 'Triados', icon: <SvgCheck /> },
      { id: 'desistencias', label: 'Desistências', icon: <SvgX /> },
    ];
    const currentList = episodiosFiltrados[salaTab] || [];

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.nurse?.salaEsper || 'Sala de Espera'}</h2>
        </div>

        <div className="tabs" role="tablist" aria-label="Tabs Sala de Espera">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={salaTab === t.id}
              className={`admin-secondary-button ${salaTab === t.id ? 'is-active' : ''}`}
              onClick={() => setSalaTab(t.id)}
            >
              <span className="btn-icon">{t.icon}</span>
              <span className="btn-text">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="admin-form__group">
          <label>{textos?.geral?.pesquisar || 'Pesquisa'}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="btn-icon"><SvgSearch /></span>
            <input
              value={filtrosSala[salaTab]}
              onChange={(e) => setFiltrosSala((prev) => ({ ...prev, [salaTab]: e.target.value }))}
              placeholder={textos?.nurse?.placeholderPesquisa || 'Procura por nome, NIF, data...'}
            />
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>{tabs.find((t) => t.id === salaTab)?.label}</h3>
            <span>{currentList.length}</span>
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  {salaTab === 'sem' && <>
                    <th>{textos?.nurse?.utente || 'Utente'}</th>
                    <th>{textos?.nurse?.idade || 'Idade'}</th>
                    <th>{textos?.nurse?.entrada || 'Entrada'}</th>
                    <th>{textos?.geral?.acoes || 'Ações'}</th>
                  </>}
                  {salaTab === 'em' && <>
                    <th>{textos?.nurse?.utente || 'Utente'}</th>
                    <th>{textos?.nurse?.inicioTriagem || 'Início triagem'}</th>
                    <th>{textos?.nurse?.enfermeiro || 'Enfermeiro'}</th>
                  </>}
                  {salaTab === 'triados' && <>
                    <th>{textos?.nurse?.utente || 'Utente'}</th>
                    <th>{textos?.nurse?.dataTriagem || 'Data triagem'}</th>
                    <th>{textos?.nurse?.enfermeiro || 'Enfermeiro'}</th>
                    <th>{textos?.geral?.acoes || 'Ações'}</th>
                  </>}
                  {salaTab === 'desistencias' && <>
                    <th>{textos?.nurse?.utente || 'Utente'}</th>
                    <th>{textos?.nurse?.dataDesistencia || 'Data/Hora'}</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">{textos?.geral?.aCarregar || 'A carregar...'}</td></tr>
                ) : currentList.length === 0 ? (
                  <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                ) : currentList.map((ep) => {
                  const key = ep.id_epurgencia || ep.id || ep.CodEpUrgenc;
                  if (salaTab === 'sem') {
                    return (
                      <tr key={key}>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.idade || '—'}</td>
                        <td>{ep.datahoraentr || '—'}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>
                            <span className="btn-icon"><SvgClipboard /></span>
                            <span className="btn-text">{textos?.nurse?.iniciarTriagem || 'Iniciar triagem'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  if (salaTab === 'em') {
                    return (
                      <tr key={key}>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.datahoraini_triagem || ep.datahora_triagem || '—'}</td>
                        <td>{ep.enfermeiro_triagem || ep.nome_enfermeiro || '—'}</td>
                      </tr>
                    );
                  }
                  if (salaTab === 'triados') {
                    return (
                      <tr key={key}>
                        <td>{ep.nome_utente || '—'}</td>
                        <td>{ep.datahora_triagem || ep.data_hora_triagem || '—'}</td>
                        <td>{ep.enfermeiro_triagem || ep.nome_enfermeiro || '—'}</td>
                        <td>
                          <button type="button" className="admin-secondary-button" onClick={() => { setEpisodioSelecionado(ep); abrirEpisodio(ep); }}>
                            <span className="btn-icon"><SvgInfo /></span>
                            <span className="btn-text">{textos?.nurse?.infoTriagem || 'Info triagem'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={key}>
                      <td>{ep.nome_utente || '—'}</td>
                      <td>{ep.datahora_desistencia || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const renderTriagem = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <Breadcrumbs items={breadcrumbsLinks} />
        <h2>{nomeHospital}</h2>
        <div className="admin-actions-row">
          <button type="button" className="admin-secondary-button" onClick={() => setMainMenu('sala')}>
            <span className="btn-icon"><SvgChevronLeft /></span>
            <span className="btn-text">{textos?.geral?.voltar || 'Voltar'}</span>
          </button>
          <button type="button" className="admin-secondary-button" onClick={() => episodioSelecionado && abrirProcessoClinico(episodioSelecionado?.num_utente || episodioSelecionado?.numutente)}>
            <span className="btn-icon"><SvgFileText /></span>
            <span className="btn-text">{textos?.nurse?.verProcesso || 'Processo'}</span>
          </button>
        </div>
      </div>

      {episodioSelecionado ? (
        <div className="admin-table-card">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p><strong>Utente:</strong> {utente?.nome || episodioSelecionado?.nome_utente || '—'}</p>
            <p><strong>{textos?.nurse?.entrada || 'Entrada'}:</strong> {episodioSelecionado?.datahoraentr || '—'}</p>
          </div>

          <form className="admin-form" onSubmit={gravarTriagem} style={{ padding: 18, paddingTop: 0 }}>
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
                <span className="btn-icon"><SvgHeart /></span>
                <span className="btn-text">{textos?.nurse?.pedirSugestaoIa || 'Pedir sugestão IA'}</span>
              </button>
              <button type="submit" className="admin-form__submit">
                <span className="btn-icon"><SvgCheck /></span>
                <span className="btn-text">{textos?.nurse?.gravarTriagem || 'Gravar triagem'}</span>
              </button>
            </div>
          </form>

          <div style={{ padding: 18, paddingTop: 0 }}>
            <h4>{textos?.nurse?.medicacaoAtiva || 'Medicação ativa'}</h4>
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
                  ) : medicacaoAtiva.map((m, i) => (
                    <tr key={i}>
                      <td>{m.nome || '—'}</td>
                      <td>{m.dosagem || m.posologia || '—'}</td>
                      <td>{m.datainicio || m.DataInicio || '—'}</td>
                      <td>{m.datafim || m.DataFim || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>{textos?.nurse?.selecionaFila || 'Seleciona um episódio na fila.'}</p>
      )}
    </section>
  );

  const renderProcessoClinico = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.nurse?.processoClinico || 'Processo Clínico'}</h2>
        <button type="button" className="admin-secondary-button" onClick={() => setMainMenu('triagem')}>
          <span className="btn-icon"><SvgChevronRight /></span>
          <span className="btn-text">{textos?.nurse?.continuarTriagem || 'Continuar triagem'}</span>
        </button>
      </div>

      {utente ? (
        <div className="admin-table-card">
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p><strong>{textos?.nurse?.nome || 'Nome'}:</strong> {utente.nome || '—'}</p>
            <p><strong>{textos?.nurse?.nif || 'NIF'}:</strong> {utente.nif || '—'}</p>
          </div>

          <div style={{ padding: 18, paddingTop: 0 }}>
            <h4>{textos?.nurse?.historico || 'Histórico clínico'}</h4>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.nurse?.data || 'Data'}</th>
                    <th>{textos?.nurse?.descricao || 'Descrição'}</th>
                    <th>{textos?.nurse?.profissional || 'Profissional'}</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length === 0 ? (
                    <tr><td colSpan="3">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                  ) : historico.map((h, i) => (
                    <tr key={i}>
                      <td>{h.data || h.Data || '—'}</td>
                      <td>{h.descricao || h.descricao_ato || '—'}</td>
                      <td>{h.profissional || h.nome_profissional || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>{textos?.nurse?.abreEpisodioFicha || 'Abre um episódio para consultar o processo clínico.'}</p>
      )}
    </section>
  );

  return (
    <main className={`admin-layout nurse-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <button type="button" className="admin-sidebar__toggle" onClick={() => setIsSidebarCollapsed((prev) => !prev)} aria-label="Alternar menu lateral">
          <SvgMenu />
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
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'sala' ? 'is-active' : ''}`} onClick={() => setMainMenu('sala')}>
            <span className="sidebar-icon"><SvgList /></span>
            <span className="link-text">Sala de Espera</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'triagem' ? 'is-active' : ''}`} onClick={() => setMainMenu('triagem')}>
            <span className="sidebar-icon"><SvgClipboard /></span>
            <span className="link-text">Triagem Clínica</span>
          </button>
          <button type="button" className={`admin-sidebar__link ${mainMenu === 'processo' ? 'is-active' : ''}`} onClick={() => setMainMenu('processo')}>
            <span className="sidebar-icon"><SvgFileText /></span>
            <span className="link-text">Processo Clínico</span>
          </button>
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
          <div className="admin-breadcrumbs-row">
            <Breadcrumbs items={breadcrumbsLinks} />
          </div>

          <div className="admin-content-top">
            <h1>{nomeHospital}</h1>
            <p>{textos?.nurse?.descricaoPainel || 'Fila de episódios, contexto clínico e triagem assistida.'}</p>
          </div>

          <div className="admin-content-body">
            {erro && <p className="admin-form__error">{erro}</p>}
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