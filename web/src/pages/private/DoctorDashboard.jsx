import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import Toast, { useToast } from '../../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA  = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

const MAPA_GRAVIDADE = { 'Baixa': 1, 'Média': 2, 'Media': 2, 'Alta': 3 };

const calcularIdade = (dataNasc) => {
  if (!dataNasc) return 50;
  const nasc = new Date(dataNasc);
  if (isNaN(nasc)) return 50;
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
  return anos;
};

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />
  </svg>
);
const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="M7 14l3-3 3 2 4-5" />
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
const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
  </svg>
);

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu]         = useState('informacao_geral');
  const [episodios, setEpisodios]       = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente]             = useState(null);
  const [alertas, setAlertas]           = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [antecedentes, setAntecedentes] = useState(null);
  const [mostrarAntecedentes, setMostrarAntecedentes] = useState(false);
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [modoEdicaoTriagem, setModoEdicaoTriagem] = useState(false);

  // campos em minúsculas — alinhados com TriagemOut
  const [formTriagem, setFormTriagem] = useState({
    cor_triagem:  '',
    temperatura:  '',
    freq_card:    '',
    freq_resp:    '',
    sp_o2:        '',
    sistolica:    '',
    diastolica:   '',
    nivel_dor:    '',
    consciencia:  'Acordado',
  });

  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—', laranja: '—', amarelo: '—', verde: '—', azul: '—',
  });

  const [filtro, setFiltro] = useState('');
  const { toast, mostrarToast, fecharToast } = useToast();

  const [prescricao, setPrescricao] = useState({
    cod_medicamento: '', dosagem: '', observacoes: '',
  });

  const [medicamentos, setMedicamentos]     = useState([]);
  const [alergias, setAlergias]             = useState([]);
  const [atos, setAtos]                     = useState([]);
  const atosRef = useRef([]);
  const [riscoIA, setRiscoIA]               = useState(null);
  const [avaliacaoRisco, setAvaliacaoRisco] = useState(false);

  const [alta, setAlta] = useState({
    destino: 'alta', observacoes: '', internamento_destino: '',
  });

  const utilizadorLogado = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  const nomeUtilizador     = utilizadorLogado?.nome || utilizadorLogado?.name || utilizadorLogado?.username || 'Utilizador';
  const nomeHospital       = utilizadorLogado?.hospitais?.[0]?.nome || 'Hospital Geral';
  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  const menuGroups = useMemo(() => [
    {
      title: textos?.doctor?.menuGrupoGeral || 'Visão geral',
      items: [{ key: 'informacao_geral', icon: <IconChart />, label: textos?.doctor?.menuInfoGeral || 'Informação Geral' }],
    },
    {
      title: textos?.doctor?.menuGrupoTriagem || 'Triagem',
      items: [
        { key: 'fila',        icon: <IconQueue />,     label: textos?.doctor?.menuFila       || 'Fila por prioridade' },
        { key: 'atendimento', icon: <IconClipboard />, label: textos?.doctor?.menuAtendimento || 'Atendimento' },
      ],
    },
  ], [textos]);

  useEffect(() => {
    carregarEpisodios();
    carregarTemposMediosHospital();
    carregarMedicamentos();
  }, [utilizadorLogado]);

  const extrairMensagemErro = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.detail === 'object') return JSON.stringify(data.detail);
    if (data.message) return data.message;
    return fallback;
  };

  const abrirPerfilUtilizador = () => {
    const userId = utilizadorLogado?.id_utilizador || utilizadorLogado?.idutilizador || utilizadorLogado?.id_user || utilizadorLogado?.id;
    navigate(userId ? `/perfil/${userId}` : '/perfil');
  };

  const carregarEpisodios = async () => {
    const hospitalId = utilizadorLogado?.hospitais?.[0]?.idhosp;
    if (!hospitalId) return;
    try {
      
      const res  = await fetch(`${API_URL}/api/v1/triagens/hospital/${hospitalId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao carregar episódios.'));
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) {
      mostrarToast(e.message, 'erro');
      setEpisodios([]);
    }
  };

  const carregarTemposMediosHospital = async () => {
    const hospitalId = utilizadorLogado?.hospitais?.[0]?.idhosp;
    if (!hospitalId) return;
    try {
      const res  = await fetch(`${API_URL}/api/v1/predict/tempos-espera/${hospitalId}`);
      const data = await res.json();
      if (res.ok && data?.tempos_espera) {
        const t = data.tempos_espera;
        setTemposMediosHospital({
          vermelho: t.vermelho?.minutos != null ? `${t.vermelho.minutos} min` : '—',
          laranja:  t.laranja?.minutos  != null ? `${t.laranja.minutos} min`  : '—',
          amarelo:  t.amarelo?.minutos  != null ? `${t.amarelo.minutos} min`  : '—',
          verde:    t.verde?.minutos    != null ? `${t.verde.minutos} min`    : '—',
          azul:     t.azul?.minutos     != null ? `${t.azul.minutos} min`     : '—',
        });
      }
    } catch (e) {
      console.error('Erro ao carregar previsões IA:', e);
    }
  };

  const episodiosFiltrados = useMemo(() =>
    episodios.filter((ep) =>
      normalizar([ep.nome_utente, ep.cod_ep_urgenc, ep.cor_triagem].join(' '))
        .includes(normalizar(filtro))
    ),
    [episodios, filtro]
  );

  // FIX: usa num_utent (campo real do TriagemOut)
  const abrirEpisodio = async (ep, focarNaAlta = false) => {
    setEpisodioSelecionado(ep);
    setMainMenu('atendimento');
    setAntecedentes(null);
    setMostrarAntecedentes(false);
    setModoEdicaoTriagem(false);
    
    

    const episodioId = ep.cod_ep_urgenc;
    const utenteId   = ep.num_utent;

    try {
      const [uRes, aRes, mRes, atosRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/utentes/${utenteId}`),
        fetch(`${API_URL}/api/v1/alertas/${utenteId}`),
        fetch(`${API_URL}/api/v1/medicacao-ativa/utente/${utenteId}`),
        fetch(`${API_URL}/api/v1/atos/episodio/${episodioId}`),
      ]);

      const uData    = await uRes.json();
      const aData    = await aRes.json();
      const mData    = await mRes.json();
      const atosData = await atosRes.json();

      if (!uRes.ok) throw new Error(extrairMensagemErro(uData, 'Erro ao carregar dados do utente.'));

      setUtente(uData || null);
      setAlertas(aRes.ok && Array.isArray(aData) ? aData : []);
      setMedicacaoAtiva(mRes.ok && Array.isArray(mData) ? mData : []);
      setAtos(atosRes.ok && Array.isArray(atosData) ? atosData : []);
      atosRef.current = atosRes.ok && Array.isArray(atosData) ? atosData : [];
      setRiscoIA(null);
      setPrescricao({ cod_medicamento: '', dosagem: '', observacoes: '' });

      // Carregar alergias do utente para cruzamento IA
      await carregarAlergias(utenteId);

      // Triagem já está em ep (vem do TriagemOut)
      setDadosTriagem(ep);
      setFormTriagem({
        cor_triagem: ep?.cor_triagem  || '',
        temperatura: ep?.temperatura  ?? '',
        freq_card:   ep?.freq_card    ?? '',
        freq_resp:   ep?.freq_resp    ?? '',
        sp_o2:       ep?.sp_o2        ?? '',
        sistolica:   ep?.sistolica    ?? '',
        diastolica:  ep?.diastolica   ?? '',
        nivel_dor:   ep?.nivel_dor    ?? '',
        consciencia: ep?.consciencia  || 'Acordado',
      });

      if (focarNaAlta) {
        setTimeout(() => {
          document.getElementById('seccao-alta-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } catch (e) {
      mostrarToast(e.message, 'erro');
    }
  };

  const carregarMedicamentos = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/v1/medicamentos/`);
      const data = await res.json();
      if (res.ok) setMedicamentos(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Erro ao carregar medicamentos:', e); }
  };

  const carregarAlergias = async (utenteId) => {
    try {
      const res  = await fetch(`${API_URL}/api/v1/alergias/utente/${utenteId}`);
      const data = await res.json();
      if (res.ok) setAlergias(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Erro ao carregar alergias:', e); }
  };

  const avaliarRiscoIA = async () => {
    if (!prescricao.cod_medicamento) {
      mostrarToast('Selecciona um medicamento antes de avaliar o risco.', 'aviso');
      return;
    }
    setAvaliacaoRisco(true);
    setRiscoIA(null);
    try {
      const med = medicamentos.find((m) => String(m.cod_medicamento) === String(prescricao.cod_medicamento));
      if (!med) throw new Error('Medicamento não encontrado.');

      const classeNovoMed = med.classe_terapeutica_id;

      // Verificar alergia à classe do novo medicamento
      const alergiaClasse = alergias.find((a) => a.classe_terapeutica_id === classeNovoMed);
      const temAlergia    = alergiaClasse ? 1 : 0;
      const gravidadeAlergia = alergiaClasse ? (MAPA_GRAVIDADE[alergiaClasse.nivel_gravidade] || 0) : 0;

      // Verificar interação com medicação ativa da mesma classe
      const temInteracao = medicacaoAtiva.some((m) => {
        const medAtivo = medicamentos.find((x) => x.cod_medicamento === m.cod_medicamento);
        return medAtivo?.classe_terapeutica_id === classeNovoMed;
      }) ? 1 : 0;

      const idade = calcularIdade(utente?.data_nasc);

      const res = await fetch(`${API_IA}/predict/v1/medicine-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Classe_Novo_Med:     classeNovoMed,
          Tem_Alergia_Classe:  temAlergia,
          Gravidade_Alergia:   gravidadeAlergia,
          Tem_Interacao_Ativa: temInteracao,
          Idade_Utente:        idade,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || 'Erro na avaliação de risco.');
      setRiscoIA(data);
    } catch (e) {
      mostrarToast(e.message, 'erro');
    } finally {
      setAvaliacaoRisco(false);
    }
  };

  const carregarAntecedentes = async () => {
    const utenteId = utente?.num_utent || utente?.numutent;
    if (!utenteId) return;
    try {
      
      const res  = await fetch(`${API_URL}/api/v1/utente-antecedentes/utente/${utenteId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao carregar antecedentes.'));
      setAntecedentes(Array.isArray(data) ? data : []);
      setMostrarAntecedentes(true);
    } catch (e) {
      mostrarToast(e.message, 'erro');
    }
  };

  const atualizarDadosTriagem = async (e) => {
    e.preventDefault();
    const episodioId = episodioSelecionado?.cod_ep_urgenc;
    try {
      
      
      const res = await fetch(`${API_URL}/api/v1/triagens/${episodioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cor_triagem: formTriagem.cor_triagem,
          temperatura: formTriagem.temperatura !== '' ? parseFloat(formTriagem.temperatura) : null,
          freq_card:   formTriagem.freq_card   !== '' ? parseInt(formTriagem.freq_card)     : null,
          freq_resp:   formTriagem.freq_resp   !== '' ? parseInt(formTriagem.freq_resp)     : null,
          sp_o2:       formTriagem.sp_o2       !== '' ? parseFloat(formTriagem.sp_o2)       : null,
          sistolica:   formTriagem.sistolica   !== '' ? parseInt(formTriagem.sistolica)     : null,
          diastolica:  formTriagem.diastolica  !== '' ? parseInt(formTriagem.diastolica)    : null,
          nivel_dor:   formTriagem.nivel_dor   !== '' ? parseInt(formTriagem.nivel_dor)     : null,
          consciencia: formTriagem.consciencia || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao atualizar dados da triagem.'));
      setDadosTriagem(data);
      setModoEdicaoTriagem(false);
      mostrarToast('Dados da triagem atualizados com sucesso.', 'sucesso');
      await carregarEpisodios();
    } catch (e) {
      mostrarToast(e.message, 'erro');
    }
  };

  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({ ...prev, [name]: value }));
    if (name === 'cod_medicamento') setRiscoIA(null);
  };

  const handleAltaChange = (e) => {
    const { name, value } = e.target;
    setAlta((prev) => ({ ...prev, [name]: value }));
  };

  const adicionarPrescricao = async (e) => {
    e.preventDefault();
    try {
      
      
      const utenteId = utente?.num_utent || utente?.numutent;

      // Usa o ato mais recente do episódio
      const idAto = atosRef.current.length > 0 ? atosRef.current[0].id_ato : null;
      if (!idAto) throw new Error('Não existe nenhum ato clínico associado a este episódio.');

      const res = await fetch(`${API_URL}/api/v1/prescricoes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ato:          idAto,
          cod_medicamento: parseInt(prescricao.cod_medicamento),
          dosagem:         prescricao.dosagem,
          observacoes:     prescricao.observacoes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao criar prescrição.'));

      // Se temos resultado da IA, actualiza a prescrição com o score
      if (riscoIA && data.id_prescricao) {
        await fetch(`${API_URL}/api/v1/prescricoes/${data.id_prescricao}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score_risco_ia:    riscoIA.probabilidade,
            validado_por_ia:   true,
            estado_prescricao: riscoIA.risco === 1 ? 'bloqueada' : 'aprovada',
          }),
        });
      }

      mostrarToast('Prescrição registada com sucesso.', 'sucesso');
      setPrescricao({ cod_medicamento: '', dosagem: '', observacoes: '' });
      setRiscoIA(null);
      const mRes = await fetch(`${API_URL}/api/v1/medicacao-ativa/utente/${utenteId}`);
      if (mRes.ok) setMedicacaoAtiva(await mRes.json());
    } catch (e) {
      mostrarToast(e.message, 'erro');
    }
  };

  const registarAlta = async (e) => {
    e.preventDefault();
    try {
      
      
      const episodioId = episodioSelecionado?.cod_ep_urgenc;
      const res = await fetch(`${API_URL}/api/v1/episodios/${episodioId}/alta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alta),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao registar alta.'));
      mostrarToast('Alta ou internamento registado com sucesso.', 'sucesso');
      await carregarEpisodios();
    } catch (e) {
      mostrarToast(e.message, 'erro');
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────

  const renderInformacaoGeral = () => (
    <div className="admin-general-info-group">
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

      <section className="admin-panel-section" style={{ marginTop: '2rem' }}>
        <div className="admin-panel-section__header">
          <h2>🕒 Tempo médio por cor — <span style={{ color: '#007bff' }}>{nomeHospital}</span></h2>
        </div>
        <div className="admin-table-card admin-table-card--full">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{textos?.doctor?.cor || 'Cor de Triagem'}</th>
                <th>{textos?.doctor?.tempoMedio || 'Tempo Médio de Espera'}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cor: 'Vermelho', hex: '#dc3545', key: 'vermelho' },
                { cor: 'Laranja',  hex: '#fd7e14', key: 'laranja'  },
                { cor: 'Amarelo',  hex: '#ffc107', key: 'amarelo'  },
                { cor: 'Verde',    hex: '#28a745', key: 'verde'    },
                { cor: 'Azul',     hex: '#007bff', key: 'azul'     },
              ].map(({ cor, hex, key }) => (
                <tr key={key}>
                  <td>
                    <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: hex, marginRight: 8, borderRadius: '50%' }} />
                    {cor}
                  </td>
                  <td><strong>{temposMediosHospital[key]}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderFila = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.doctor?.filaPrioridade || 'Fila resumida por prioridade'}</h2>
      </div>
      <div className="admin-form__group">
        <label>{textos?.geral?.pesquisar || 'Pesquisar'}</label>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)}
          placeholder={textos?.doctor?.placeholderPesquisa || 'Utente, cor, episódio...'} />
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
                <th>Episódio</th>
                <th>{textos?.doctor?.utente || 'Utente'}</th>
                <th>{textos?.doctor?.cor    || 'Cor'}</th>
                <th>{textos?.doctor?.espera || 'Espera'}</th>
                <th>{textos?.doctor?.acao   || 'Ações'}</th>
              </tr>
            </thead>
            <tbody>
              {episodiosFiltrados.length === 0 ? (
                <tr><td colSpan="5">{textos?.geral?.semResultados || 'Sem resultados'}</td></tr>
              ) : (
                episodiosFiltrados.map((ep) => (
                  <tr key={ep.cod_ep_urgenc}>
                    <td>#{ep.cod_ep_urgenc}</td>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{ep.cor_triagem || '—'}</td>
                    <td>{ep.tempo_espera_previsto ? `${ep.tempo_espera_previsto} min` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep, false)}>
                          {textos?.doctor?.atender || 'Atender'}
                        </button>
                        <button type="button" className="admin-secondary-button"
                          style={{ backgroundColor: '#dc3545', color: '#fff', borderColor: '#dc3545' }}
                          onClick={() => abrirEpisodio(ep, true)}>
                          {textos?.doctor?.alta || 'Alta'}
                        </button>
                      </div>
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

  const renderAtendimentoCompleto = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.doctor?.atendimentoPainel || 'Zona de Atendimento Clínico'}</h2>
      </div>

      {episodioSelecionado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* 1. TRIAGEM */}
          <div className="admin-atendimento-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{textos?.doctor?.detalheCompleto || '1. Detalhe completo e Ficha de Triagem'}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="admin-secondary-button"
                  style={{ backgroundColor: '#17a2b8', color: '#fff', borderColor: '#17a2b8' }}
                  onClick={() => setModoEdicaoTriagem(!modoEdicaoTriagem)}>
                  {modoEdicaoTriagem ? '✕ Cancelar' : '✏️ Editar Triagem'}
                </button>
                <button type="button" className="admin-secondary-button"
                  style={{ backgroundColor: '#007bff', color: '#fff', borderColor: '#007bff' }}
                  onClick={carregarAntecedentes}>
                  👁️ Ver Antecedentes
                </button>
              </div>
            </div>

            {mostrarAntecedentes && (
              <div className="admin-table-card" style={{ marginTop: '1rem', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>📋 Antecedentes Clínicos</h4>
                  <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={() => setMostrarAntecedentes(false)}>✕</button>
                </div>
                {antecedentes ? (
                  antecedentes.length === 0 ? (
                    <p>Sem antecedentes registados.</p>
                  ) : (
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                      {antecedentes.map((a, i) => (
                        <li key={i} style={{ margin: '0.3rem 0' }}>
                          <strong>{a.nome || '—'}</strong> ({a.tipo || '—'}) — {a.data_registo || '—'}
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p>A carregar antecedentes...</p>
                )}
              </div>
            )}

            <div className="admin-table-card" style={{ marginTop: '1rem', padding: '16px 24px' }}>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}
                {episodioSelecionado.tempo_espera_previsto ? ` (Espera: ${episodioSelecionado.tempo_espera_previsto} min)` : ''}
              </p>

              {!modoEdicaoTriagem ? (
                <table className="admin-table">
                  <thead>
                    <tr><th>Parâmetro Clínico</th><th>Valor Registado</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Cor atribuída</strong></td><td><strong>{dadosTriagem?.cor_triagem || '—'}</strong></td></tr>
                    <tr><td><strong>Sintomas</strong></td><td>{dadosTriagem?.sintomas || '—'}</td></tr>
                    <tr><td><strong>Temperatura (°C)</strong></td><td>{dadosTriagem?.temperatura != null ? `${dadosTriagem.temperatura} °C` : '—'}</td></tr>
                    <tr><td><strong>Freq. Cardíaca (bpm)</strong></td><td>{dadosTriagem?.freq_card != null ? `${dadosTriagem.freq_card} bpm` : '—'}</td></tr>
                    <tr><td><strong>Freq. Respiratória (rpm)</strong></td><td>{dadosTriagem?.freq_resp != null ? `${dadosTriagem.freq_resp} rpm` : '—'}</td></tr>
                    <tr><td><strong>SpO₂ (%)</strong></td><td>{dadosTriagem?.sp_o2 != null ? `${dadosTriagem.sp_o2} %` : '—'}</td></tr>
                    <tr>
                      <td><strong>Tensão Arterial</strong></td>
                      <td>{dadosTriagem?.sistolica != null || dadosTriagem?.diastolica != null
                        ? `${dadosTriagem.sistolica ?? '—'} / ${dadosTriagem.diastolica ?? '—'} mmHg` : '—'}</td>
                    </tr>
                    <tr><td><strong>Nível de Dor</strong></td><td>{dadosTriagem?.nivel_dor != null ? `${dadosTriagem.nivel_dor} / 10` : '—'}</td></tr>
                    <tr><td><strong>Consciência</strong></td><td><span style={{ fontStyle: 'italic' }}>{dadosTriagem?.consciencia || '—'}</span></td></tr>
                    <tr><td><strong>Enfermeiro</strong></td><td>{dadosTriagem?.nome_enfermeiro || '—'}</td></tr>
                  </tbody>
                </table>
              ) : (
                <form onSubmit={atualizarDadosTriagem} style={{ marginTop: '1rem', background: '#fff', padding: '1rem', border: '1px dashed #17a2b8', borderRadius: 6 }}>
                  <div className="admin-form__grid">
                    <div className="admin-form__group">
                      <label>Cor da Triagem</label>
                      <select value={formTriagem.cor_triagem} onChange={(e) => setFormTriagem({ ...formTriagem, cor_triagem: e.target.value })} required>
                        <option value="">— seleccionar —</option>
                        <option value="vermelho">Vermelho</option>
                        <option value="laranja">Laranja</option>
                        <option value="amarelo">Amarelo</option>
                        <option value="verde">Verde</option>
                        <option value="azul">Azul</option>
                      </select>
                    </div>
                    <div className="admin-form__group">
                      <label>Temperatura (°C)</label>
                      <input type="number" step="0.1" value={formTriagem.temperatura} onChange={(e) => setFormTriagem({ ...formTriagem, temperatura: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Freq. Cardíaca (bpm)</label>
                      <input type="number" value={formTriagem.freq_card} onChange={(e) => setFormTriagem({ ...formTriagem, freq_card: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Freq. Respiratória (rpm)</label>
                      <input type="number" value={formTriagem.freq_resp} onChange={(e) => setFormTriagem({ ...formTriagem, freq_resp: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>SpO₂ (%)</label>
                      <input type="number" step="0.1" value={formTriagem.sp_o2} onChange={(e) => setFormTriagem({ ...formTriagem, sp_o2: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Sistólica (mmHg)</label>
                      <input type="number" value={formTriagem.sistolica} onChange={(e) => setFormTriagem({ ...formTriagem, sistolica: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Diastólica (mmHg)</label>
                      <input type="number" value={formTriagem.diastolica} onChange={(e) => setFormTriagem({ ...formTriagem, diastolica: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Nível de Dor (0–10)</label>
                      <input type="number" min="0" max="10" value={formTriagem.nivel_dor} onChange={(e) => setFormTriagem({ ...formTriagem, nivel_dor: e.target.value })} />
                    </div>
                    <div className="admin-form__group">
                      <label>Estado de Consciência</label>
                      <select value={formTriagem.consciencia} onChange={(e) => setFormTriagem({ ...formTriagem, consciencia: e.target.value })}>
                        <option value="Acordado">Acordado</option>
                        <option value="Confuso">Confuso</option>
                        <option value="Inconsciente">Inconsciente</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="admin-form__submit" style={{ backgroundColor: '#17a2b8', marginTop: '1.5rem' }}>
                    Actualizar Triagem
                  </button>
                </form>
              )}
            </div>

            <div className="admin-table-card" style={{ marginTop: '1rem', padding: '16px 24px' }}>
              <h3>⚠️ {textos?.doctor?.alertas || 'Alertas Médicos'}</h3>
              {alertas.length > 0 ? (
                alertas.map((a, i) => (
                  <p key={i} style={{ color: '#dc3545', fontWeight: 'bold', margin: '0.4rem 0' }}>
                    • {a.descricao || a.mensagem || a.alerta || '—'}
                  </p>
                ))
              ) : (
                <p>{textos?.doctor?.semAlertas || 'Sem alertas críticos registados.'}</p>
              )}
            </div>

            <div className="admin-table-card" style={{ marginTop: '1rem', padding: '16px 24px' }}>
              <h3>💊 {textos?.doctor?.medicacaoAtiva || 'Medicação habitual ativa'}</h3>
              {medicacaoAtiva.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {medicacaoAtiva.map((m, i) => (
                    <li key={i} style={{ margin: '0.3rem 0' }}>
                      <strong>{m.principio_ativo || m.nome_medicamento || '—'}</strong> — {m.dosagem || '—'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{textos?.doctor?.semMedicacao || 'Nenhum medicamento ativo associado.'}</p>
              )}
            </div>
          </div>

          {/* 2. PRESCRIÇÃO */}
          <div className="admin-atendimento-block">
            <h3 style={{ borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              {textos?.doctor?.prescricao || '2. Emitir Nova Prescrição'}
            </h3>
            <form className="admin-form" onSubmit={adicionarPrescricao} style={{ marginTop: '1rem' }}>
              <div className="admin-form__grid">
                <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                  <label>{textos?.doctor?.medicamento || 'Medicamento'}</label>
                  <select
                    name="cod_medicamento"
                    value={prescricao.cod_medicamento}
                    onChange={(e) => {
                      setPrescricao((prev) => ({ ...prev, cod_medicamento: e.target.value }));
                      setRiscoIA(null);
                    }}
                    required
                  >
                    <option value="">— seleccionar medicamento —</option>
                    {medicamentos.map((m) => (
                      <option key={m.cod_medicamento} value={m.cod_medicamento}>
                        {m.principio_ativo} (Classe {m.classe_terapeutica_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form__group">
                  <label>{textos?.doctor?.dosagem || 'Dosagem'}</label>
                  <input name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} placeholder="Ex: 500mg" required />
                </div>
                <div className="admin-form__group admin-form__group--full">
                  <label>{textos?.doctor?.observacoes || 'Observações'}</label>
                  <textarea name="observacoes" value={prescricao.observacoes} onChange={handlePrescricaoChange} rows={2} placeholder="Notas clínicas sobre a prescrição..." />
                </div>
              </div>

              {/* Resultado da avaliação IA */}
              {riscoIA && (
                <div style={{
                  margin: '1rem 0',
                  padding: '1rem',
                  borderRadius: 6,
                  backgroundColor: riscoIA.risco === 1 ? '#fff3cd' : '#d4edda',
                  border: `1px solid ${riscoIA.risco === 1 ? '#ffc107' : '#28a745'}`,
                }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: riscoIA.risco === 1 ? '#856404' : '#155724' }}>
                    {riscoIA.risco === 1 ? '⚠️ COM RISCO' : '✅ SEM RISCO'} — {(riscoIA.probabilidade * 100).toFixed(1)}% de probabilidade de risco
                  </p>
                  {riscoIA.risco === 1 && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#856404' }}>
                      Atenção: este medicamento pode ter interacção com alergias ou medicação activa do utente.
                    </p>
                  )}
                </div>
              )}

              <div className="admin-actions-row">
                <button
                  type="button"
                  className="admin-secondary-button"
                  style={{ backgroundColor: '#17a2b8', color: '#fff', borderColor: '#17a2b8' }}
                  onClick={avaliarRiscoIA}
                  disabled={avaliacaoRisco}
                >
                  {avaliacaoRisco ? 'A avaliar...' : '🧠 Avaliar Risco IA'}
                </button>
                <button className="admin-form__submit" type="submit">
                  {textos?.doctor?.fazerPrescricao || 'Submeter Prescrição'}
                </button>
              </div>
            </form>
          </div>

          {/* 3. ALTA / INTERNAMENTO */}
          <div className="admin-atendimento-block" id="seccao-alta-form">
            <h3 style={{ borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              {textos?.doctor?.altaInternamento || '3. Alta ou internamento'}
            </h3>
            <form className="admin-form" onSubmit={registarAlta} style={{ marginTop: '1rem' }}>
              <div className="admin-form__grid">
                <div className="admin-form__group">
                  <label>{textos?.doctor?.destino || 'Destino'}</label>
                  <select name="destino" value={alta.destino} onChange={handleAltaChange}>
                    <option value="alta">{textos?.doctor?.alta || 'Alta'}</option>
                    <option value="internamento">{textos?.doctor?.internamento || 'Internamento'}</option>
                  </select>
                </div>
                <div className="admin-form__group">
                  <label>{textos?.doctor?.destinoInternamento || 'Unidade/Serviço de destino'}</label>
                  <input name="internamento_destino" value={alta.internamento_destino} onChange={handleAltaChange} placeholder="Ex: Medicina Interna" />
                </div>
                <div className="admin-form__group admin-form__group--full">
                  <label>{textos?.doctor?.observacoes || 'Observações de Encerramento'}</label>
                  <textarea name="observacoes" value={alta.observacoes} onChange={handleAltaChange} rows="4" />
                </div>
              </div>
              <div className="admin-actions-row">
                <button className="admin-form__submit" type="submit" style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}>
                  {textos?.doctor?.confirmar || 'Confirmar Decisão Final'}
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : (
        <p>{textos?.doctor?.selecionaTriado || 'Selecione um paciente na Fila por Prioridade para abrir a zona de atendimento.'}</p>
      )}
    </section>
  );

  const renderCenter = () => {
    switch (mainMenu) {
      case 'informacao_geral': return renderInformacaoGeral();
      case 'fila':             return renderFila();
      case 'atendimento':      return renderAtendimentoCompleto();
      default:                 return renderInformacaoGeral();
    }
  };

  const renderMenuGroup = (group) => (
    <div className="admin-sidebar__group" key={group.title}>
      <span className="admin-sidebar__group-title">{group.title}</span>
      {group.items.map((item) => (
        <button key={item.key} type="button"
          className={`admin-sidebar__link ${mainMenu === item.key ? 'is-active' : ''}`}
          onClick={() => setMainMenu(item.key)}>
          {item.icon}
          <span className="link-text">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <main className={`admin-layout doctor-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <button type="button" className="admin-sidebar__toggle"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)} aria-label="Alternar menu lateral">
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
          {menuGroups.map(renderMenuGroup)}
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
            <h1>SIAGUH</h1>
            <p>{textos?.doctor?.descricaoPainel || 'Prioridade, detalhe clínico completo, prescrição e decisão final.'}</p>
          </div>
          <div className="admin-content-body">
            {renderCenter()}
          </div>
        </div>
        <FooterLayout />
      </section>
      <Toast mensagem={toast.mensagem} tipo={toast.tipo} onFechar={fecharToast} />
    </main>
  );
}