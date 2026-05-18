import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import Breadcrumbs from '../../components/layout/Breadcrumbs.jsx';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA  = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// Calcula idade a partir de data de nascimento (string YYYY-MM-DD ou Date)
const calcularIdade = (dataNasc) => {
  if (!dataNasc) return '—';
  const nasc = new Date(dataNasc);
  if (isNaN(nasc)) return '—';
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return anos;
};

// Cores Manchester
const CORES_MANCHESTER = [
  { valor: 'azul',     label: 'Azul',     hex: '#3182ce' },
  { valor: 'verde',    label: 'Verde',    hex: '#38a169' },
  { valor: 'amarelo',  label: 'Amarelo',  hex: '#d69e2e' },
  { valor: 'laranja',  label: 'Laranja',  hex: '#dd6b20' },
  { valor: 'vermelho', label: 'Vermelho', hex: '#e53e3e' },
];

// Mapeamento das classes do modelo XGBoost → cores Manchester
const MAPA_COR_IA = {
  '0': 'azul',      // Blue
  '1': 'verde',     // Green
  '2': 'laranja',   // Orange
  '3': 'vermelho',  // Red
  '4': 'amarelo',   // Yellow
};

// Estado inicial da triagem — alinhado com TriagemCreate
const TRIAGEM_VAZIA = {
  sistolica:   '',
  diastolica:  '',
  freq_card:   '',
  freq_resp:   '',
  temperatura: '',
  sp_o2:       '',
  nivel_dor:   '',
  consciencia: '',
  cor_triagem: '',
  sintomas:    '',
};

const iconProps = {
  width: 18, height: 18, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true',
};

const SvgMenu       = () => <svg {...iconProps} strokeWidth="2.4"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>;
const SvgList       = () => <svg {...iconProps}><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>;
const SvgClipboard  = () => <svg {...iconProps}><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/></svg>;
const SvgHeart      = () => <svg {...iconProps}><path d="M12 21s-7-4.35-9-8.5A5.4 5.4 0 0 1 12 5a5.4 5.4 0 0 1 9 7.5C19 16.65 12 21 12 21z"/></svg>;
const SvgExit       = () => <svg {...iconProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
const SvgSearch     = () => <svg {...iconProps}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
const SvgCheck      = () => <svg {...iconProps}><path d="M20 6L9 17l-5-5"/></svg>;
const SvgInfo       = () => <svg {...iconProps}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const SvgX          = () => <svg {...iconProps}><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>;
const SvgChevronLeft  = () => <svg {...iconProps}><path d="M15 18l-6-6 6-6"/></svg>;
const SvgChevronRight = () => <svg {...iconProps}><path d="M9 18l6-6-6-6"/></svg>;
const SvgFileText   = () => <svg {...iconProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M8 9h2"/></svg>;

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

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu]     = useState('sala');
  const [salaTab, setSalaTab]       = useState('sem');
  const [episodios, setEpisodios]   = useState([]);
  const [filtrosSala, setFiltrosSala] = useState({ sem: '', em: '', triados: '', desistencias: '' });
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente]         = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [historico, setHistorico]   = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);
  const [triagem, setTriagem]       = useState(TRIAGEM_VAZIA);
  const [loading, setLoading]       = useState(false);
  const [erro, setErro]             = useState('');
  const [mensagem, setMensagem]     = useState('');

  const utilizadorLogado = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const nomeUtilizador =
    utilizadorLogado?.nome ||
    utilizadorLogado?.name ||
    utilizadorLogado?.username ||
    'Utilizador';

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
      try { setHospitalAtivo(JSON.parse(storedHospital)); }
      catch { setHospitalAtivo(null); }
    }
    carregarEpisodios();
  }, []);

  const abrirPerfilUtilizador = () => {
    const userId =
      utilizadorLogado?.id_utilizador ||
      utilizadorLogado?.idutilizador  ||
      utilizadorLogado?.id_user       ||
      utilizadorLogado?.id            ||
      utilizadorLogado?.utilizador_id;
    navigate(userId ? `/perfil/${userId}` : '/perfil');
  };

  // Usa /api/v1/episodios/ para carregar TODOS os episódios
  // (as tabs filtram por estado no frontend)
  const carregarEpisodios = async () => {
    setLoading(true);
    setErro('');
    try {
      const res  = await authFetch(`${API_URL}/api/v1/episodios/`);
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
    sem: (ep) => {
      const estado = normalizar(ep?.estado);
      return estado === 'aberto' || estado.includes('sem_triagem') || estado.includes('aguard');
    },
    em: (ep) => {
      const estado = normalizar(ep?.estado);
      return estado === 'em_triagem' || estado.includes('em curso');
    },
    triados: (ep) => {
      const estado = normalizar(ep?.estado);
      return estado === 'em_atendimento' || estado === 'internado' || estado.includes('triad') || estado.includes('conclu');
    },
    desistencias: (ep) => {
      const estado = normalizar(ep?.estado);
      return estado.includes('desist') || estado.includes('nao_compareceu');
    },
  };

  const currentList = useMemo(() => {
    const pesquisa = normalizar(filtrosSala[salaTab] || '');
    const base = (episodios || []).filter((ep) => {
      if (salaTab === 'sem')          return mapEstado.sem(ep);
      if (salaTab === 'em')           return mapEstado.em(ep);
      if (salaTab === 'triados')      return mapEstado.triados(ep);
      if (salaTab === 'desistencias') return mapEstado.desistencias(ep);
      return true;
    });
    if (!pesquisa) return base;
    return base.filter((ep) =>
      normalizar([
        ep?.nome_utente, ep?.num_utent,
        ep?.cod_ep_urgenc, ep?.data_hora_entr,
      ].join(' ')).includes(pesquisa)
    );
  }, [episodios, filtrosSala, salaTab]);

  // Usa num_utent — campo real do EpisodioOut
  const obterNumUtenteDoEpisodio = (ep) =>
    ep?.num_utent ?? ep?.num_utente ?? ep?.numutent ?? ep?.numutente ?? null;

  // Usa cod_ep_urgenc — campo real do EpisodioOut
  const obterCodEpisodio = (ep) =>
    ep?.cod_ep_urgenc ?? ep?.id_epurgencia ?? ep?.id ?? null;

  const carregarHistorico = async (num_utente, codEpUrgenc) => {
    const endpoints = [
      { tipo: 'Ato',          url: `${API_URL}/api/v1/atos/episodio/${codEpUrgenc}` },
      { tipo: 'Internamento', url: `${API_URL}/api/v1/internamentos/episodio/${codEpUrgenc}` },
      { tipo: 'Antecedente',  url: `${API_URL}/api/v1/utente-antecedentes/utente/${num_utente}` },
    ];

      const respostas = await Promise.all(
        endpoints.map(async ({ tipo, url }) => {
          try {
            const res  = await authFetch(url);
            const data = await res.json().catch(() => null);
            return { tipo, res, data };
          } catch {
            return { tipo, res: null, data: null };
          }
        })
      );

      const historicoNormalizado = [];
      respostas.forEach(({ tipo, res, data }) => {
        if (!res || !res.ok) return;
        const lista = Array.isArray(data) ? data : data ? [data] : [];
        lista.forEach((item) => {
          if (tipo === 'Ato') {
            historicoNormalizado.push({
              tipo:         item?.tipo || 'Ato',
              data:         item?.data_hora_inicio || '—',
              descricao:    item?.descricao || 'Ato clínico',
              profissional: '—',
            });
          }
          if (tipo === 'Internamento') {
            historicoNormalizado.push({
              tipo,
              data: item?.data_hora_int || item?.data_entrada || item?.datainicio || '—',
              descricao: item?.motivo || item?.diagnostico || item?.descricao || 'Internamento',
              profissional: item?.profissional || '—',
            });
          }
          if (tipo === 'Antecedente') {
            historicoNormalizado.push({
              tipo:         item?.tipo || 'Antecedente',
              data:         item?.dataregisto || item?.data_registo || '—',
              descricao:    item?.nome || item?.descricao || 'Antecedente clínico',
              profissional: '—',
            });
          }
        });
      });

      historicoNormalizado.sort((a, b) => String(b.data).localeCompare(String(a.data)));
      setHistorico(historicoNormalizado);
    };

  const handleTriagemChange = (e) => {
    const { name, value } = e.target;
    setTriagem((prev) => ({ ...prev, [name]: value }));
  };
  
  const pedirSugestaoCor = async () => {
    setErro('');
    setMensagem('');
    try {
      const idade = calcularIdade(episodioSelecionado?.data_nasc_utente);

      const res = await authFetch(`${API_IA}/predict/v1/triage`, {
        method: 'POST',
        body: JSON.stringify({
          Age:            typeof idade === 'number' ? idade : 50,
          Heart_Rate_BPM: triagem.freq_card    !== '' ? parseInt(triagem.freq_card)     : 70,
          SpO2_Percent:   triagem.sp_o2         !== '' ? parseInt(triagem.sp_o2)         : 98,
          Temperature_C:  triagem.temperatura   !== '' ? parseFloat(triagem.temperatura) : 37.0,
          Pain_Level:     triagem.nivel_dor     !== '' ? parseInt(triagem.nivel_dor)     : 0,
          Consciousness:  triagem.consciencia   !== '' ? triagem.consciencia             : 'Acordado',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro na previsão IA.');

      const corSugerida = MAPA_COR_IA[String(data?.pulseira)] || '';
      setTriagem((prev) => ({ ...prev, cor_triagem: corSugerida }));
      setMensagem(`Sugestão IA: ${corSugerida || 'sem resultado'}`);
    } catch (e) {
      setErro(e.message);
    }
  };

  // Payload alinhado com TriagemCreate
  const gravarTriagem = async (e) => {
    e.preventDefault();
    setErro('');
    setMensagem('');
    try {
      const codEp = obterCodEpisodio(episodioSelecionado);
      const payload = {
        cod_ep_urgenc:    codEp,
        data_hora_inicio: new Date().toISOString(),
        id_func:          utilizadorLogado?.idfunc || null,
        cor_triagem:      triagem.cor_triagem,
        sintomas:         triagem.sintomas,
        temperatura:      triagem.temperatura  !== '' ? parseFloat(triagem.temperatura)  : null,
        freq_card:        triagem.freq_card     !== '' ? parseInt(triagem.freq_card)      : null,
        freq_resp:        triagem.freq_resp     !== '' ? parseInt(triagem.freq_resp)      : null,
        sp_o2:            triagem.sp_o2         !== '' ? parseFloat(triagem.sp_o2)        : null,
        sistolica:        triagem.sistolica     !== '' ? parseInt(triagem.sistolica)      : null,
        diastolica:       triagem.diastolica    !== '' ? parseInt(triagem.diastolica)     : null,
        nivel_dor:        triagem.nivel_dor     !== '' ? parseInt(triagem.nivel_dor)      : null,
        consciencia:      triagem.consciencia   !== '' ? triagem.consciencia              : null,
      };

      const res = await authFetch(`${API_URL}/api/v1/triagens/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro ao gravar triagem.');

      // Actualiza estado do episódio para em_atendimento
      await authFetch(`${API_URL}/api/v1/episodios/${codEp}`, {
        method: 'PUT',
        body: JSON.stringify({ estado: 'em_atendimento' }),
      });

      setMensagem(textos?.nurse?.gravarOk || 'Triagem gravada com sucesso.');
      setTriagem(TRIAGEM_VAZIA);
      setEpisodioSelecionado(null);
      setUtente(null);
      setMedicacaoAtiva([]);
      await carregarEpisodios();
      setMainMenu('sala');
      setSalaTab('triados');
    } catch (e) {
      setErro(e.message);
    }
  };

  const abrirProcessoClinico = async (num_utente, codEpUrgenc) => {
    setErro('');
    setMensagem('');
    try {
      if (!num_utente)   throw new Error('Identificador do utente não encontrado.');
      if (!codEpUrgenc)  throw new Error('Código do episódio não encontrado.');
      await carregarHistorico(num_utente, codEpUrgenc);
      setMainMenu('processo');
    } catch (e) {
      setErro(e.message);
    }
  };

  const abrirEpisodio = async (ep) => {
    setErro('');
    setMensagem('');
    setTriagem(TRIAGEM_VAZIA);
    setEpisodioSelecionado(ep);
    setMainMenu('triagem');

    try {
      const num_utent = obterNumUtenteDoEpisodio(ep);
      const codEp     = obterCodEpisodio(ep);

      if (!num_utent) throw new Error('Identificador do utente não encontrado no episódio.');
      if (!codEp)     throw new Error('Código do episódio não encontrado.');

      const [uRes, mRes, tRes] = await Promise.all([
        authFetch(`${API_URL}/api/v1/utentes/${num_utent}`),
        authFetch(`${API_URL}/api/v1/medicacao-ativa/utente/${num_utent}`),
        authFetch(`${API_URL}/api/v1/triagens/${codEp}`),
      ]);

      const uData = await uRes.json();
      const mData = await mRes.json();

      if (!uRes.ok) throw new Error(uData?.detail || 'Erro ao carregar utente.');

      setUtente(uData || null);
      setMedicacaoAtiva(mRes.ok && Array.isArray(mData) ? mData : []);

      // Se já existe triagem, pré-preenche o formulário
      if (tRes.ok) {
        const tData = await tRes.json();
        setTriagem({
          sistolica:   tData?.sistolica   ?? '',
          diastolica:  tData?.diastolica  ?? '',
          freq_card:   tData?.freq_card   ?? '',
          freq_resp:   tData?.freq_resp   ?? '',
          temperatura: tData?.temperatura ?? '',
          sp_o2:       tData?.sp_o2       ?? '',
          nivel_dor:   tData?.nivel_dor   ?? '',
          consciencia: tData?.consciencia ?? '',
          cor_triagem: tData?.cor_triagem ?? '',
          sintomas:    tData?.sintomas    ?? '',
        });
      }

      await carregarHistorico(num_utent, codEp);
    } catch (e) {
      setErro(e.message);
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  };

  // ── cor badge Manchester ───────────────────────────────────────────────────
  const corHex = useMemo(() => {
    const c = CORES_MANCHESTER.find(
      (x) => normalizar(x.valor) === normalizar(triagem.cor_triagem)
    );
    return c?.hex || null;
  }, [triagem.cor_triagem]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const renderSalaDeEspera = () => {
    const tabs = [
      { id: 'sem',          label: 'Sem triagem',  icon: <SvgList /> },
      { id: 'em',           label: 'Em triagem',   icon: <SvgClipboard /> },
      { id: 'triados',      label: 'Triados',      icon: <SvgCheck /> },
      { id: 'desistencias', label: 'Desistências', icon: <SvgX /> },
    ];

    const colSpan = salaTab === 'sem' || salaTab === 'triados' ? 4 : salaTab === 'em' ? 3 : 2;

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.nurse?.salaEsper || 'Sala de Espera'}</h2>
        </div>

        <div className="tabs" role="tablist" aria-label="Tabs Sala de Espera">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={salaTab === t.id}
              className={`admin-secondary-button ${salaTab === t.id ? 'is-active' : ''}`}
              onClick={() => setSalaTab(t.id)}>
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
              placeholder={textos?.nurse?.placeholderPesquisa || 'Nome, episódio...'}
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
                  {salaTab === 'sem' && (
                    <>
                      <th>{textos?.nurse?.utente  || 'Utente'}</th>
                      <th>{textos?.nurse?.idade   || 'Idade'}</th>
                      <th>{textos?.nurse?.entrada || 'Entrada'}</th>
                      <th>{textos?.geral?.acoes   || 'Ações'}</th>
                    </>
                  )}
                  {salaTab === 'em' && (
                    <>
                      <th>{textos?.nurse?.utente        || 'Utente'}</th>
                      <th>{textos?.nurse?.inicioTriagem || 'Início triagem'}</th>
                      <th>{textos?.nurse?.enfermeiro    || 'Enfermeiro'}</th>
                    </>
                  )}
                  {salaTab === 'triados' && (
                    <>
                      <th>{textos?.nurse?.utente      || 'Utente'}</th>
                      <th>{textos?.nurse?.dataTriagem || 'Data triagem'}</th>
                      <th>{textos?.nurse?.enfermeiro  || 'Enfermeiro'}</th>
                      <th>{textos?.geral?.acoes       || 'Ações'}</th>
                    </>
                  )}
                  {salaTab === 'desistencias' && (
                    <>
                      <th>{textos?.nurse?.utente          || 'Utente'}</th>
                      <th>{textos?.nurse?.dataDesistencia || 'Data/Hora'}</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan={colSpan}>{textos?.geral?.aCarregar || 'A carregar...'}</td></tr>
                ) : currentList.length === 0 ? (
                  <tr><td colSpan={colSpan}>{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                ) : (
                  currentList.map((ep, index) => {
                    const key = ep?.cod_ep_urgenc ?? ep?.id_epurgencia ?? ep?.id ?? index;

                    if (salaTab === 'sem') {
                      return (
                        <tr key={`ep-${key}`}>
                          <td>{ep?.nome_utente || `#${ep?.num_utent}` || '—'}</td>
                          <td>{calcularIdade(ep?.data_nasc_utente)}</td>
                          <td>
                            {ep?.data_hora_entr
                              ? new Date(ep.data_hora_entr).toLocaleString('pt-PT')
                              : '—'}
                          </td>
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
                        <tr key={`ep-${key}`}>
                          <td>{ep?.nome_utente || `#${ep?.num_utent}` || '—'}</td>
                          <td>{ep?.data_hora_entr ? new Date(ep.data_hora_entr).toLocaleString('pt-PT') : '—'}</td>
                          <td>—</td>
                        </tr>
                      );
                    }

                    if (salaTab === 'triados') {
                      return (
                        <tr key={`ep-${key}`}>
                          <td>{ep?.nome_utente || `#${ep?.num_utent}` || '—'}</td>
                          <td>{ep?.data_hora_triagem ? new Date(ep.data_hora_triagem).toLocaleString('pt-PT') : '—'}</td>
                          <td>{ep?.nome_enfermeiro || '—'}</td>
                          <td>
                            <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>
                              <span className="btn-icon"><SvgInfo /></span>
                              <span className="btn-text">{textos?.nurse?.infoTriagem || 'Info triagem'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={`ep-${key}`}>
                        <td>{ep?.nome_utente || `#${ep?.num_utent}` || '—'}</td>
                        <td>{ep?.data_hora_saida ? new Date(ep.data_hora_saida).toLocaleString('pt-PT') : '—'}</td>
                      </tr>
                    );
                  })
                )}
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
        <h2>{nomeHospital}</h2>
        <div className="admin-actions-row">
          <button type="button" className="admin-secondary-button" onClick={() => setMainMenu('sala')}>
            <span className="btn-icon"><SvgChevronLeft /></span>
            <span className="btn-text">{textos?.geral?.voltar || 'Voltar'}</span>
          </button>
          <button type="button" className="admin-secondary-button"
            onClick={() => episodioSelecionado && abrirProcessoClinico(
              obterNumUtenteDoEpisodio(episodioSelecionado),
              obterCodEpisodio(episodioSelecionado)
            )}>
            <span className="btn-icon"><SvgFileText /></span>
            <span className="btn-text">{textos?.nurse?.verProcesso || 'Processo'}</span>
          </button>
        </div>
      </div>

      {episodioSelecionado ? (
        <div className="admin-table-card">
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
              {utente?.nome || episodioSelecionado?.nome_utente || `Utente #${episodioSelecionado?.num_utent}`}
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #666)' }}>
              Episódio #{obterCodEpisodio(episodioSelecionado)}
              {' · '}
              Entrada:{' '}
              {episodioSelecionado?.data_hora_entr
                ? new Date(episodioSelecionado.data_hora_entr).toLocaleString('pt-PT')
                : '—'}
              {episodioSelecionado?.data_nasc_utente
                ? ` · ${calcularIdade(episodioSelecionado.data_nasc_utente)} anos`
                : ''}
            </p>
          </div>

          <form className="admin-form" onSubmit={gravarTriagem} style={{ padding: '0 24px 18px' }}>
            <div className="admin-form__grid">

              <div className="admin-form__group">
                <label>{textos?.nurse?.sistolica || 'Tensão sistólica (mmHg)'}</label>
                <input name="sistolica" value={triagem.sistolica} onChange={handleTriagemChange} placeholder="ex: 120" type="number" min="0" max="300" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.diastolica || 'Tensão diastólica (mmHg)'}</label>
                <input name="diastolica" value={triagem.diastolica} onChange={handleTriagemChange} placeholder="ex: 80" type="number" min="0" max="200" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.freqCard || 'Freq. cardíaca (bpm)'}</label>
                <input name="freq_card" value={triagem.freq_card} onChange={handleTriagemChange} placeholder="ex: 72" type="number" min="0" max="300" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.freqResp || 'Freq. respiratória (rpm)'}</label>
                <input name="freq_resp" value={triagem.freq_resp} onChange={handleTriagemChange} placeholder="ex: 16" type="number" min="0" max="100" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.temperatura || 'Temperatura (°C)'}</label>
                <input name="temperatura" value={triagem.temperatura} onChange={handleTriagemChange} placeholder="ex: 36.8" type="number" min="30" max="45" step="0.1" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.spO2 || 'SpO₂ (%)'}</label>
                <input name="sp_o2" value={triagem.sp_o2} onChange={handleTriagemChange} placeholder="ex: 98" type="number" min="0" max="100" step="0.1" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.nivelDor || 'Nível de dor (0–10)'}</label>
                <input name="nivel_dor" value={triagem.nivel_dor} onChange={handleTriagemChange} placeholder="ex: 3" type="number" min="0" max="10" />
              </div>

              <div className="admin-form__group">
                <label>{textos?.nurse?.consciencia || 'Estado de consciência'}</label>
                <select name="consciencia" value={triagem.consciencia} onChange={handleTriagemChange}>
                  <option value="">— seleccionar —</option>
                  <option value="Acordado">Acordado</option>
                  <option value="Confuso">Confuso</option>
                  <option value="Inconsciente">Inconsciente</option>
                </select>
              </div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>{textos?.nurse?.corTriagem || 'Cor de triagem (Manchester)'}</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select name="cor_triagem" value={triagem.cor_triagem} onChange={handleTriagemChange} style={{ flex: 1 }} required>
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
                    }} title={triagem.cor_triagem} />
                  )}
                </div>
              </div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>{textos?.nurse?.sintomas || 'Sintomas / queixa principal'}</label>
                <textarea name="sintomas" value={triagem.sintomas} onChange={handleTriagemChange} rows={3} placeholder="Descreva os sintomas referidos pelo utente…" required />
              </div>

            </div>

            <div className="admin-actions-row">
              <button type="button" className="admin-secondary-button" onClick={pedirSugestaoCor}>
                <span className="btn-icon"><SvgHeart /></span>
                <span className="btn-text">{textos?.nurse?.pedirSugestaoIa || 'Sugestão IA'}</span>
              </button>
              <button type="submit" className="admin-form__submit">
                <span className="btn-icon"><SvgCheck /></span>
                <span className="btn-text">{textos?.nurse?.gravarTriagem || 'Gravar triagem'}</span>
              </button>
            </div>
          </form>

          <div style={{ padding: '0 24px 18px' }}>
            <h4>{textos?.nurse?.medicacaoAtiva || 'Medicação ativa'}</h4>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.nurse?.nome     || 'Nome'}</th>
                    <th>{textos?.nurse?.posologia || 'Posologia'}</th>
                    <th>{textos?.nurse?.inicio   || 'Início'}</th>
                    <th>{textos?.nurse?.fim      || 'Fim'}</th>
                  </tr>
                </thead>
                <tbody>
                  {medicacaoAtiva.length === 0 ? (
                    <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                  ) : (
                    medicacaoAtiva.map((m, i) => (
                      <tr key={i}>
                        <td>{m.principio_ativo || '—'}</td>
                        <td>{m.dosagem || '—'}</td>
                        <td>{m.data_inicio || '—'}</td>
                        <td>{m.data_fim   || '—'}</td>
                      </tr>
                    ))
                  )}
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
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p><strong>{textos?.nurse?.nome || 'Nome'}:</strong> {utente.nome || '—'}</p>
            <p><strong>{textos?.nurse?.nif  || 'NIF'}:</strong>  {utente.nif  || '—'}</p>
          </div>

          <div style={{ padding: '0 24px 18px' }}>
            <h4>{textos?.nurse?.historico || 'Histórico clínico'}</h4>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos?.nurse?.data        || 'Data'}</th>
                    <th>Tipo</th>
                    <th>{textos?.nurse?.descricao   || 'Descrição'}</th>
                    <th>{textos?.nurse?.profissional || 'Profissional'}</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length === 0 ? (
                    <tr><td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
                  ) : (
                    historico.map((h, i) => (
                      <tr key={i}>
                        <td>
                          {h.data && h.data !== '—'
                            ? (() => { const d = new Date(h.data); return isNaN(d) ? h.data : d.toLocaleString('pt-PT'); })()
                            : '—'}
                        </td>
                        <td>{h.tipo        || '—'}</td>
                        <td>{h.descricao   || '—'}</td>
                        <td>{h.profissional || '—'}</td>
                      </tr>
                    ))
                  )}
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
            {erro     && <p className="admin-form__error">{erro}</p>}
            {mensagem && <p className="admin-form__success">{mensagem}</p>}
            {mainMenu === 'sala'     && renderSalaDeEspera()}
            {mainMenu === 'triagem'  && renderTriagem()}
            {mainMenu === 'processo' && renderProcessoClinico()}
          </div>
        </div>
        <FooterLayout />
      </section>
    </main>
  );
}