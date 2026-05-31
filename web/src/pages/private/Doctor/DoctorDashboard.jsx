import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../../imagens/Logo.png";
import '../../../styles/main.css';
import '../../../styles/pages/doctor-dashboard.css';
import FooterLayout from '../../../components/layout/FooterLayout';
import { useLanguage } from '../../../contexts/LanguageContext';
import Toast, { useToast } from '../../../components/ui/Toast';
import DoctorQueue from './DoctorQueue';
import DoctorPrescription from './DoctorPrescription';
import { apiFetch } from '../../../services/api';
import { STORAGE_KEYS } from '../../../constants/roles';

/** @constant {string} API_BASE - URL base do servidor Backend obtida do ambiente ou fallback local */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
/** @constant {string} API_URL - Endpoint construído para as chamadas da API v1 */
const API_URL = `${API_BASE}/api/v1`;

/** @constant {string[]} SERVICOS - Listagem dos serviços hospitalares disponíveis para internamento */
const SERVICOS = ['Cardiologia', 'Medicina', 'Ortopedia', 'Cirurgia'];

/** @constant {Object.<string, string>} PREFIXO_SERVICO - Mapeamento de prefixos identificadores para geração de camas */
const PREFIXO_SERVICO = {
  'Cardiologia': 'CAR',
  'Medicina': 'MED',
  'Ortopedia': 'ORT',
  'Cirurgia': 'CIR',
};

/**
 * Gera um número identificador único e aleatório para uma cama com base no serviço.
 * @param {string} servico - Nome do serviço médico.
 * @returns {string} Código alfanumérico da cama (Ex: CAR-12).
 */
const gerarNumeroCama = (servico) => {
  const prefixo = PREFIXO_SERVICO[servico] || 'GER';
  const numero = String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
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
  Laranja: 'triage-badge triage-badge--laranja',
  Amarelo: 'triage-badge triage-badge--amarelo',
  Verde: 'triage-badge triage-badge--verde',
  Azul: 'triage-badge triage-badge--azul',
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
 * @param {number} [index=0] - ID sequencial de fallback.
 * @returns {string} Identificador extraído.
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
 * Extrai o código identificador do Episódio de Urgência procurando por variações da nomenclatura da chave.
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
    m?.principioativo ?? m?.principio_ativo ?? m?.farmaco ??
    m?.nome ?? m?.nome_medicamento ?? m?.nomemedicamento ?? m?.medicamento_nome ??
    m?.nomeMedicamento ?? m?.designacao ?? m?.designacao_comercial ?? m?.descricao ??
    m?.medicamento ?? m?.nomecomercial ?? m?.denominacao ?? '';
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
      item?.principioativo || item?.principio_ativo ||
      item?.nomeApresentacao || item?.nome || item?.nome_medicamento ||
      item?.nomemedicamento || item?.medicamento_nome || item?.nomeMedicamento ||
      item?.designacao || item?.designacao_comercial || item?.descricao ||
      item?.medicamento || item?.nomecomercial ||
      medicamentoCatalogo?.principioativo || medicamentoCatalogo?.principio_ativo ||
      medicamentoCatalogo?.nome || medicamentoCatalogo?.nome_medicamento ||
      medicamentoCatalogo?.nomemedicamento || medicamentoCatalogo?.medicamento_nome ||
      medicamentoCatalogo?.designacao || medicamentoCatalogo?.designacao_comercial ||
      medicamentoCatalogo?.descricao ||
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
 * Componente Principal da Página do Dashboard do Médico (V2).
 * Inclui validação avançada de riscos via microsserviço de IA e suporte local multi-idioma (PT/EN).
 * @component
 */
export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();
  const { toast, mostrarToast, fecharToast } = useToast();

  const [medicamentos, setMedicamentos] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('informacao_geral');
  const [subMenuFila, setSubMenuFila] = useState('em_espera');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [acaoClinica, setAcaoClinica] = useState('');
  const [aSubmeterDecisao, setASubmeterDecisao] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [antecedentes, setAntecedentes] = useState(null);
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [tabAtendimento, setTabAtendimento] = useState('vitais');
  const [internamentos, setInternamentos] = useState([]);
  const [internamentoSelecionado, setInternamentoSelecionado] = useState(null);
  const [altaInternamento, setAltaInternamento] = useState({ tipo_alta: 'clinica', observacoes: '' });
  const [modoEdicaoTriagem, setModoEdicaoTriagem] = useState(false);
  const [formTriagem, setFormTriagem] = useState({
    cortriagem: '', tempoesperaprevisto: '', temperatura: '', freqcard: '',
    freqresp: '', spo2: '', sistolica: '', diastolica: '', niveldor: '',
    consciencia: '', sintomas: '', nomeenfermeiro: '',
  });
  const [prescricao, setPrescricao] = useState({ codmedicamento: '', dosagem: '', observacoes: '' });
  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—', laranja: '—', amarelo: '—', verde: '—', azul: '—',
  });
  const [alergias, setAlergias] = useState([]);
  const [atos, setAtos] = useState([]);
  const atosRef = useRef([]);
  const [riscoIA, setRiscoIA] = useState(null);
  const [avaliacaoRisco, setAvaliacaoRisco] = useState(false);
  const [aSubmeterAlta, setASubmeterAlta] = useState(false);
  const [alta, setAlta] = useState({
    destino: 'alta', observacoes: '', servico: '', numero_cama: '',
    motivo_int: '', motivo_int_outro: '', tipo_alta: 'clinica',
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
    utilizadorLogado?.hospitais?.[0]?.nome || 'Hospital';

  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  /** @type {function(): string|null} token - Retorna o JWT ativo armazenado em cache */
  const token = () => sessionStorage.getItem('token');
  
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
        setEpisodios([]);
      }
    } catch (e) {
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
            vermelho: tempos?.vermelho?.minutos != null ? `${Math.max(0, tempos.vermelho.minutos)} min` : '—',
            laranja:  tempos?.laranja?.minutos  != null ? `${Math.max(0, tempos.laranja.minutos)} min`  : '—',
            amarelo:  tempos?.amarelo?.minutos  != null ? `${Math.max(0, tempos.amarelo.minutos)} min`  : '—',
            verde:    tempos?.verde?.minutos    != null ? `${Math.max(0, tempos.verde.minutos)} min`    : '—',
            azul:     tempos?.azul?.minutos     != null ? `${Math.max(0, tempos.azul.minutos)} min`     : '—',
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
        setMedicamentos([]);
      }
    } catch (e) {
      setMedicamentos([]);
    }
  };

  /**
   * Revoga tokens ativos da sessão e limpa os storages locais redirecionando o fluxo à raiz.
   */
  const fazerLogout = async () => {
    try {
      await apiFetch('/api/v1/auth/logout', {
        method: 'POST',
      });
    } catch { }

    sessionStorage.clear();
    navigate('/login', { replace: true });
  };

  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Carrega todos os históricos cruzados e inicializa um novo registo síncrono de ato de consulta médica.
   * @param {Object} ep - Instância resumida do episódio clínico selecionado na grid.
   */
  const abrirEpisodio = async (ep) => {
    if (!ep) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }

    const numUtente = getCodUtente(ep);
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
      const [rUtente, rTriagem, rMedicacao, rAtos, rAlergias, rAntecedentes] =
        await Promise.all([
          fetch(`${API_URL}/utentes/${numUtente}`, { headers: headers() }),
          fetch(`${API_URL}/triagens/${codEpisodio}`, { headers: headers() }),
          fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, { headers: headers() }),
          fetch(`${API_URL}/atos/episodio/${codEpisodio}`, { headers: headers() }),
          fetch(`${API_URL}/alergias/utente/${numUtente}`, { headers: headers() }),
          fetch(`${API_URL}/utente-antecedentes/utente/${numUtente}`, { headers: headers() }),
        ]);

      if (rUtente.ok) { setUtente(await rUtente.json()); } else { setUtente(null); }
      if (rTriagem.ok) { setDadosTriagem(await rTriagem.json()); } else { setDadosTriagem(null); }
      if (rMedicacao.ok) { const m = await rMedicacao.json(); setMedicacaoAtiva(Array.isArray(m) ? m : []); } else { setMedicacaoAtiva([]); }
      if (rAtos.ok) {
        const lista = await rAtos.json();
        const final = Array.isArray(lista) ? lista : [];

        const agora = new Date().toISOString();
        const rNovoAto = await fetch(`${API_URL}/atos/`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify({
            cod_ep_urgenc: codEpisodio,
            tipo: 'consulta',
            descricao: 'Atendimento médico iniciado.',
            data_hora_inicio: agora,
            data_hora_fim: null,
          }),
        });
        if (rNovoAto.ok) {
          const novoAto = await rNovoAto.json();
          setAtos([novoAto, ...final]);
          atosRef.current = [novoAto, ...final];
        } else {
          setAtos(final);
          atosRef.current = final;
        }
      } else {
        setAtos([]);
        atosRef.current = [];
      }
      
      if (rAlergias.ok) { const al = await rAlergias.json(); setAlergias(Array.isArray(al) ? al : []); } else { setAlergias([]); }
      if (rAntecedentes.ok) { setAntecedentes(await rAntecedentes.json()); } else { setAntecedentes(null); }
      setAlertas([]);
    } catch (e) {
      mostrarToast(textos?.doctor?.erroAbrirEp || 'Erro ao abrir episódio.', 'erro');
    }
  };

  /**
   * Altera a interface focando na ficha técnica de monitorização e medicação de um paciente em internamento.
   * @param {Object} int - Registro de internamento.
   */
  const abrirInternamento = async (int) => {
    if (!int) { mostrarToast(textos?.doctor?.erroIntInvalido || 'Internamento inválido.', 'erro'); return; }

    try {
      setInternamentoSelecionado(int);
      setEpisodioSelecionado(null);
      setActiveMenu('internamentos');

      const codEpisodio = getField(int, 'cod_ep_urgenc', 'codEpisodio', 'codepisodio', 'cod_epurgenc');
      let numUtente = getField(int, 'num_utent', 'numUtente', 'numutente', 'num_utente', 'codutente');
      if (!numUtente || numUtente === '—') {
        if (codEpisodio && codEpisodio !== '—') {
          try {
            const rEp = await fetch(`${API_URL}/episodios/${codEpisodio}`, { headers: headers() });
            if (rEp.ok) {
              const epData = await rEp.json();
              numUtente = epData?.num_utent ?? epData?.numutent ?? epData?.cod_utente ?? epData?.codutente ?? epData?.utente_id ?? null;
            }
          } catch { numUtente = null; }
        }
      }

      const [rUtente, rMedicacao, rAlergias, rAntecedentes, rAtos] = await Promise.all([
        numUtente ? fetch(`${API_URL}/utentes/${numUtente}`, { headers: headers() }) : Promise.resolve(null),
        numUtente ? fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, { headers: headers() }) : Promise.resolve(null),
        numUtente ? fetch(`${API_URL}/alergias/utente/${numUtente}`, { headers: headers() }) : Promise.resolve(null),
        numUtente ? fetch(`${API_URL}/historico/${numUtente}`, { headers: headers() }) : Promise.resolve(null),
        codEpisodio ? fetch(`${API_URL}/atos/episodio/${codEpisodio}`, { headers: headers() }) : Promise.resolve(null),
      ]);

      if (rUtente?.ok) { setUtente(await rUtente.json()); } else { setUtente(null); }
      if (rMedicacao?.ok) { const d = await rMedicacao.json(); setMedicacaoAtiva(Array.isArray(d) ? d : []); } else { setMedicacaoAtiva([]); }
      if (rAlergias?.ok) { const d = await rAlergias.json(); setAlergias(Array.isArray(d) ? d : []); } else { setAlergias([]); }
      if (rAntecedentes?.ok) { setAntecedentes(await rAntecedentes.json()); } else { setAntecedentes(null); }
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
      mostrarToast(textos?.doctor?.erroAbrirInt || 'Erro ao abrir internamento.', 'erro');
    }
  };

  /**
   * Submete ordens de prescrição acoplando o fármaco à tabela paralela de medicação ativa do paciente.
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
        id_ato: Number(idAto),
        cod_medicamento: Number(prescricao.codmedicamento),
        dosagem: String(prescricao.dosagem).trim(),
        observacoes: prescricao.observacoes?.trim() || null,
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
        medicamentoSelecionado?.principioativo || medicamentoSelecionado?.principio_ativo ||
        medicamentoSelecionado?.nome || medicamentoSelecionado?.nomemedicamento ||
        medicamentoSelecionado?.designacao || medicamentoSelecionado?.descricao ||
        getMedicamentoNome(medicamentoSelecionado) || 'Medicamento';

      const novaMedicacao = {
        id: created?.id_prescricao ?? `tmp-${Date.now()}`,
        idprescricao: created?.id_prescricao ?? null,
        idato: created?.id_ato ?? Number(idAto),
        codmedicamento: created?.cod_medicamento ?? Number(prescricao.codmedicamento),
        dosagem: created?.dosagem ?? prescricao.dosagem,
        observacoes: created?.observacoes ?? prescricao.observacoes ?? '',
        estadoprescricao: created?.estado_prescricao ?? 'pendente',
        nomeApresentacao: nomeMedicamento,
      };

      setMedicacaoAtiva((prev) => [novaMedicacao, ...(Array.isArray(prev) ? prev : [])]);

      const numUtente =
        utente?.num_utent ?? utente?.numutent ?? utente?.num_utente ??
        episodioSelecionado?.num_utent ?? episodioSelecionado?.numutent ??
        internamentoSelecionado?.num_utent ?? internamentoSelecionado?.numutent ?? null;

      if (numUtente) {
        try {
          await fetch(`${API_URL}/medicacao-ativa/`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({
              num_utent: Number(numUtente),
              cod_medicamento: Number(prescricao.codmedicamento),
              data_inicio: new Date().toISOString().split('T')[0],
              data_fim: null,
              dosagem: String(prescricao.dosagem).trim(),
            }),
          });
          const rMed = await fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, { headers: headers() });
          if (rMed.ok) {
            const mData = await rMed.json();
            setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
          }
        } catch (eMed) {
          mostrarToast(textos?.doctor?.sucessoPrescricaoAtivaErro || 'Prescrição gravada, mas não foi possível atualizar a medicação ativa.', 'aviso');
        }
      }

      setPrescricao({ codmedicamento: '', dosagem: '', observacoes: '' });
      setRiscoIA(null);
      mostrarToast((textos?.doctor?.sucessoPrescrever || "Prescrição de {nome} registada com sucesso.").replace("{nome}", nomeMedicamento), 'sucesso');
    } catch (e) {
      mostrarToast(textos?.doctor?.erroPrescrever || 'Erro ao prescrever.', 'erro');
    }
  };

  /**
   * Remove uma medicação ativa do histórico do utente através de uma chamada DELETE parametrizada.
   * @param {Object} med - Instância da medicação a ser removida.
   */
  const eliminarMedicacao = async (med) => {
    const codMedicacaoAtiva =
      med?.cod_medicacao_ativa ?? med?.codmedicacaoativa ?? med?.id ?? null;

    if (!codMedicacaoAtiva) {
      mostrarToast(textos?.doctor?.erroIdentificarPrescricao || 'Não foi possível identificar a prescrição.', 'erro');
      return;
    }

    try {
      const r = await fetch(`${API_URL}/medicacao-ativa/${codMedicacaoAtiva}`, {
        method: 'DELETE',
        headers: headers(),
      });

      if (!r.ok) throw new Error(`Erro ao eliminar (${r.status})`);

      setMedicacaoAtiva((prev) =>
        (prev || []).filter((m) => {
          const cod = m?.cod_medicacao_ativa ?? m?.codmedicacaoativa ?? m?.id;
          return String(cod) !== String(codMedicacaoAtiva);
        })
      );

      mostrarToast(textos?.doctor?.sucessoEliminarPrescricao || 'Prescrição eliminada com sucesso.', 'sucesso');
    } catch (e) {
      mostrarToast(e.message || (textos?.doctor?.erroPrescrever || 'Erro ao eliminar prescrição.'), 'erro');
    }
  };

  /**
   * Consome o microsserviço XGBoost de inteligência artificial calculando probabilidades reais de risco clínico/interação.
   */
  const avaliarRiscoIAFn = async () => {
    if (!prescricao?.codmedicamento) {
      mostrarToast(textos?.doctor?.erroSelMed || 'Seleciona um medicamento.', 'erro');
      return;
    }

    setAvaliacaoRisco(true);

    try {
      const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';
      const med = medicamentos.find(
        (m) => String(getMedicamentoId(m)) === String(prescricao.codmedicamento)
      );
      const nomeMed = med ? getMedicamentoNome(med) : 'Medicamento';
      const classMed = med?.classe_terapeutica_id ?? med?.classeterapeuticaid ?? 1;

      const temAlergia = alergias.some((a) => {
        const txt = String(a?.descricao || a?.substancia || a?.alergia || '').toLowerCase();
        return txt.includes(nomeMed.toLowerCase());
      });

      const gravidadeAlergia = temAlergia ? 2 : 0;
      const temInteracao = medicacaoAtiva.some((m) => {
        const medAtivo = medicamentos.find(
          (med) => String(getMedicamentoId(med)) === String(
            m?.codmedicamento ?? m?.cod_medicamento ?? m?.id ?? ''
          )
        );
        return medAtivo?.classe_terapeutica_id === classMed;
      });

      const idade = utente?.data_nasc ? calcularIdade(utente.data_nasc) : 50;

      const res = await fetch(`${API_IA}/predict/v1/medicine-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Classe_Novo_Med: classMed,
          Tem_Alergia_Classe: temAlergia ? 1 : 0,
          Gravidade_Alergia: gravidadeAlergia,
          Tem_Interacao_Ativa: temInteracao ? 1 : 0,
          Idade_Utente: idade,
        }),
      });

      if (!res.ok) throw new Error(`Erro no modelo IA (${res.status})`);

      const data = await res.json();
      
      const msgSucesso = (textos?.doctor?.semRiscoIdentificadoMed || "Sem risco identificado — {nomeMed} (prob. {prob}%)")
        .replace("{nomeMed}", nomeMed).replace("{prob}", (data.probabilidade * 100).toFixed(1));
      const msgErro = (textos?.doctor?.riscoElevadoMed || "Risco elevado — {nomeMed} (prob. {prob}%)")
        .replace("{nomeMed}", nomeMed).replace("{prob}", (data.probabilidade * 100).toFixed(1));

      const resultado = {
        risco: data.risco,
        riscoalto: data.risco === 1,
        mensagem: data.risco === 1 ? msgErro : msgSucesso,
        explicacao: [
          temAlergia ? (textos?.doctor?.alergiaClasseDetetada || 'Alergia à classe detetada.') : null,
          temInteracao ? (textos?.doctor?.interacaoMedAtiva || 'Interação com medicação ativa.') : null,
        ].filter(Boolean).join(' ') || (textos?.doctor?.semFatoresRisco || 'Sem fatores de risco identificados.'),
      };

      setRiscoIA(resultado);
      mostrarToast(textos?.doctor?.sucessoAvaliacao || 'Avaliação IA concluída.', 'sucesso');
    } catch (e) {
      mostrarToast(textos?.doctor?.erroAvaliacao || 'Erro na avaliação IA.', 'erro');
    } finally {
      setAvaliacaoRisco(false);
    }
  };

  /**
   * Finaliza fluxos de urgência registando transições de estado para 'terminado' (Alta) ou 'internado'.
   */
  const submeterDecisaoClinica = async () => {
    try {
      if (aSubmeterDecisao) return;

      const codEp =
        episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codep_urgenc ||
        episodioSelecionado?.cod_epurgenc || episodioSelecionado?.codepurgenc;

      if (!codEp) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }
      if (!acaoClinica) { mostrarToast(textos?.doctor?.erroSelAltaInt || 'Selecione Alta ou Internamento.', 'erro'); return; }
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
          cod_ep_urgenc: Number(codEp),
          id_func: null,
          data_hora_int: agora,
          data_hora_consulta: null,
          data_hora_alta: null,
          motivo_int: alta.motivo_int === 'Outro' ? alta.motivo_int_outro || 'Outro' : alta.motivo_int,
          numero_cama: gerarNumeroCama(alta.servico),
          servico: alta.servico || null,
          tipo_alta: null,
        };

        const rInt = await fetch(`${API_URL}/internamentos/`, {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(payloadInt),
        });

        if (!rInt.ok) throw new Error(`Erro ao criar internamento (${rInt.status})`);
      }

      const payloadEp = {
        estado: acaoClinica === 'alta' ? 'terminado' : 'internado',
        data_hora_saida: acaoClinica === 'alta' ? agora : null,
      };

      const r = await fetch(`${API_URL}/episodios/${codEp}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payloadEp),
      });

      if (!r.ok) throw new Error(`Erro ao atualizar episódio (${r.status})`);

      setEpisodios((prev) =>
        prev.map((ep) => {
          const epCod = ep?.cod_ep_urgenc || ep?.codep_urgenc || ep?.cod_epurgenc || ep?.codepurgenc;
          if (String(epCod) !== String(codEp)) return ep;
          return {
            ...ep,
            estado: acaoClinica === 'alta' ? 'terminado' : 'internado',
            estado_local: acaoClinica === 'alta' ? 'terminado' : 'internado',
          };
        })
      );

      mostrarToast(acaoClinica === 'alta' ? (textos?.doctor?.sucessoAlta || 'Alta registada com sucesso.') : (textos?.doctor?.sucessoInt || 'Internamento registado com sucesso.'), 'success');
      setAlta({ destino: 'alta', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '', observacoes: '', tipo_alta: 'clinica' });
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
      mostrarToast(e.message || (textos?.doctor?.erroDecisao || 'Erro ao registar decisão clínica.'), 'erro');
    } finally {
      setASubmeterDecisao(false);
    }
  };

  /**
   * Desativa e fecha o fluxo operacional de internamento clínico de enfermarias através de requisição PUT.
   */
  const submeterAltaInternamento = async () => {
    try {
      if (!internamentoSelecionado) { mostrarToast(textos?.doctor?.erroIntInvalido || 'Internamento inválido.', 'erro'); return; }
      const codInternamento = getField(internamentoSelecionado, 'codinternamento', 'cod_internamento', 'idinternamento', 'id_internamento');
      if (!codInternamento) { mostrarToast(textos?.doctor?.erroCodIntInvalido || 'Código do internamento inválido.', 'erro'); return; }

      const payload = {
        tipo_alta: altaInternamento.tipo_alta || 'clinica',
        data_hora_alta: new Date().toISOString(),
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
      mostrarToast(e.message || (textos?.doctor?.erroAltaInt || 'Erro ao registar alta do internamento.'), 'erro');
    }
  };

  /**
   * Salva alterações manuais de triagem modificadas diretamente na interface do médico.
   */
  const guardarEdicaoTriagem = async () => {
    try {
      const codEpisodio = getCodEpisodio(episodioSelecionado);
      if (!codEpisodio) { mostrarToast(textos?.doctor?.erroCodEpNaoEncontrado || 'Código do episódio não encontrado.', 'erro'); return; }

      const payload = {
        temperatura: formTriagem.temperatura || null,
        freq_card: formTriagem.freqcard || null,
        freq_resp: formTriagem.freqresp || null,
        sp_o2: formTriagem.spo2 || null,
        sistolica: formTriagem.sistolica || null,
        diastolica: formTriagem.diastolica || null,
        sintomas: formTriagem.sintomas || null,
      };

      const response = await fetch(`${API_URL}/triagens/${codEpisodio}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Erro ao guardar triagem: ${response.status}`);

      const responseText = await response.text();
      const triagemAtualizada = responseText ? JSON.parse(responseText) : {};

      setDadosTriagem((prev) => ({
        ...(prev || {}),
        ...triagemAtualizada,
        temperatura: triagemAtualizada?.temperatura ?? formTriagem.temperatura ?? prev?.temperatura ?? '',
        freqcard: triagemAtualizada?.freqcard ?? triagemAtualizada?.freq_card ?? formTriagem.freqcard ?? prev?.freqcard ?? '',
        freqresp: triagemAtualizada?.freqresp ?? triagemAtualizada?.freq_resp ?? formTriagem.freqresp ?? prev?.freqresp ?? '',
        spo2: triagemAtualizada?.spo2 ?? triagemAtualizada?.sp_o2 ?? formTriagem.spo2 ?? prev?.spo2 ?? '',
        sistolica: triagemAtualizada?.sistolica ?? formTriagem.sistolica ?? prev?.sistolica ?? '',
        diastolica: triagemAtualizada?.diastolica ?? formTriagem.diastolica ?? prev?.diastolica ?? '',
        sintomas: triagemAtualizada?.sintomas ?? formTriagem.sintomas ?? prev?.sintomas ?? '',
      }));

      setModoEdicaoTriagem(false);
      mostrarToast(textos?.doctor?.sucessoTriagemAtu || 'Triagem atualizada com sucesso.', 'sucesso');
    } catch (error) {
      mostrarToast(textos?.doctor?.erroTriagemAtu || 'Erro ao guardar edição da triagem.', 'erro');
    }
  };

  const [agoraTempo, setAgoraTempo] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgoraTempo(Date.now()), 60000);
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
    const diff = agoraTempo - inicio;
    const min = Math.floor(diff / 60000);
    return min < 0 ? 0 : min;
  };

  const totalEmEspera = episodios.length;
  const altasHoje = 0;
  const totalInternamentos = internamentos.length;

  const menus = [
    { id: 'informacao_geral', label: textos?.doctor?.informacaoGeral || 'Informação Geral', icon: <IconChart /> },
    { id: 'fila_triagens', label: textos?.doctor?.filaTriagens || 'Fila de Triagens', icon: <IconQueue /> },
    { id: 'internamentos', label: textos?.doctor?.internamentosAtivos || 'Internamentos Ativos', icon: <IconBed /> },
  ];

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
          {[['vermelho', 'Vermelho'], ['laranja', 'Laranja'], ['amarelo', 'Amarelo'], ['verde', 'Verde'], ['azul', 'Azul']].map(([key, label]) => (
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
      if (subMenuFila === 'em_espera') return estado !== 'terminado' && estado !== 'desistiu' && estado !== 'internado';
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
    const corTriagem = getField(dadosTriagem, 'cor_triagem', 'cortriagem');
    const inicioTriagem = getField(dadosTriagem, 'data_hora_inicio', 'datahorainicio');
    const dataTriagem = getField(dadosTriagem, 'datahorainicio', 'data_hora_inicio');
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
                  freqcard: getField(dadosTriagem, 'freq_card', 'freqcard') === '—' ? '' : getField(dadosTriagem, 'freq_card', 'freqcard'),
                  freqresp: getField(dadosTriagem, 'freq_resp', 'freqresp') === '—' ? '' : getField(dadosTriagem, 'freq_resp', 'freqresp'),
                  spo2: getField(dadosTriagem, 'sp_o2', 'spo2') === '—' ? '' : getField(dadosTriagem, 'sp_o2', 'spo2'),
                  sistolica: getField(dadosTriagem, 'sistolica') === '—' ? '' : getField(dadosTriagem, 'sistolica'),
                  diastolica: getField(dadosTriagem, 'diastolica') === '—' ? '' : getField(dadosTriagem, 'diastolica'),
                  sintomas: getField(dadosTriagem, 'sintomas') === '—' ? '' : getField(dadosTriagem, 'sintomas'),
                });
                setModoEdicaoTriagem(true);
              }}>{textos?.doctor?.editar || "Editar"}</button>
            ) : (
              <div className="doctor-actions-inline">
                <button type="button" className="doctor-action-btn doctor-action-btn--secondary" onClick={() => setModoEdicaoTriagem(false)}>{textos?.doctor?.cancelar || "Cancelar"}</button>
                <button type="button" className="doctor-action-btn doctor-action-btn--primary" onClick={guardarEdicaoTriagem}>{textos?.doctor?.guardar || "Guardar"}</button>
              </div>
            )}
          </div>

          <div className="doctor-triage-banner">
            <div className="doctor-triage-banner__priority">
              <span>{textos?.doctor?.prioridade || "Prioridade"}</span>
              <div className={TRIAGE_CLASS[corTriagem] || 'triage-badge'}>{corTriagem}</div>
            </div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.tempoEspera || "Tempo Espera"}</span><th>{tempoEsperaAtual != null ? `${tempoEsperaAtual} min` : '—'}</th></div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.inicio || "Início"}</span><th>{inicioTriagem !== '—' ? new Date(inicioTriagem).toLocaleString('pt-PT') : '—'}</th></div>
            <div className="doctor-triage-banner__info"><span>{textos?.doctor?.enfermeiro || "Enfermeiro"}</span><th>{getField(dadosTriagem, 'nome_enfermeiro', 'nomeenfermeiro')}</th></div>
          </div>

          {!modoEdicaoTriagem ? (
            <>
              <div className="doctor-vitals-table">
                <div className="doctor-vital-row"><span>{textos?.doctor?.temperatura || "Temperatura"}</span>        <th>{getField(dadosTriagem, 'temperatura')} °C</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.freqCardiaca || "Freq. Cardíaca"}</span>     <th>{getField(dadosTriagem, 'freq_card', 'freqcard')} bpm</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.freqRespiratoria || "Freq. Respiratória"}</span> <th>{getField(dadosTriagem, 'freq_resp', 'freqresp')} rpm</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.spo2 || "SpO2"}</span>               <th>{getField(dadosTriagem, 'sp_o2', 'spo2')} %</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.tensaoArterial || "Tensão Arterial"}</span>    <th>{getField(dadosTriagem, 'sistolica')}/{getField(dadosTriagem, 'diastolica')} mmHg</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.nivelDor || "Nível Dor"}</span>          <th>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.consciencia || "Consciência"}</span>        <th>{getField(dadosTriagem, 'consciencia')}</th></div>
              </div>
              <div className="doctor-clinical-note"><span>{textos?.doctor?.sintomasReferidos || "Sintomas Referidos"}</span><p>{getField(dadosTriagem, 'sintomas')}</p></div>
            </>
          ) : (
            <>
              <div className="doctor-vitals-table">
                {[[textos?.doctor?.temperatura || 'Temperatura', 'temperatura'], [textos?.doctor?.freqCardiaca || 'Freq. Cardíaca', 'freqcard'], [textos?.doctor?.freqRespiratoria || 'Freq. Respiratória', 'freqresp'], [textos?.doctor?.spo2 || 'SpO2', 'spo2']].map(([label, campo]) => (
                  <div key={campo} className="doctor-vital-row">
                    <span>{label}</span>
                    <input className="doctor-field" type="number" value={formTriagem[campo] ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, [campo]: e.target.value }))} />
                  </div>
                ))}
                <div className="doctor-vital-row">
                  <span>{textos?.doctor?.tensaoArterial || "Tensão Arterial"}</span>
                  <div className="doctor-bp-grid">
                    <input className="doctor-field" type="number" placeholder="Sistólica" value={formTriagem.sistolica ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, sistolica: e.target.value }))} />
                    <input className="doctor-field" type="number" placeholder="Diastólica" value={formTriagem.diastolica ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, diastolica: e.target.value }))} />
                  </div>
                </div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.nivelDor || "Nível Dor"}</span>  <th>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</th></div>
                <div className="doctor-vital-row"><span>{textos?.doctor?.consciencia || "Consciência"}</span> <th>{getField(dadosTriagem, 'consciencia')}</th></div>
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

  const renderTabDecisao = () => {
    const getCodEp = () =>
      episodioSelecionado?.cod_ep_urgenc ??
      episodioSelecionado?.codepurgenc ??
      episodioSelecionado?.cod_epurgenc ??
      null;

    const submeterAlta = async () => {
      const codEp = getCodEp();
      if (!codEp) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }
      setASubmeterAlta(true);
      try {
        const agora = new Date().toISOString();
        const idAtoConsulta = atos[0]?.idato ?? atos[0]?.id_ato ?? null;
        if (idAtoConsulta) {
          await fetch(`${API_URL}/atos/${idAtoConsulta}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ data_hora_fim: agora }),
          });
        }

        const resEpisodio = await fetch(`${API_URL}/episodios/${codEp}`, {
          method: 'PUT', headers: headers(),
          body: JSON.stringify({ estado: 'terminado', data_hora_saida: agora }),
        });
        if (!resEpisodio.ok) throw new Error('Falha ao atualizar episódio para alta.');

        const resAto = await fetch(`${API_URL}/atos/`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({
            cod_ep_urgenc: codEp,
            tipo: alta.tipo_alta || 'clinica',
            descricao: alta.observacoes || 'Alta registada.',
            data_hora_inicio: agora,
            data_hora_fim: agora,
          }),
        });
        if (!resAto.ok) throw new Error('Falha ao registar ato de alta.');

        setEpisodios((prev) => (prev || []).map((ep) => ep?.cod_ep_urgenc === codEp ? { ...ep, estado: 'terminado', data_hora_saida: agora } : ep));
        setSubMenuFila('em_espera');
        setEpisodioSelecionado(null);
        setAlta({ destino: 'alta', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '', observacoes: '', tipo_alta: 'clinica' });
        setTipoDecisao('alta');
        mostrarToast(textos?.doctor?.sucessoAlta || 'Alta registada com sucesso.', 'sucesso');
      } catch (error) {
        mostrarToast(error.message || (textos?.doctor?.erroAltaReg || 'Erro ao registar alta.'), 'erro');
      } finally {
        setASubmeterAlta(false);
      }
    };

    const submeterInternamento = async () => {
      const codEp = getCodEp();
      if (!codEp) { mostrarToast(textos?.doctor?.erroEpInvalido || 'Episódio inválido.', 'erro'); return; }
      if (!alta.servico) { mostrarToast(textos?.doctor?.erroServicoInt || 'Preencha o serviço de internamento.', 'erro'); return; }
      if (!alta.motivo_int) { mostrarToast(textos?.doctor?.erroMotivoInt || 'Preencha o motivo do internamento.', 'erro'); return; }
      setASubmeterAlta(true);
      try {
        const agora = new Date().toISOString();
        const idAtoConsulta = atos[0]?.idato ?? atos[0]?.id_ato ?? null;
        if (idAtoConsulta) {
          await fetch(`${API_URL}/atos/${idAtoConsulta}`, {
            method: 'PUT', headers: headers(),
            body: JSON.stringify({ data_hora_fim: agora }),
          });
        }

        const resInternamento = await fetch(`${API_URL}/internamentos/`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({
            cod_ep_urgenc: codEp, id_func: null, data_hora_int: agora,
            data_hora_consulta: null, data_hora_alta: null,
            motivo_int: alta.motivo_int === 'Outro' ? alta.motivo_int_outro || 'Outro' : alta.motivo_int,
            numero_cama: gerarNumeroCama(alta.servico),
            servico: alta.servico || null, tipo_alta: null,
          }),
        });
        if (!resInternamento.ok) throw new Error('Falha ao criar internamento.');

        const resEpisodio = await fetch(`${API_URL}/episodios/${codEp}`, {
          method: 'PUT', headers: headers(),
          body: JSON.stringify({ estado: 'internado' }),
        });
        if (!resEpisodio.ok) throw new Error('Falha ao atualizar episódio para internado.');

        const resAto = await fetch(`${API_URL}/atos/`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({
            cod_ep_urgenc: codEp,
            tipo: 'internamento',
            descricao: alta.observacoes || 'Encaminhado para internamento.',
            data_hora_inicio: agora,
            data_hora_fim: agora,
          }),
        });
        if (!resAto.ok) throw new Error('Falha ao registar ato de internamento.');

        setEpisodios((prev) => (prev || []).map((ep) => ep?.cod_ep_urgenc === codEp ? { ...ep, estado: 'internado' } : ep));
        setSubMenuFila('em_espera');
        setEpisodioSelecionado(null);
        setAlta({ destino: 'alta', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '', observacoes: '', tipo_alta: 'clinica' });
        setTipoDecisao('alta');
        await carregarInternamentos();
        mostrarToast(textos?.doctor?.sucessoInt || 'Internamento registado com sucesso.', 'sucesso');
      } catch (error) {
        mostrarToast(error.message || (textos?.doctor?.erroIntReg || 'Erro ao registar internamento.'), 'erro');
      } finally {
        setASubmeterAlta(false);
      }
    };

    return (
      <div>
        <SectionHeader title={textos?.doctor?.decisaoClinicaTitle || "Decisão clínica"} subtitle={textos?.doctor?.altaOuInternamentoSubtitle || "Alta ou internamento"} />
        <div className="doctor-toggle-row">
          <button type="button" className={`doctor-pill ${tipoDecisao === 'alta' ? 'is-active' : ''}`} onClick={() => setTipoDecisao('alta')}>{textos?.doctor?.altaPill || "Alta"}</button>
          <button type="button" className={`doctor-pill ${tipoDecisao === 'internamento' ? 'is-active' : ''}`} onClick={() => setTipoDecisao('internamento')}>{textos?.doctor?.internamentoPill || "Internamento"}</button>
        </div>
        <div className="doctor-form-grid">
          {tipoDecisao === 'internamento' && (
            <>
              <div>
                <label>{textos?.doctor?.servico || "Serviço"}</label>
                <select className="doctor-field" value={alta.servico} onChange={(e) => setAlta((prev) => ({ ...prev, servico: e.target.value }))}>
                  <option value="">{textos?.doctor?.selecioneOption || "Selecione..."}</option>
                  {SERVICOS.map((s, i) => <option key={`servico-${i}`} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="doctor-form-grid__full">
                <label>{textos?.doctor?.motivo || "Motivo"}</label>
                <select className="doctor-field" value={alta.motivo_int} onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int: e.target.value }))}>
                  <option value="">{textos?.doctor?.selecioneOption || "Selecione..."}</option>
                  {MOTIVOS_INTERNAMENTO.map((m, i) => <option key={`motivo-${i}`} value={m}>{m}</option>)}
                </select>
              </div>
              {alta.motivo_int === 'Outro' && (
                <div className="doctor-form-grid__full">
                  <label>{textos?.doctor?.especificarMotivoLabel || "Especificar motivo"}</label>
                  <input className="doctor-field" type="text" value={alta.motivo_int_outro} onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int_outro: e.target.value }))} />
                </div>
              )}
            </>
          )}
          {tipoDecisao === 'alta' && (
            <div className="doctor-form-grid__full">
              <label>{textos?.doctor?.tipoAltaLabel || "Tipo de Alta"}</label>
              <select
                className="doctor-field"
                value={alta.tipo_alta || 'clinica'}
                onChange={(e) => setAlta((prev) => ({ ...prev, tipo_alta: e.target.value }))}
              >
                <option value="clinica">{textos?.doctor?.altaClinica || "Alta Clínica"}</option>
                <option value="voluntaria">{textos?.doctor?.altaVoluntaria || "Alta Voluntária"}</option>
                <option value="obito">{textos?.doctor?.obito || "Óbito"}</option>
              </select>
            </div>
          )}
          <div className="doctor-form-grid__full">
            <label>{textos?.doctor?.observacoesLabel || "Observações"}</label>
            <textarea className="doctor-field" rows="4" value={alta.observacoes} onChange={(e) => setAlta((prev) => ({ ...prev, observacoes: e.target.value }))} />
          </div>
        </div>
        <button
          type="button"
          className="doctor-action-btn doctor-action-btn--primary"
          disabled={aSubmeterAlta}
          onClick={() => tipoDecisao === 'internamento' ? submeterInternamento() : submeterAlta()}
        >
          {aSubmeterAlta ? (textos?.doctor?.aGuardar || 'A guardar...') : tipoDecisao === 'internamento' ? (textos?.doctor?.enviarInternamentoBtn || 'Enviar para internamento') : (textos?.doctor?.gravarAltaBtn || 'Gravar alta')}
        </button>
      </div>
    );
  };

  const renderAtendimento = () => {
    const tabs = [
      ['vitais', textos?.doctor?.dadosVitaisTab || 'Dados Vitais'],
      ['prescricao', textos?.doctor?.prescreverTab || 'Prescrever'],
      ['decisao', textos?.doctor?.altaInternamentoTab || 'Alta / Internamento'],
    ];

    const codEpisodio = episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codepurgenc || '—';

    return (
      <div className="doctor-attendance-page">
        <div className="doctor-episode-header">
          <div className="doctor-episode-header__left">
            <button type="button" className="doctor-back-link" onClick={() => { setEpisodioSelecionado(null); setModoEdicaoTriagem(false); setTabAtendimento('vitais'); setSubMenuFila('em_espera'); }}>{textos?.doctor?.voltarFila || "← Voltar à fila"}</button>
            <h1 className="doctor-episode-title">{textos?.doctor?.episodio || "Episódio"} #{codEpisodio}</h1>
            <p className="doctor-episode-subtitle">{textos?.doctor?.ucipUrgencia || "UCIP · Urgência Central"}</p>
          </div>
          {codEpisodio !== '—' && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${codEpisodio}`}
                alt={`QR Code episódio #${codEpisodio}`}
                width={100}
                height={100}
              />
            </div>
          )}
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
              antecedentes={antecedentes}
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
              onEliminarMedicacao={eliminarMedicacao}
            />
          )}

          {tabAtendimento === 'decisao' && renderTabDecisao()}
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

  const renderFichaInternamento = () => {
    const medicacaoAtivaEnriquecida = enriquecerMedicacaoAtiva(medicacaoAtiva, medicamentos);

    return (
      <div className="doctor-panel-card doctor-panel-card--wide">
        <div className="doctor-patient-banner">
          <div>
            <button className="doctor-back-link" onClick={() => setInternamentoSelecionado(null)}>{textos?.doctor?.voltarInternamentos || "← Voltar aos internamentos"}</button>
            <h3 className="doctor-patient-banner__name">{internamentoSelecionado?.nome_utente || '—'}</h3>
            <p className="doctor-patient-banner__meta">{textos?.doctor?.internamento || "Internamento"} #{internamentoSelecionado?.cod_internamento}</p>
          </div>
          {internamentoSelecionado?.cod_ep_urgenc && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${internamentoSelecionado.cod_ep_urgenc}`}
                alt={`QR Code episódio #${internamentoSelecionado.cod_ep_urgenc}`}
                width={100}
                height={100}
              />
            </div>
          )}
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
            <SectionHeader title={textos?.doctor?.prescreverMedTitle || "Prescrever medicação"} subtitle={textos?.doctor?.medicaoAtivaSutsub || "Medicação ativa e nova prescrição"} />

            {medicacaoAtivaEnriquecida.length === 0 ? (
              <div className="doctor-empty-box" style={{ marginBottom: '1rem' }}>{textos?.doctor?.semMedicaoAtivaReg || "Sem medicação ativa registada."}</div>
            ) : (
              <div className="doctor-alert-list" style={{ marginBottom: '1rem' }}>
                {medicacaoAtivaEnriquecida.map((m, i) => (
                  <div key={`med-int-ativa-${i}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0.6rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem', background: '#fff' }}>
                    <span style={{ flex: '1 1 0', fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nomeApresentacao || `Medicamento ${i + 1}`}</span>
                    <span style={{ flex: '1 1 0', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
                      {m?.dosagem || '—'}
                    </span>
                    <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', whiteSpace: 'nowrap' }}
                        onClick={() => eliminarMedicacao(m)}
                      >
                        {textos?.doctor?.eliminarBtn || "Eliminar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="doctor-form-grid">
              <div className="doctor-form-grid__full">
                <label>{textos?.doctor?.medicamentoLabel || "Medicamento"}</label>
                <select className="doctor-field" name="codmedicamento" value={prescricao.codmedicamento} onChange={handlePrescricaoChange}>
                  <option value="">{textos?.doctor?.selecioneOption || "Selecione..."}</option>
                  {Array.isArray(medicamentos) && medicamentos.map((m, index) => {
                    const medId = getMedicamentoId(m, index);
                    const medNome = getMedicamentoNome(m, index);
                    const principio = m?.principioativo || m?.principio_ativo || '';
                    return (
                      <option key={`med-int-${medId}-${index}`} value={medId}>
                        {principio && principio !== medNome ? `${medNome} — ${principio}` : medNome}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="doctor-form-grid__full">
                <label>{textos?.doctor?.dosagemLabel || "Dosagem"}</label>
                <input className="doctor-field" type="text" name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} />
              </div>
              <div className="doctor-form-grid__full">
                <label>{textos?.doctor?.observacoesLabel || "Observações"}</label>
                <input className="doctor-field" type="text" name="observacoes" value={prescricao.observacoes} onChange={handlePrescricaoChange} />
              </div>
            </div>

            {alergias.length > 0 ? (
              <div className="doctor-risk-box" style={{ margin: '0.75rem 0' }}>
                {riscoIA && (
                  <div
                    className={`doctor-risk-result ${riscoIA?.risco === 1 || riscoIA?.riscoalto ? 'is-danger' : 'is-safe'}`}
                    style={{ marginBottom: '0.75rem' }}
                  >
                    <strong>
                      {riscoIA?.risco === 1 || riscoIA?.riscoalto
                        ? (textos?.doctor?.utenteComRiscoAlergia || 'Utente com risco/alergia para a medicação selecionada')
                        : (textos?.doctor?.semAlergiaConhecida || 'Sem alergia conhecida para a medicação selecionada')}
                    </strong>
                    <span>{riscoIA?.mensagem || riscoIA?.explicacao || (textos?.doctor?.sucessoAvaliacao || 'Avaliação concluída.')}</span>
                  </div>
                )}
                <button
                  type="button"
                  className="doctor-action-btn doctor-action-btn--secondary"
                  onClick={avaliarRiscoIAFn}
                  disabled={avaliacaoRisco || !prescricao.codmedicamento}
                >
                  {avaliacaoRisco ? (textos?.doctor?.aAvaliar || 'A avaliar...') : (textos?.doctor?.ajudaIaAvaliar || 'Ajuda IA: avaliar alergias e risco')}
                </button>
              </div>
            ) : (
              <div className="doctor-empty-box" style={{ margin: '0.75rem 0' }}>
                {textos?.doctor?.utenteSemAlergiasIa || "O utente não tem alergias registadas para validação automática."}
              </div>
            )}

            <div className="doctor-actions-inline" style={{ marginTop: '0.5rem' }}>
              <button
                className="doctor-action-btn doctor-action-btn--primary"
                onClick={submeterPrescricao}
                disabled={!prescricao.codmedicamento || !prescricao.dosagem}
              >
                {textos?.doctor?.prescreverBtn || "Prescrever"}
              </button>
            </div>
          </div>
        </div>

        <div className="doctor-subcard" style={{ marginTop: '1rem' }}>
          <SectionHeader title={textos?.doctor?.registarAltaTitle || "Registar alta de internamento"} />
          <div className="doctor-form-grid">
            <div>
              <label>{textos?.doctor?.tipoAltaLabel || "Tipo de Alta"}</label>
              <select className="doctor-field" value={altaInternamento.tipo_alta} onChange={(e) => setAltaInternamento((p) => ({ ...p, tipo_alta: e.target.value }))}>
                <option value="clinica">{textos?.doctor?.altaClinica || "Alta Clínica"}</option>
                <option value="voluntaria">{textos?.doctor?.altaVoluntaria || "Alta Voluntária"}</option>
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
  };

  return (
    <main className={`admin-layout doctor-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Toast mensagem={toast.mensagem} tipo={toast.tipo} onFechar={fecharToast} />

      <aside className="admin-sidebar" role="navigation" aria-label={textos?.doctor?.menuLateralAria || "Menu lateral"}>
        <button 
          type="button" 
          className="admin-sidebar__toggle" 
          onClick={() => setIsSidebarCollapsed((v) => !v)} 
          aria-label={textos?.doctor?.alternarSidebarAria || "Alternar menu lateral"}
        >
          <IconMenu />
        </button>
        
        <div className="admin-sidebar__brand">
          <img src={logo} alt="SIAGUH" className="admin-sidebar__logo" />
        </div>
        
        <div className="admin-sidebar__divider" />
        
        <button 
          type="button" 
          className="admin-sidebar__profile" 
          onClick={() => navigate('/perfil')}
          aria-label={textos?.doctor?.perfilAvatarAria || "Ver meu perfil"}
        >
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">
            {iniciaisUtilizador}
          </div>
          <span className="admin-sidebar__profile-name">{nomeUtilizador}</span>
        </button>
        
        <div className="admin-sidebar__divider" />
        
        <nav className="admin-sidebar__nav">
          {menus.map((menu) => (
            <button 
              key={menu.id} 
              type="button" 
              className={`admin-sidebar__link ${activeMenu === menu.id ? 'is-active' : ''}`}
              onClick={() => { setActiveMenu(menu.id); setEpisodioSelecionado(null); setInternamentoSelecionado(null); }}
            >
              <span className="sidebar-icon">{menu.icon}</span>
              <span className="link-text">{menu.label}</span>
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
            <IconExit />
            <span className="link-text">{textos?.doctor?.terminarSessao || "Terminar sessão"}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper">
        <div className="admin-content-inner">
          
          <div className="admin-content-top">
            <h1>{textos?.doctor?.painelMedico || "Painel do Médico"}</h1>
            <p>{nomeHospital}</p>
          </div>

          <div className="admin-content-body">
            {activeMenu === 'informacao_geral' && renderInformacaoGeral()}
            {activeMenu === 'fila_triagens' &&
              (subMenuFila === 'atendimento' && episodioSelecionado
                ? renderAtendimento()
                : renderFilaTriagens())}
            {activeMenu === 'internamentos' && renderInternamentos()}
          </div>
        </div>

        <FooterLayout />
      </section>
    </main>
  );
}