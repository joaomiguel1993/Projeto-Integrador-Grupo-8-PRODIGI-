import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../../imagens/Logo.png";
import '../../../styles/main.css';
import '../../../styles/pages/doctor-dashboard.css';
import FooterLayout from '../../../components/layout/FooterLayout';
import { useLanguage } from '../../../contexts/LanguageContext';
import Toast, { useToast } from '../../../components/ui/Toast';
import DoctorQueue from './DoctorQueue';
import DoctorPrescription from './DoctorPrescription';
import DoctorAlta from './DoctorAlta';

/** @constant {string} API_BASE - URL base do servidor Backend obtida do ambiente ou fallback local */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
/** @constant {string} API_URL - Endpoint construído para as chamadas da API v1 */
const API_URL = `${API_BASE}/api/v1`;

/** @constant {string[]} SERVICOS - Listagem dos serviços hospitalares disponíveis para internamento */
const SERVICOS = ['Cardiologia', 'Medicina', 'Ortopedia', 'Cirurgia'];

/** @constant {Object.<string, string>} PREFIXO_SERVICO - Mapeamento de prefixos identificadores para geração de camas */
const PREFIXO_SERVICO = {
  'Cardiologia': 'CAR',
  'Medicina':    'MED',
  'Ortopedia':   'ORT',
  'Cirurgia':    'CIR',
};

/**
 * Gera um número identificador único e aleatório para uma cama com base no serviço.
 * @param {string} servico - Nome do serviço médico.
 * @returns {string} Código alfanumérico da cama (Ex: CAR-12).
 */
const gerarNumeroCama = (servico) => {
  const prefixo = PREFIXO_SERVICO[servico] || 'GER';
  const numero  = String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
  return `${prefixo}-${numero}`;
};

/** @constant {string[]} MOTIVOS_INTERNAMENTO - Catálogo de motivos clínicos para internamentos */
const MOTIVOS_INTERNAMENTO = [
  'Insuficiência cardíaca', 'Pneumonia', 'Fratura óssea', 'Pós-operatório',
  'Monitorização clínica', 'AVC', 'Sépsis', 'Descompensação diabética',
  'Dor torácica', 'Outro',
];

/** @constant {Object.<string, number>} TRIAGE_ORDER - Pesos hierárquicos para ordenação da triagem de Manchester */
const TRIAGE_ORDER = { Vermelho: 1, Laranja: 2, Amarelo: 3, Verde: 4, Azul: 5 };

/** @constant {Object.<string, string>} TRIAGE_CLASS - Classes CSS correspondentes a cada cor de triagem */
const TRIAGE_CLASS = {
  Vermelho: 'triage-badge triage-badge--vermelho',
  Laranja:  'triage-badge triage-badge--laranja',
  Amarelo:  'triage-badge triage-badge--amarelo',
  Verde:    'triage-badge triage-badge--verde',
  Azul:     'triage-badge triage-badge--azul',
};

/**
 * Calcula a idade de um utente com base na sua data de nascimento.
 * @param {string|Date} dataNasc - Data de nascimento do utente.
 * @returns {number} Idade em anos (padrão de 50 anos em caso de dados corrompidos ou inexistentes).
 */
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

/**
 * Normaliza uma string removendo acentuações e caracteres especiais, convertendo para minúsculas.
 * @param {string} texto - Texto original a normalizar.
 * @returns {string} Texto tratado e limpo para comparação.
 */
const normalizar = (texto) =>
  String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Extrai o identificador do medicamento tratando múltiplas estruturas de chaves possíveis vindas da API.
 * @param {Object} m - Objeto do medicamento.
 * @param {number} [index=0] - Índice numérico alternativo.
 * @returns {string} Identificador extraído ou string gerada de fallback.
 */
const getMedicamentoId = (m, index = 0) =>
  String(
    m?.codmedicamento ?? m?.cod_medicamento ?? m?.idmedicamento ??
    m?.id_medicamento ?? m?.id ?? `med-${index}`
  );

/**
 * Extrai o código identificador do Utente procurando por diferentes chaves operacionais do SQL.
 * @param {Object} obj - Estrutura de dados contendo dados do utente.
 * @returns {number|null} Código numérico do utente ou nulo.
 */
const getCodUtente = (obj) =>
  obj?.codutente ?? obj?.cod_utente ?? obj?.numutent ?? obj?.num_utent ??
  obj?.utente_id ?? null;

/**
 * Extrai o código identificador do Episódio de Urgência procurando por variações da nomeclatura da chave.
 * @param {Object} obj - Estrutura de dados contendo dados do episódio.
 * @returns {number|null} Código numérico do episódio de urgência ou nulo.
 */
const getCodEpisodio = (obj) =>
  obj?.codepurgenc ?? obj?.cod_ep_urgenc ?? obj?.codepisodio ??
  obj?.cod_episodio ?? null;

/**
 * Resolve o nome legível de um medicamento de acordo com os dados populados ou catálogo geral.
 * @param {Object} m - Objeto mapeado do medicamento.
 * @param {number} [index=0] - Índice de fallback sequencial.
 * @returns {string} Designação do medicamento.
 */
const getMedicamentoNome = (m, index = 0) => {
  if (!m) return `Medicamento ${String(index + 1).padStart(3, '0')}`;
  const nome =
    m?.nome ?? m?.nome_medicamento ?? m?.nomemedicamento ?? m?.medicamento_nome ??
    m?.nomeMedicamento ?? m?.designacao ?? m?.designacao_comercial ?? m?.descricao ??
    m?.medicamento ?? m?.nomecomercial ?? m?.principioativo ?? m?.principio_ativo ??
    m?.farmaco ?? m?.denominacao ?? '';
  return String(nome).trim() || `Medicamento ${String(index + 1).padStart(3, '0')}`;
};

/**
 * Enriquece a listagem de medicações ativas acoplando as designações e nomes comerciais do catálogo estático.
 * @param {Array} [lista=[]] - Lista de medicação do utente.
 * @param {Array} [medicamentos=[]] - Catálogo geral mapeado.
 * @returns {Array} Lista enriquecida contendo a chave nomeApresentacao.
 */
const enriquecerMedicacaoAtiva = (lista = [], medicamentos = []) =>
  lista.map((item, index) => {
    const itemId = String(
      item?.codmedicamento ?? item?.cod_medicamento ?? item?.idmedicamento ??
      item?.id_medicamento ?? item?.medicamento_id ?? item?.id ?? ''
    );

    const medicamentoCatalogo = medicamentos.find(
      (med) => String(getMedicamentoId(med)) === itemId
    );

    const nomeApresentacao =
      item?.nomeApresentacao || item?.nome || item?.nome_medicamento ||
      item?.nomemedicamento || item?.medicamento_nome || item?.nomeMedicamento ||
      item?.designacao || item?.designacao_comercial || item?.descricao ||
      item?.medicamento || item?.nomecomercial || item?.principioativo ||
      item?.principio_ativo ||
      medicamentoCatalogo?.nome || medicamentoCatalogo?.nome_medicamento ||
      medicamentoCatalogo?.nomemedicamento || medicamentoCatalogo?.medicamento_nome ||
      medicamentoCatalogo?.designacao || medicamentoCatalogo?.designacao_comercial ||
      medicamentoCatalogo?.descricao || medicamentoCatalogo?.principioativo ||
      medicamentoCatalogo?.principio_ativo ||
      getMedicamentoNome(medicamentoCatalogo, index);

    return { ...item, nomeApresentacao };
  });

/**
 * Componente funcional utilitário para renderizar o título e subtítulo de uma secção operacional.
 * @component
 */
function SectionHeader({ title, subtitle }) {
  return (
    <div className="doctor-section-header">
      <h2 className="doctor-section-header__title">{title}</h2>
      {subtitle ? <p className="doctor-section-header__subtitle">{subtitle}</p> : null}
    </div>
  );
}

/** @constant {Object} iconProps - Atributos SVG genéricos reutilizados por consistência visual nos ícones */
const iconProps = {
  viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
  'aria-hidden': 'true',
};
const SvgMenu = () => (
  <svg {...iconProps} strokeWidth="2.4">
    <path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" />
  </svg>
);
const SvgList = () => (
  <svg {...iconProps}>
    <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" />
    <path d="M3 6h.01" /><path d="M3 12h.01" /><path d="M3 18h.01" />
  </svg>
);
const SvgClipboard = () => (
  <svg {...iconProps}>
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
);
const SvgExit = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
  </svg>
);
const SvgInfo = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);
const SvgFileText = () => (
  <svg {...iconProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /><path d="M8 9h2" />
  </svg>
);
const IconMenu = SvgMenu;
const IconChart = SvgInfo;
const IconQueue = SvgList;
const IconExit = SvgExit;
const IconBed = SvgFileText;

/**
 * Componente Principal da Página do Dashboard do Médico.
 * Centraliza filas de triagem, atendimentos em curso, fluxos de prescrição com análise de IA e internamentos ativos.
 * @component
 */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos } = useLanguage();
  const { toast, mostrarToast, fecharToast } = useToast();

  const [medicamentos, setMedicamentos]                 = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed]     = useState(false);
  const [activeMenu, setActiveMenu]                     = useState('informacao_geral');
  const [subMenuFila, setSubMenuFila]                   = useState('em_espera');
  const [episodios, setEpisodios]                       = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado]   = useState(null);
  const [acaoClinica, setAcaoClinica]                   = useState('');
  const [aSubmeterDecisao, setASubmeterDecisao]         = useState(false);
  const [filtro, setFiltro]                             = useState('');
  const [utente, setUtente]                             = useState(null);
  const [alertas, setAlertas]                           = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva]             = useState([]);
  const [antecedentes, setAntecedentes]                 = useState(null);
  const [dadosTriagem, setDadosTriagem]                 = useState(null);
  const [tabAtendimento, setTabAtendimento]             = useState('vitais');
  const [internamentos, setInternamentos]               = useState([]);
  const [internamentoSelecionado, setInternamentoSelecionado] = useState(null);
  const [altaInternamento, setAltaInternamento]         = useState({ tipo_alta: 'clinica', observacoes: '' });
  const [modoEdicaoTriagem, setModoEdicaoTriagem]       = useState(false);
  const [formTriagem, setFormTriagem]                   = useState({
    cortriagem: '', tempoesperaprevisto: '', temperatura: '', freqcard: '',
    freqresp: '', spo2: '', sistolica: '', diastolica: '', niveldor: '',
    consciencia: '', sintomas: '', nomeenfermeiro: '',
  });
  const [prescricao, setPrescricao]                     = useState({ codmedicamento: '', dosagem: '', observacoes: '' });
  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—', laranja: '—', amarelo: '—', verde: '—', azul: '—',
  });
  const [alergias, setAlergias]                         = useState([]);
  const [atos, setAtos]                                 = useState([]);
  const atosRef                                         = useRef([]);
  const [riscoIA, setRiscoIA]                           = useState(null);
  const [avaliacaoRisco, setAvaliacaoRisco]             = useState(false);
  const [alta, setAlta]                                 = useState({
    destino: 'alta', observacoes: '', servico: '', numero_cama: '',
    motivo_int: '', motivo_int_outro: '',
  });

  const [tipoDecisao, setTipoDecisao] = useState('alta');

  /** @type {Object} utilizadorLogado - Dados do utilizador autenticado lidos a partir do sessionStorage */
  const utilizadorLogado = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

  /**
   * Resolve e extrai um campo dinâmico de um objeto, testando uma lista de chaves prioritárias.
   * @param {Object} obj - Objeto de leitura.
   * @param {...string} keys - Chaves sequenciais de teste.
   * @returns {*} Valor resolvido ou traço identificador nulo.
   */
  const getField = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null) return value;
    }
    return '—';
  };

  const nomeUtilizador =
    utilizadorLogado?.nome || utilizadorLogado?.name ||
    utilizadorLogado?.username || 'Utilizador';

  const nomeHospital =
    utilizadorLogado?.hospitais?.[0]?.nome || 'Hospital de Santa Maria';

  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  /** @type {function(): string|null} token - Retorna o JWT ativo armazenado em cache */
  const token   = () => sessionStorage.getItem('token');
  
  /** @type {function(): Object} headers - Constrói os cabeçalhos HTTP padrões com a Bearer auth */
  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`,
  });

  useEffect(() => { carregarTudo(); }, []);

  /**
   * Dispara a rotina paralela de carregamento dos buffers operacionais das tabelas hospitalares.
   */
  const carregarTudo = () => {
    carregarEpisodios();
    carregarTemposMedios();
    carregarInternamentos();
    carregarMedicamentos();
  };

  // ── Loaders ────────────────────────────────────────────────

  /**
   * Consome a API buscando episódios de urgência em aberto vinculados ao hospital corrente do profissional.
   */
  const carregarEpisodios = async () => {
    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) {
      console.error('Hospital ID não encontrado.');
      setEpisodios([]);
      return;
    }

    try {
      const r = await fetch(`${API_URL}/episodios/hospital/${hospitalId}`, { headers: headers() });
      if (r.ok) {
        const data = await r.json();
        setEpisodios(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro carregarEpisodios:', r.status);
        setEpisodios([]);
      }
    } catch (e) {
      console.error(e);
      setEpisodios([]);
    }
  };

  /**
   * Requisita predições históricas de tempos médios de permanência do hospital por prioridade de triagem.
   */
  const carregarTemposMedios = async () => {
    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;
    if (!hospitalId) return;

    try {
      const r = await fetch(`${API_URL}/predict/tempos-espera/${hospitalId}`, { headers: headers() });
      if (r.ok) {
        const data = await r.json();
        const tempos = data?.tempos_espera || data || {};
        setTemposMediosHospital({
          vermelho: tempos?.vermelho?.minutos != null ? `${tempos.vermelho.minutos} min` : '—',
          laranja:  tempos?.laranja?.minutos  != null ? `${tempos.laranja.minutos} min`  : '—',
          amarelo:  tempos?.amarelo?.minutos  != null ? `${tempos.amarelo.minutos} min`  : '—',
          verde:    tempos?.verde?.minutos    != null ? `${tempos.verde.minutos} min`    : '—',
          azul:     tempos?.azul?.minutos     != null ? `${tempos.azul.minutos} min`     : '—',
        });
      }
    } catch (e) { console.error(e); }
  };

  /**
   * Atualiza o estado interno da grid listando utentes sob internamento clínico no hospital corrente.
   */
  const carregarInternamentos = async () => {
    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) { setInternamentos([]); return; }

    try {
      const r = await fetch(`${API_URL}/internamentos/hospital/${hospitalId}`, { headers: headers() });
      if (r.ok) {
        const data = await r.json();
        setInternamentos(Array.isArray(data) ? data : []);
      } else {
        setInternamentos([]);
      }
    } catch (e) {
      console.error(e);
      setInternamentos([]);
    }
  };

  /**
   * Puxa do catálogo geral todos os fármacos catalogados para suportar o dropdown das receitas.
   */
  const carregarMedicamentos = async () => {
    try {
      const r = await fetch(`${API_URL}/medicamentos/`, { headers: headers() });
      if (r.ok) {
        const data = await r.json();
        setMedicamentos(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro carregarMedicamentos:', r.status);
        setMedicamentos([]);
      }
    } catch (e) {
      console.error(e);
      setMedicamentos([]);
    }
  };

  // ── Handlers ───────────────────────────────────────────────

  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({ ...prev, [name]: value }));
  };

  // ── Abrir episódio ─────────────────────────────────────────

  /**
   * Carrega todos os históricos e dados vitais cruzados para abrir o painel de consulta do utente.
   * @param {Object} ep - Instância resumida do episódio clínico selecionado na grid.
   */
  const abrirEpisodio = async (ep) => {
    if (!ep) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }

    const numUtente   = getCodUtente(ep);
    const codEpisodio = getCodEpisodio(ep);

    if (!numUtente || !codEpisodio) {
      mostrarToast(textos?.doctor?.erroDadosEpInvalido || 'Dados do episódio inválidos.', 'erro');
      return;
    }

    setEpisodioSelecionado(ep);
    setSubMenuFila('atendimento');
    setTabAtendimento('vitais');
    setRiscoIA(null);

    try {
      const [rUtente, rTriagem, rAlertas, rMedicacao, rAtos, rAlergias] =
        await Promise.all([
          fetch(`${API_URL}/utentes/${numUtente}`,               { headers: headers() }),
          fetch(`${API_URL}/triagens/${codEpisodio}`,           { headers: headers() }),
          fetch(`${API_URL}/alertas/utente/${numUtente}`,       { headers: headers() }),
          fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, { headers: headers() }),
          fetch(`${API_URL}/atos/episodio/${codEpisodio}`,      { headers: headers() }),
          fetch(`${API_URL}/alergias/utente/${numUtente}`,      { headers: headers() }),
        ]);

      if (rUtente.ok)    { setUtente(await rUtente.json()); }
      else               { setUtente(null); }

      if (rTriagem.ok)   { setDadosTriagem(await rTriagem.json()); }
      else               { setDadosTriagem(null); }

      if (rAlertas.ok)   { const a = await rAlertas.json(); setAlertas(Array.isArray(a) ? a : []); }
      else               { setAlertas([]); }

      if (rMedicacao.ok) { const m = await rMedicacao.json(); setMedicacaoAtiva(Array.isArray(m) ? m : []); }
      else               { setMedicacaoAtiva([]); }

      if (rAtos.ok) {
        const lista = await rAtos.json();
        const final = Array.isArray(lista) ? lista : [];
        setAtos(final);
        atosRef.current = final;
      } else {
        setAtos([]);
        atosRef.current = [];
      }

      if (rAlergias.ok)  { const al = await rAlergias.json(); setAlergias(Array.isArray(al) ? al : []); }
      else               { setAlergias([]); }

    } catch (e) {
      console.error(e);
      mostrarToast(textos?.doctor?.erroAbrirEp || 'Erro ao abrir episódio.', 'erro');
    }
  };

  // ── Abrir internamento ─────────────────────────────────────

  /**
   * Altera a interface focando na ficha técnica de monitorização de um utente internado numa enfermaria específica.
   * @param {Object} int - Registro de internamento.
   */
  const abrirInternamento = async (int) => {
    if (!int) { mostrarToast(textos?.doctor?.erroIntInvalido || 'Internamento inválido.', 'erro'); return; }

    try {
      setInternamentoSelecionado(int);
      setEpisodioSelecionado(null);
      setActiveMenu('internamentos');

      const numUtente   = getField(int, 'num_utent', 'numUtente', 'numutente', 'num_utente', 'codutente');
      const codEpisodio = getField(int, 'cod_ep_urgenc', 'codEpisodio', 'codepisodio', 'cod_epurgenc');

      const [rUtente, rMedicacao, rAlergias, rAntecedentes, rAtos] = await Promise.all([
        numUtente   ? fetch(`${API_URL}/utentes/${numUtente}`,                  { headers: headers() }) : Promise.resolve(null),
        numUtente   ? fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`,   { headers: headers() }) : Promise.resolve(null),
        numUtente   ? fetch(`${API_URL}/alergias/utente/${numUtente}`,          { headers: headers() }) : Promise.resolve(null),
        numUtente   ? fetch(`${API_URL}/historico/${numUtente}`,                { headers: headers() }) : Promise.resolve(null),
        codEpisodio ? fetch(`${API_URL}/atos/episodio/${codEpisodio}`,          { headers: headers() }) : Promise.resolve(null),
      ]);

      if (rUtente?.ok)        { setUtente(await rUtente.json()); }          else { setUtente(null); }
      if (rMedicacao?.ok)     { const d = await rMedicacao.json();   setMedicacaoAtiva(Array.isArray(d) ? d : []); } else { setMedicacaoAtiva([]); }
      if (rAlergias?.ok)      { const d = await rAlergias.json();    setAlergias(Array.isArray(d) ? d : []); }       else { setAlergias([]); }
      if (rAntecedentes?.ok)  { setAntecedentes(await rAntecedentes.json()); } else { setAntecedentes(null); }
      if (rAtos?.ok) {
        const d = await rAtos.json();
        const lista = Array.isArray(d) ? d : [];
        setAtos(lista);
        atosRef.current = lista;
      } else {
        setAtos([]);
        atosRef.current = [];
      }

      setAlertas([]);
      setTabAtendimento('prescricao');
    } catch (e) {
      console.error('Erro ao abrir internamento:', e);
      mostrarToast(textos?.doctor?.erroAbrirInt || 'Erro ao abrir internamento.', 'erro');
    }
  };

  // ── Prescrição ─────────────────────────────────────────────

  /**
   * Envia uma nova ordem de prescrição medicamentosa ligando-a ao ato clínico associado do episódio.
   */
  const submeterPrescricao = async () => {
    try {
      const codEpisodio =
        getCodEpisodio(episodioSelecionado) ||
        getField(internamentoSelecionado, 'cod_ep_urgenc', 'codEpisodio', 'codepisodio', 'cod_epurgenc');

      if (!codEpisodio) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }

      const atoSelecionado = Array.isArray(atos) && atos.length > 0 ? atos[0] : null;
      const idAto = atoSelecionado?.idato ?? atoSelecionado?.id_ato ?? null;

      if (!idAto) { mostrarToast(textos?.doctor?.erroSemAto || 'Não existe ato clínico associado ao episódio.', 'erro'); return; }
      if (!prescricao?.codmedicamento || !prescricao?.dosagem) {
        mostrarToast(textos?.doctor?.erroSelMedDosagem || 'Seleciona medicamento e dosagem.', 'erro');
        return;
      }

      const body = {
        id_ato:          Number(idAto),
        cod_medicamento: Number(prescricao.codmedicamento),
        dosagem:         String(prescricao.dosagem).trim(),
        observacoes:     prescricao.observacoes?.trim() || null,
      };

      const r = await fetch(`${API_URL}/prescricoes`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });

      const responseText = await r.text();

      if (!r.ok) {
        mostrarToast(`${textos?.doctor?.erroPrescrever || 'Erro ao prescrever'} (${r.status}).`, 'erro');
        return;
      }

      const created = responseText ? JSON.parse(responseText) : null;

      const medicamentoSelecionado = medicamentos.find(
        (m, index) => String(getMedicamentoId(m, index)) === String(prescricao.codmedicamento)
      );

      const nomeMedicamento =
        medicamentoSelecionado?.nome || medicamentoSelecionado?.nomemedicamento ||
        medicamentoSelecionado?.designacao || medicamentoSelecionado?.descricao ||
        getMedicamentoNome(medicamentoSelecionado) || 'Medicamento';

      const novaMedicacao = {
        id:                 created?.id_prescricao ?? `tmp-${Date.now()}`,
        idprescricao:       created?.id_prescricao ?? null,
        idato:              created?.id_ato ?? Number(idAto),
        codmedicamento:     created?.cod_medicamento ?? Number(prescricao.codmedicamento),
        dosagem:            created?.dosagem ?? prescricao.dosagem,
        observacoes:        created?.observacoes ?? prescricao.observacoes ?? '',
        estadoprescricao:   created?.estado_prescricao ?? 'pendente',
        nomeApresentacao:   nomeMedicamento,
      };

      setMedicacaoAtiva((prev) => [novaMedicacao, ...(Array.isArray(prev) ? prev : [])]);

      setPrescricao({ codmedicamento: '', dosagem: '', observacoes: '' });
      setRiscoIA(null);
      mostrarToast((textos?.doctor?.sucessoPrescrever || "Prescrição de {nome} registada com sucesso.").replace("{nome}", nomeMedicamento), 'sucesso');
    } catch (e) {
      console.error('ERRO submeterPrescricao:', e);
      mostrarToast(textos?.doctor?.erroPrescrever || 'Erro ao prescrever.', 'erro');
    }
  };

  // ── Avaliação de risco IA ──────────────────────────────────

  /**
   * Executa a análise de validação e risco clínico de forma síncrona/assíncrona contra o array de alergias do utente.
   */
  const avaliarRiscoIAFn = async () => {
    if (!prescricao?.codmedicamento) {
      mostrarToast(textos?.doctor?.erroSelMed || 'Seleciona um medicamento.', 'erro');
      return;
    }

    setAvaliacaoRisco(true);

    try {
      const med = medicamentos.find(
        (m) => String(getMedicamentoId(m)) === String(prescricao.codmedicamento)
      );
      const nomeMed = med ? getMedicamentoNome(med) : 'Medicamento';

      const existeAlergia = alergias.some((a) => {
        const txt = String(a?.descricao || a?.substancia || a?.alergia || '').toLowerCase();
        return txt.includes(nomeMed.toLowerCase());
      });

      const resultado = existeAlergia
        ? { risco: 1, riscoalto: true,  mensagem: 'Possível alergia detetada.',      explicacao: `O utente pode ter alergia a ${nomeMed}.` }
        : { risco: 0, riscoalto: false, mensagem: 'Sem risco conhecido.',             explicacao: `Não foram encontradas alergias registadas para ${nomeMed}.` };

      setRiscoIA(resultado);
      mostrarToast(textos?.doctor?.sucessoAvaliacao || 'Avaliação concluída.', 'sucesso');
    } catch (e) {
      console.error(e);
      mostrarToast(textos?.doctor?.erroAvaliacao || 'Erro na avaliação IA.', 'erro');
    } finally {
      setAvaliacaoRisco(false);
    }
  };

  // ── Decisão clínica (urgência) ─────────────────────────────

  /**
   * Submete a decisão de alta hospitalar definitiva ou transferência de fluxo interno para internamento em enfermaria.
   */
  const submeterDecisaoClinica = async () => {
    try {
      if (aSubmeterDecisao) return;

      const codEpisodio =
        episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codep_urgenc ||
        episodioSelecionado?.cod_epurgenc  || episodioSelecionado?.codepurgenc;

      if (!codEpisodio) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }
      if (!acaoClinica)  { mostrarToast(textos?.doctor?.erroSelAltaInt || 'Selecione Alta ou Internamento.', 'erro'); return; }
      if (acaoClinica === 'internamento' && !alta.servico) {
        mostrarToast(textos?.doctor?.erroSelServico || 'Selecione o serviço de internamento.', 'erro');
        return;
      }
      if (acaoClinica === 'internamento' && !alta.motivo_int) {
        mostrarToast(textos?.doctor?.erroSelMotivo || 'Selecione o motivo do internamento.', 'erro');
        return;
      }

      setASubmeterDecisao(true);
      const agora = new Date().toISOString();

      if (acaoClinica === 'internamento') {
        const payloadInt = {
          cod_ep_urgenc:      Number(codEpisodio),
          id_func:            null,
          data_hora_int:      agora,
          data_hora_consulta: null,
          data_hora_alta:     null,
          motivo_int:
            alta.motivo_int === 'Outro'
              ? alta.motivo_int_outro || 'Outro'
              : alta.motivo_int,
          numero_cama: gerarNumeroCama(alta.servico),
          servico:     alta.servico     || null,
          tipo_alta:   null,
        };

        const rInt = await fetch(`${API_URL}/internamentos/`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(payloadInt),
        });

        if (!rInt.ok) {
          const txt = await rInt.text();
          console.error('Erro POST internamento:', rInt.status, txt);
          throw new Error(`Erro ao criar internamento (${rInt.status})`);
        }
      }

      const payloadEp = {
        estado: acaoClinica === 'alta' ? 'terminado' : 'internado',
        data_hora_saida: acaoClinica === 'alta' ? agora : null,
      };

      const r = await fetch(`${API_URL}/episodios/${codEpisodio}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payloadEp),
      });

      if (!r.ok) throw new Error(`Erro ao atualizar episódio (${r.status})`);

      setEpisodios((prev) =>
        prev.map((ep) => {
          const epCod = ep?.cod_ep_urgenc || ep?.codep_urgenc || ep?.cod_epurgenc || ep?.codepurgenc;
          if (String(epCod) !== String(codEpisodio)) return ep;
          return {
            ...ep,
            estado:       acaoClinica === 'alta' ? 'terminado' : 'internado',
            estado_local: acaoClinica === 'alta' ? 'terminado' : 'internado',
          };
        })
      );

      mostrarToast(
        acaoClinica === 'alta' ? (textos?.doctor?.sucessoAlta || 'Alta registada com sucesso.') : (textos?.doctor?.sucessoInt || 'Internamento registado com sucesso.'),
        'success'
      );

      setAlta({ destino: 'alta', observacoes: '', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '' });
      setAcaoClinica('');
      setEpisodioSelecionado(null);
      setUtente(null);
      setDadosTriagem(null);
      setAlertas([]);
      setMedicacaoAtiva([]);
      setAlergias([]);
      setTabAtendimento('vitais');
      setSubMenuFila('em_espera');

      await carregarEpisodios();
      await carregarInternamentos();
    } catch (e) {
      console.error('ERRO submeterDecisaoClinica', e);
      mostrarToast(e.message || (textos?.doctor?.erroDecisao || 'Erro ao registar decisão clínica.'), 'erro');
    } finally {
      setASubmeterDecisao(false);
    }
  };

  // ── Alta de internamento ───────────────────────────────────

  /**
   * Finaliza o percurso de internamento clínico registando a alta médica e liberando a cama associada.
   */
  const submeterAltaInternamento = async () => {
    try {
      if (!internamentoSelecionado) { mostrarToast(textos?.doctor?.erroIntInvalido || 'Internamento inválido.', 'erro'); return; }

      const codInternamento = getField(
        internamentoSelecionado,
        'codinternamento', 'cod_internamento', 'idinternamento', 'id_internamento'
      );

      if (!codInternamento) { mostrarToast(textos?.doctor?.erroCodIntInvalido || 'Código do internamento inválido.', 'erro'); return; }

      const payload = {
        tipoalta:    altaInternamento.tipo_alta || 'clinica',
        observacoes: altaInternamento.observacoes?.trim() || '',
        dataalta:    new Date().toISOString(),
        estado:      'concluido',
      };

      const r = await fetch(`${API_URL}/internamentos/${codInternamento}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error(`Erro ao registar alta do internamento (${r.status})`);

      mostrarToast(textos?.doctor?.sucessoAltaInt || 'Alta de internamento registada com sucesso.', 'sucesso');

      setAltaInternamento({ tipo_alta: 'clinica', observacoes: '' });
      setInternamentoSelecionado(null);
      setUtente(null);
      setMedicacaoAtiva([]);
      setAlergias([]);
      setAlertas([]);
      setAntecedentes(null);

      await carregarInternamentos();
    } catch (e) {
      console.error('ERRO submeterAltaInternamento:', e);
      mostrarToast(e.message || (textos?.doctor?.erroAltaInt || 'Erro ao registar alta do internamento.'), 'erro');
    }
  };

  // ── Guardar edição de triagem ──────────────────────────────

  /**
   * Submete a atualização manual dos sinais vitais modificados diretamente na visualização do painel médico.
   */
  const guardarEdicaoTriagem = async () => {
    try {
      const codEpisodio = getCodEpisodio(episodioSelecionado);
      if (!codEpisodio) { mostrarToast(textos?.doctor?.erroCodEpNaoEncontrado || 'Código do episódio não encontrado.', 'erro'); return; }

      const payload = {
        temperatura: formTriagem.temperatura || null,
        freq_card:   formTriagem.freqcard    || null,
        freq_resp:   formTriagem.freqresp    || null,
        sp_o2:       formTriagem.spo2        || null,
        sistolica:   formTriagem.sistolica   || null,
        diastolica:  formTriagem.diastolica  || null,
        sintomas:    formTriagem.sintomas    || null,
      };

      const response = await fetch(`${API_URL}/triagens/${codEpisodio}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro ao guardar triagem: ${response.status}`);

      const responseText    = await response.text();
      const triagemAtualizada = responseText ? JSON.parse(responseText) : {};

      setDadosTriagem((prev) => ({
        ...(prev || {}),
        ...triagemAtualizada,
        temperatura: triagemAtualizada?.temperatura  ?? formTriagem.temperatura ?? prev?.temperatura ?? '',
        freqcard:    triagemAtualizada?.freqcard ?? triagemAtualizada?.freq_card ?? formTriagem.freqcard ?? prev?.freqcard ?? '',
        freqresp:    triagemAtualizada?.freqresp ?? triagemAtualizada?.freq_resp ?? formTriagem.freqresp ?? prev?.freqresp ?? '',
        spo2:        triagemAtualizada?.spo2     ?? triagemAtualizada?.sp_o2     ?? formTriagem.spo2     ?? prev?.spo2     ?? '',
        sistolica:   triagemAtualizada?.sistolica  ?? formTriagem.sistolica  ?? prev?.sistolica  ?? '',
        diastolica:  triagemAtualizada?.diastolica ?? formTriagem.diastolica ?? prev?.diastolica ?? '',
        sintomas:    triagemAtualizada?.sintomas   ?? formTriagem.sintomas   ?? prev?.sintomas   ?? '',
      }));

      setModoEdicaoTriagem(false);
      mostrarToast(textos?.doctor?.sucessoTriagemAtu || 'Triagem updated com sucesso.', 'sucesso');
    } catch (error) {
      console.error('ERRO guardarEdicaoTriagem', error);
      mostrarToast(textos?.doctor?.erroTriagemAtu || 'Erro ao guardar edição da triagem.', 'erro');
    }
  };

  // ── Tempo de espera ────────────────────────────────────────

  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  /**
   * Calcula o delta dinâmico em minutos passados desde o início do carimbo de triagem do paciente.
   * @param {string|Date} dataTriagem - Data hora de início do processo de triagem.
   * @returns {number|null} Minutos totais decorridos.
   */
  const calcularTempoEsperaMin = (dataTriagem) => {
    if (!dataTriagem) return null;
    const inicio = new Date(dataTriagem).getTime();
    if (Number.isNaN(inicio)) return null;
    const diff = agora - inicio;
    const min  = Math.floor(diff / 60000);
    return min < 0 ? 0 : min;
  };

  // ── Listas derivadas ───────────────────────────────────────

  const episodiosOrdenados = useMemo(() => {
    return [...episodios]
      .filter((ep) => {
        const estado     = ep.estado || ep.estado_local || ep.estado_episodio;
        const corTriagem = ep.cor_triagem || ep.cortriagem;
        if (estado === 'terminado') return false;
        if (!corTriagem) return false;
        if (!filtro) return true;
        const f = normalizar(filtro);
        return normalizar(ep.nome_utente || '').includes(f) || normalizar(corTriagem || '').includes(f);
      })
      .sort((a, b) => {
        const corA = a.cor_triagem || a.cortriagem;
        const corB = b.cor_triagem || b.cortriagem;
        return (TRIAGE_ORDER[corA] || 9) - (TRIAGE_ORDER[corB] || 9);
      });
  }, [episodios, filtro]);

  const totalEmEspera    = episodios.length;
  const altasHoje        = 0;
  const totalInternamentos = internamentos.length;

  const menus = [
    { id: 'informacao_geral', label: textos?.doctor?.informacaoGeral || 'Informação Geral',       icon: <IconChart /> },
    { id: 'fila_triagens',    label: textos?.doctor?.filaTriagens || 'Fila de Triagens',      icon: <IconQueue /> },
    { id: 'internamentos',    label: textos?.doctor?.internamentosAtivos || 'Internamentos Ativos',  icon: <IconBed />   },
  ];

  // ── Renders ────────────────────────────────────────────────

  const renderInformacaoGeral = () => (
    <div className="doctor-panel-card">
      <SectionHeader title={textos?.doctor?.informacaoGeral || "Informação Geral"} subtitle={textos?.doctor?.resumoClinico || "Resumo clínico e tempos de espera por prioridade"} />
      <div className="doctor-kpi-grid">
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--blue">📋</div>
          <div><div className="doctor-kpi-card__label">{textos?.doctor?.epEspera || "Episódios em espera"}</div><div className="doctor-kpi-card__value">{totalEmEspera}</div></div>
        </div>
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--green">✓</div>
          <div><div className="doctor-kpi-card__label">{textos?.doctor?.altasHoje || "Altas hoje"}</div><div className="doctor-kpi-card__value">{altasHoje}</div></div>
        </div>
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--purple">🏥</div>
          <div><div className="doctor-kpi-card__label">{textos?.doctor?.intAtivos || "Internamentos ativos"}</div><div className="doctor-kpi-card__value">{totalInternamentos}</div></div>
        </div>
      </div>
      <div className="doctor-triage-times-card">
        <h3 className="doctor-card-title">{textos?.doctor?.tempoEsperaCor || "Tempo de Espera por Cor de Triagem"}</h3>
        <p className="doctor-card-subtitle">{textos?.doctor?.distribuicaoAtual || "Distribuição atual do tempo médio no hospital"}</p>
        <div className="doctor-triage-times-grid">
          {[['vermelho','Vermelho'],['laranja','Laranja'],['amarelo','Amarelo'],['verde','Verde'],['azul','Azul']].map(([key, label]) => (
            <div key={key} className="doctor-triage-time-item">
              <span className={`doctor-triage-time-dot doctor-triage-time-dot--${key}`} />
              <span className="doctor-triage-time-label">{label}</span>
              <span className="doctor-triage-time-value">{temposMediosHospital[key] ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFilaTriagens = () => {
    if (subMenuFila === 'atendimento' && episodioSelecionado) return renderAtendimento();

    const episodiosFiltrados = episodios.filter((ep) => {
      const estado = String(ep?.estado || ep?.estadolocal || ep?.estadoepisodio || '').toLowerCase();
      if (subMenuFila === 'em_espera')  return estado !== 'terminado' && estado !== 'desistiu' && estado !== 'internado';
      if (subMenuFila === 'atendimento') return estado === 'emconsulta' || estado === 'atendimento';
      return true;
    });

    return (
      <DoctorQueue
        episodios={episodiosFiltrados}
        episodiosOrdenados={episodiosFiltrados}
        setEpisodios={setEpisodios}
        subMenuFila={subMenuFila}
        setSubMenuFila={setSubMenuFila}
        filtro={filtro}
        setFiltro={setFiltro}
        abrirEpisodio={abrirEpisodio}
        TRIAGECLASS={TRIAGE_CLASS}
        episodioSelecionado={episodioSelecionado}
        setEpisodioSelecionado={setEpisodioSelecionado}
        headers={headers}
      />
    );
  };

  const renderTabVitais = () => {
    const corTriagem    = getField(dadosTriagem, 'cor_triagem', 'cortriagem');
    const inicioTriagem = getField(dadosTriagem, 'data_hora_inicio', 'datahorainicio');
    const dataTriagem   = getField(dadosTriagem, 'datahorainicio', 'data_hora_inicio');
    const tempoEsperaAtual = calcularTempoEsperaMin(dataTriagem);

    return (
      <div className="doctor-stacked-sections">
        <section className="doctor-medical-card">
          <div className="doctor-medical-card__header">
            <div><h3>{textos?.doctor?.dadosUtente || "Dados do Utente"}</h3><p>{textos?.doctor?.infoPrincipalEp || "Informação principal do episódio"}</p></div>
          </div>
          <div className="doctor-patient-grid">
            <div className="doctor-patient-item"><span>{textos?.doctor?.nome || "Nome"}</span><strong>{utente?.nome || episodioSelecionado?.nome_utente || '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.numUtente || "Nº Utente"}</span><strong>{getField(utente, 'num_utent', 'numutente', 'numutent')}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.sexo || "Sexo"}</span><strong>{utente?.sexo || '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.dataNasc || "Data Nascimento"}</span><strong>{utente?.data_nasc ? new Date(utente.data_nasc).toLocaleDateString('pt-PT') : '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.telefone || "Telefone"}</span><strong>{utente?.telefone || '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.email || "Email"}</span><strong>{utente?.email || '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.morada || "Morada"}</span><strong>{utente?.localidade || '—'}</strong></div>
            <div className="doctor-patient-item"><span>{textos?.doctor?.nif || "NIF"}</span><strong>{utente?.nif || '—'}</strong></div>
          </div>
        </section>

        <section className="doctor-medical-card">
          <div className="doctor-medical-card__header">
            <div><h3>{textos?.doctor?.triagem || "Triagem"}</h3><p>{textos?.doctor?.dadosClinicosIniciais || "Dados clínicos iniciais do episódio"}</p></div>
            {!modoEdicaoTriagem ? (
              <button type="button" className="doctor-outline-btn" onClick={() => {
                setFormTriagem({
                  temperatura: getField(dadosTriagem, 'temperatura') === '—' ? '' : getField(dadosTriagem, 'temperatura'),
                  freqcard:    getField(dadosTriagem, 'freq_card', 'freqcard') === '—' ? '' : getField(dadosTriagem, 'freq_card', 'freqcard'),
                  freqresp:    getField(dadosTriagem, 'freq_resp', 'freqresp') === '—' ? '' : getField(dadosGluc, 'freq_resp', 'freqresp'),
                  spo2:        getField(dadosTriagem, 'sp_o2', 'spo2') === '—' ? '' : getField(dadosTriagem, 'sp_o2', 'spo2'),
                  sistolica:   getField(dadosTriagem, 'sistolica') === '—' ? '' : getField(dadosTriagem, 'sistolica'),
                  diastolica:  getField(dadosTriagem, 'diastolica') === '—' ? '' : getField(dadosTriagem, 'diastolica'),
                  sintomas:    getField(dadosTriagem, 'sintomas') === '—' ? '' : getField(dadosTriagem, 'sintomas'),
                });
                setModoEdicaoTriagem(true);
              }}>{textos?.doctor?.editar || "Editar"}</button>
            ) : (
              <div className="doctor-actions-inline">
                <button type="button" className="doctor-action-btn doctor-action-btn--secondary" onClick={() => setModoEdicaoTriagem(false)}>{textos?.doctor?.cancelar || "Cancelar"}</button>
                <button type="button" className="doctor-action-btn doctor-action-btn--primary"   onClick={guardarEdicaoTriagem}>{textos?.doctor?.guardar || "Guardar"}</button>
              </div>
            )}
          </div>

          <div className="doctor-triage-banner">
            <div className="doctor-triage-banner__priority">
              <span>{textos?.doctor?.prioridade || "Prioridade"}</span>
              <div className={TRIAGE_CLASS[corTriagem] || 'triage-badge'}>{corTriagem}</div>
            </div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.tempoEspera || "Tempo Espera"}</span><strong>{tempoEsperaAtual != null ? `${tempoEsperaAtual} min` : '—'}</strong></div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.inicio || "Início"}</span><strong>{inicioTriagem !== '—' ? new Date(inicioTriagem).toLocaleString('pt-PT') : '—'}</strong></div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.enfermeiro || "Enfermeiro"}</span><strong>{getField(dadosTriagem, 'nome_enfermeiro', 'nomeenfermeiro')}</strong></div>
          </div>

          {!modoEdicaoTriagem ? (
            <>
              <div className="doctor-vitals-table">
                <div className="doctor-vital-row"><span>{textos?.doctor?.temperatura || "Temperatura"}</span>        <strong>{getField(dadosTriagem, 'temperatura')} °C</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.freqCardiaca || "Freq. Cardíaca"}</span>     <strong>{getField(dadosTriagem, 'freq_card', 'freqcard')} bpm</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.freqRespiratoria || "Freq. Respiratória"}</span> <strong>{getField(dadosTriagem, 'freq_resp', 'freqresp')} rpm</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.spo2 || "SpO2"}</span>               <strong>{getField(dadosTriagem, 'sp_o2', 'spo2')} %</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.tensaoArterial || "Tensão Arterial"}</span>    <strong>{getField(dadosTriagem, 'sistolica')}/{getField(dadosTriagem, 'diastolica')} mmHg</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.nivelDor || "Nível Dor"}</span>          <strong>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.consciencia || "Consciência"}</span>        <strong>{getField(dadosTriagem, 'consciencia')}</strong></div>
              </div>
              <div className="doctor-clinical-note"><span>{textos?.doctor?.sintomasReferidos || "Sintomas Referidos"}</span><p>{getField(dadosTriagem, 'sintomas')}</p></div>
            </>
          ) : (
            <>
              <div className="doctor-vitals-table">
                {[[textos?.doctor?.temperatura || 'Temperatura','temperatura'],[textos?.doctor?.freqCardiaca || 'Freq. Cardíaca','freqcard'],[textos?.doctor?.freqRespiratoria || 'Freq. Respiratória','freqresp'],[textos?.doctor?.spo2 || 'SpO2','spo2']].map(([label, campo]) => (
                  <div key={campo} className="doctor-vital-row">
                    <span>{label}</span>
                    <input className="doctor-field" type="number" value={formTriagem[campo] ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, [campo]: e.target.value }))} />
                  </div>
                ))}
                <div className="doctor-vital-row">
                  <span>{textos?.doctor?.tensaoArterial || "Tensão Arterial"}</span>
                  <div className="doctor-bp-grid">
                    <input className="doctor-field" type="number" placeholder="Sistólica"  value={formTriagem.sistolica  ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, sistolica:  e.target.value }))} />
                    <input className="doctor-field" type="number" placeholder="Diastólica" value={formTriagem.diastolica ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, diastolica: e.target.value }))} />
                  </div>
                </div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.nivelDor || "Nível Dor"}</span>  <strong>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</strong></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.consciencia || "Consciência"}</span> <strong>{getField(dadosTriagem, 'consciencia')}</strong></div>
              </div>
              <div className="doctor-clinical-note">
                <span>{textos?.doctor?.sintomasReferidos || "Sintomas Referidos"}</span>
                <textarea className="doctor-field" rows={3} value={formTriagem.sintomas ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, sintomas: e.target.value }))} />
              </div>
            </>
          )}
        </section>
      </div>
    );
  };

  const renderAtendimento = () => {
    const tabs = [
      ['vitais',    textos?.doctor?.dadosVitaisTab || 'Dados Vitais'],
      ['prescricao',textos?.doctor?.prescreverTab || 'Prescrever'],
      ['decisao',   textos?.doctor?.altaInternamentoTab || 'Alta / Internamento'],
    ];

    const codEpisodio  = episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codepurgenc || '—';
    const dataEntrada  = dadosTriagem?.datahorainicio ? new Date(dadosTriagem.datahorainicio).toLocaleString('pt-PT') : '—';

    return (
      <div className="doctor-attendance-page">
        <div className="doctor-episode-header">
          <div className="doctor-episode-header__left">
            <button type="button" className="doctor-back-link" onClick={() => { setEpisodioSelecionado(null); setModoEdicaoTriagem(false); setTabAtendimento('vitais'); setSubMenuFila('em_espera'); }}>{textos?.doctor?.voltarFila || "← Voltar à fila"}</button>
            <h1 className="doctor-episode-title">{textos?.doctor?.episodio || "Episódio"} #{codEpisodio}</h1>
            <p className="doctor-episode-subtitle">{textos?.doctor?.ucipUrgencia || "UCIP · Urgência Central"}</p>
          </div>
          <div className="doctor-episode-header__right">
            <div className="doctor-episode-date-card">
              <span className="doctor-episode-date-label">{textos?.doctor?.dataEntrada || "Data de entrada"}</span>
              <strong className="doctor-episode-date-value">{dataEntrada}</strong>
            </div>
          </div>
        </div>

        <div className="doctor-tabs-row">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" className={`doctor-tab-btn ${tabAtendimento === id ? 'is-active' : ''}`} onClick={() => setTabAtendimento(id)}>{label}</button>
          ))}
        </div>

        <div className="doctor-attendance-content">
          {tabAtendimento === 'vitais' && renderTabVitais()}

          {tabAtendimento === 'prescricao' && (
            <DoctorPrescription
              medicacaoAtiva={medicacaoAtiva}
              enriquecerMedicacaoAtiva={(lista) => enriquecerMedicacaoAtiva(lista, medicamentos)}
              SectionHeader={SectionHeader}
              alertas={alertas}
              medicamentos={medicamentos}
              getMedicamentoId={getMedicamentoId}
              getMedicamentoNome={getMedicamentoNome}
              prescricao={prescricao}
              handlePrescricaoChange={handlePrescricaoChange}
              alergias={alergias}
              riscoIA={riscoIA}
              avaliacaoRisco={avaliacaoRisco}
              avaliarRiscoIAFn={avaliarRiscoIAFn}
              submeterPrescricao={submeterPrescricao}
            />
          )}

          {tabAtendimento === 'decisao' && (
            <DoctorAlta
              episodioSelecionado={episodioSelecionado}
              setEpisodioSelecionado={setEpisodioSelecionado}
              setEpisodios={setEpisodios}
              setSubMenuFila={setSubMenuFila}
              alta={alta}
              setAlta={setAlta}
              SectionHeader={SectionHeader}
              mostrarToast={mostrarToast}
              headers={headers}
              onInternamentoCriado={carregarInternamentos}
            />
          )}
        </div>
      </div>
    );
  };

  const renderInternamentos = () => {
    if (internamentoSelecionado) return renderFichaInternamento();

    return (
      <div className="doctor-panel-card">
        <SectionHeader title={textos?.doctor?.internamentosAtivos || "Internamentos Ativos"} subtitle={textos?.doctor?.consultarFicha || "Consultar ficha do utente, prescrever e registar alta"} />
        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr><th>{textos?.doctor?.internamento || "Internamento"}</th><th>{textos?.doctor?.episodio || "Episódio"}</th><th>{textos?.doctor?.utente || "Utente"}</th><th>{textos?.doctor?.servico || "Serviço"}</th><th>{textos?.doctor?.cama || "Cama"}</th><th>{textos?.doctor?.motivo || "Motivo"}</th><th>{textos?.doctor?.entrada || "Entrada"}</th><th>{textos?.doctor?.acoes || "Ações"}</th></tr>
            </thead>
            <tbody>
              {internamentos.length === 0 ? (
                <tr><td colSpan="8" className="doctor-table-empty">{textos?.doctor?.semUtentesInternados || "Sem utentes internados de momento."}</td></tr>
              ) : (
                internamentos.map((int) => (
                  <tr key={int.cod_internamento}>
                    <td>#{int.cod_internamento}</td>
                    <td>#{int.cod_ep_urgenc}</td>
                    <td>{int.nome_utente || '—'}</td>
                    <td>{int.servico || '—'}</td>
                    <td>{int.numero_cama || '—'}</td>
                    <td>{int.motivo_int || '—'}</td>
                    <td>{int.data_hora_int ? new Date(int.data_hora_int).toLocaleString('pt-PT') : '—'}</td>
                    <td><button className="doctor-action-btn doctor-action-btn--primary" onClick={() => abrirInternamento(int)}>{textos?.doctor?.consultar || "Consultar"}</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderFichaInternamento = () => (
    <div className="doctor-panel-card doctor-panel-card--wide">
      <div className="doctor-patient-banner">
        <div>
          <button className="doctor-back-link" onClick={() => setInternamentoSelecionado(null)}>{textos?.doctor?.voltarInternamentos || "← Voltar aos internamentos"}</button>
          <h3 className="doctor-patient-banner__name">{internamentoSelecionado?.nome_utente || '—'}</h3>
          <p className="doctor-patient-banner__meta">{textos?.doctor?.internamento || "Internamento"} #{internamentoSelecionado?.cod_internamento}</p>
        </div>
      </div>

      <div className="doctor-internamento-grid">
        <div className="doctor-subcard">
          <SectionHeader title={textos?.doctor?.dadosInternamentoTitle || "Dados do internamento"} />
          <div className="doctor-detail-list">
            <div><span>{textos?.doctor?.episodio || "Episódio"}</span><strong>#{internamentoSelecionado?.cod_ep_urgenc || '—'}</strong></div>
            <div><span>{textos?.doctor?.servico || "Serviço"}</span><strong>{internamentoSelecionado?.servico || '—'}</strong></div>
            <div><span>{textos?.doctor?.cama || "Cama"}</span><strong>{internamentoSelecionado?.numero_cama || '—'}</strong></div>
            <div><span>{textos?.doctor?.motivo || "Motivo"}</span><strong>{internamentoSelecionado?.motivo_int || '—'}</strong></div>
            <div><span>{textos?.doctor?.entrada || "Entrada"}</span><strong>{internamentoSelecionado?.data_hora_int ? new Date(internamentoSelecionado.data_hora_int).toLocaleString('pt-PT') : '—'}</strong></div>
          </div>
        </div>

        <div className="doctor-subcard">
          <SectionHeader title={textos?.doctor?.prescreverMedTitle || "Prescrever medicação"} />
          <div className="doctor-form-grid">
            <div className="doctor-form-grid__full">
              <label>{textos?.doctor?.medicamentoLabel || "Medicamento"}</label>
              <select className="doctor-field" name="codmedicamento" value={prescricao.codmedicamento} onChange={handlePrescricaoChange}>
                <option value="">{textos?.doctor?.selecioneOption || "Selecione..."}</option>
                {Array.isArray(medicamentos) && medicamentos.map((m, index) => {
                  const medId   = getMedicamentoId(m, index);
                  const medNome = getMedicamentoNome(m, index);
                  return <option key={`med-int-${medId}-${index}`} value={medId}>{medNome}</option>;
                })}
              </select>
            </div>
            <div className="doctor-form-grid__full">
              <label>{textos?.doctor?.dosagemLabel || "Dosagem"}</label>
              <input className="doctor-field" type="text" name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} />
            </div>
          </div>
          <button className="doctor-action-btn doctor-action-btn--primary" onClick={submeterPrescricao}>{textos?.doctor?.prescreverBtn || "Prescrever"}</button>
        </div>
      </div>

      <div className="doctor-subcard">
        <SectionHeader title={textos?.doctor?.registarAltaTitle || "Registar alta de internamento"} />
        <div className="doctor-form-grid">
          <div>
            <label>{textos?.doctor?.tipoAltaLabel || "Tipo de Alta"}</label>
            <select className="doctor-field" value={altaInternamento.tipo_alta} onChange={(e) => setAltaInternamento((p) => ({ ...p, tipo_alta: e.target.value }))}>
              <option value="clinica">{textos?.doctor?.altaClinica || "Alta Clínica"}</option>
              <option value="voluntaria">{textos?.doctor?.altaVoluntaria || "Alta Voluntária"}</option>
              <option value="transferencia">{textos?.doctor?.transferencia || "Transferência"}</option>
              <option value="obito">{textos?.doctor?.obito || "Óbito"}</option>
            </select>
          </div>
          <div>
            <label>{textos?.doctor?.observacoesLabel || "Observações"}</label>
            <input className="doctor-field" type="text" value={altaInternamento.observacoes} onChange={(e) => setAltaInternamento((p) => ({ ...p, observacoes: e.target.value }))} />
          </div>
        </div>
        <button className="doctor-action-btn doctor-action-btn--primary" onClick={submeterAltaInternamento}>{textos?.doctor?.registarAltaBtn || "Registar alta"}</button>
      </div>
    </div>
  );

  return (
    <div className={`doctor-layout-shell ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Toast mensagem={toast.mensagem} tipo={toast.tipo} onFechar={fecharToast} />

      <aside className="doctor-layout-sidebar">
        <button type="button" className="doctor-layout-sidebar__toggle" onClick={() => setIsSidebarCollapsed((v) => !v)} aria-label="Alternar sidebar"><IconMenu /></button>
        <div className="doctor-layout-sidebar__brand">
          <img src={logo} alt="SIAGUH" className="doctor-layout-sidebar__logo" />
          {!isSidebarCollapsed && <span className="doctor-layout-sidebar__hospital-name" />}
        </div>
        <div className="doctor-layout-sidebar__profile">
          <div className="doctor-layout-sidebar__avatar">{iniciaisUtilizador}</div>
          {!isSidebarCollapsed && (
            <div>
              <div className="doctor-layout-sidebar__name">{nomeUtilizador}</div>
              <div className="doctor-layout-sidebar__role">Médico</div>
            </div>
          )}
        </div>
        <nav className="doctor-layout-sidebar__nav">
          {menus.map((menu) => (
            <button key={menu.id} type="button" className={`doctor-layout-sidebar__link ${activeMenu === menu.id ? 'is-active' : ''}`}
              onClick={() => { setActiveMenu(menu.id); setEpisodioSelecionado(null); setInternamentoSelecionado(null); }}
              title={isSidebarCollapsed ? menu.label : undefined}>
              <span className="doctor-layout-sidebar__icon">{menu.icon}</span>
              {!isSidebarCollapsed && <span className="doctor-layout-sidebar__text">{menu.label}</span>}
            </button>
          ))}
        </nav>
        <div className="doctor-layout-sidebar__footer">
          <button type="button" className="doctor-layout-logout" onClick={() => navigate('/login')} title={isSidebarCollapsed ? (textos?.doctor?.terminarSessao || 'Terminar sessão') : undefined}>
            <span className="doctor-layout-sidebar__icon"><IconExit /></span>
            {!isSidebarCollapsed && <span>{textos?.doctor?.terminarSessao || "Terminar sessão"}</span>}
          </button>
        </div>
      </aside>

      <div className="doctor-layout-main">
        <div className="doctor-layout-container">
          <div className="doctor-breadcrumbs">{textos?.doctor?.inicioBreadcrumb || "Início"} <span>›</span> {nomeHospital}</div>
          <div className="doctor-hero-card">
            <div>
              <h1 className="doctor-hero-card__title">
                {activeMenu === 'informacao_geral' ? (textos?.doctor?.painelMedico || 'Painel do Médico') : activeMenu === 'fila_triagens' ? (textos?.doctor?.filaTriagens || 'Fila de Triagens') : (textos?.doctor?.internamentosAtivos || 'Internamentos Ativos')}
              </h1>
              <p className="doctor-hero-card__subtitle">{textos?.doctor?.descricaoPainel || 'Prioridade, detalhe clínico completo, prescrição e decisão final.'}</p>
            </div>
            <button type="button" className="doctor-action-link" onClick={carregarTudo}>{textos?.doctor?.atualizar || "Atualizar"}</button>
          </div>

          {activeMenu === 'informacao_geral' && renderInformacaoGeral()}
          {activeMenu === 'fila_triagens'    && (subMenuFila === 'atendimento' && episodioSelecionado ? renderAtendimento() : renderFilaTriagens())}
          {activeMenu === 'internamentos'    && renderInternamentos()}
        </div>
        <FooterLayout />
      </div>
    </div>
  );
}
