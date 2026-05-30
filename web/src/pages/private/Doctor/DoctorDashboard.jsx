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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/v1`;

const SERVICOS = ['Cardiologia', 'Medicina', 'Ortopedia', 'Cirurgia'];

const PREFIXO_SERVICO = {
  'Cardiologia': 'CAR',
  'Medicina':    'MED',
  'Ortopedia':   'ORT',
  'Cirurgia':    'CIR',
};

const gerarNumeroCama = (servico) => {
  const prefixo = PREFIXO_SERVICO[servico] || 'GER';
  const numero  = String(Math.floor(Math.random() * 50) + 1).padStart(2, '0');
  return `${prefixo}-${numero}`;
};
const MOTIVOS_INTERNAMENTO = [
  'Insuficiência cardíaca', 'Pneumonia', 'Fratura óssea', 'Pós-operatório',
  'Monitorização clínica', 'AVC', 'Sépsis', 'Descompensação diabética',
  'Dor torácica', 'Outro',
];
const TRIAGE_ORDER = { Vermelho: 1, Laranja: 2, Amarelo: 3, Verde: 4, Azul: 5 };
const TRIAGE_CLASS = {
  Vermelho: 'triage-badge triage-badge--vermelho',
  Laranja:  'triage-badge triage-badge--laranja',
  Amarelo:  'triage-badge triage-badge--amarelo',
  Verde:    'triage-badge triage-badge--verde',
  Azul:     'triage-badge triage-badge--azul',
};

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
  String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const getMedicamentoId = (m, index = 0) =>
  String(
    m?.codmedicamento ?? m?.cod_medicamento ?? m?.idmedicamento ??
    m?.id_medicamento ?? m?.id ?? `med-${index}`
  );

const getCodUtente = (obj) =>
  obj?.codutente ?? obj?.cod_utente ?? obj?.numutent ?? obj?.num_utent ??
  obj?.utente_id ?? null;

const getCodEpisodio = (obj) =>
  obj?.codepurgenc ?? obj?.cod_ep_urgenc ?? obj?.codepisodio ??
  obj?.cod_episodio ?? null;

const getMedicamentoNome = (m, index = 0) => {
  if (!m) return `Medicamento ${String(index + 1).padStart(3, '0')}`;
  // Priorizar princípio ativo em vez do nome comercial
  const nome =
    m?.principioativo ?? m?.principio_ativo ?? m?.farmaco ??
    m?.nome ?? m?.nome_medicamento ?? m?.nomemedicamento ?? m?.medicamento_nome ??
    m?.nomeMedicamento ?? m?.designacao ?? m?.designacao_comercial ?? m?.descricao ??
    m?.medicamento ?? m?.nomecomercial ?? m?.denominacao ?? '';
  return String(nome).trim() || `Medicamento ${String(index + 1).padStart(3, '0')}`;
};

// CORRIGIDO: enriquecerMedicacaoAtiva recebe medicamentos como segundo argumento
const enriquecerMedicacaoAtiva = (lista = [], medicamentos = []) =>
  lista.map((item, index) => {
    const itemId = String(
      item?.codmedicamento ?? item?.cod_medicamento ?? item?.idmedicamento ??
      item?.id_medicamento ?? item?.medicamento_id ?? item?.id ?? ''
    );

    const medicamentoCatalogo = medicamentos.find(
      (med) => String(getMedicamentoId(med)) === itemId
    );

    // Priorizar princípio ativo em vez do nome comercial
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

function SectionHeader({ title, subtitle }) {
  return (
    <div className="doctor-section-header">
      <h2 className="doctor-section-header__title">{title}</h2>
      {subtitle ? <p className="doctor-section-header__subtitle">{subtitle}</p> : null}
    </div>
  );
}

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
  const [aSubmeterAlta, setASubmeterAlta]               = useState(false);
  const [alta, setAlta]                                 = useState({
    destino: 'alta', observacoes: '', servico: '', numero_cama: '',
    motivo_int: '', motivo_int_outro: '',
  });

  // CORRIGIDO: tipoDecisao para a tab de decisão clínica (F1)
  const [tipoDecisao, setTipoDecisao] = useState('alta');

  const utilizadorLogado = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  }, []);

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

  // CORRIGIDO: token é função, sempre chamado como token()
  const token   = () => sessionStorage.getItem('token');
  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`,
  });

  useEffect(() => { carregarTudo(); }, []);

  const carregarTudo = () => {
    carregarEpisodios();
    carregarTemposMedios();
    carregarInternamentos();
    carregarMedicamentos();
  };

  // ── Loaders ────────────────────────────────────────────────

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

  const abrirEpisodio = async (ep) => {
    if (!ep) { mostrarToast('Episódio inválido.', 'erro'); return; }

    const numUtente   = getCodUtente(ep);
    const codEpisodio = getCodEpisodio(ep);

    if (!numUtente || !codEpisodio) {
      mostrarToast('Dados do episódio inválidos.', 'erro');
      return;
    }

    setEpisodioSelecionado(ep);
    setSubMenuFila('atendimento');
    setTabAtendimento('vitais');
    setRiscoIA(null);

    try {
      const [rUtente, rTriagem, rMedicacao, rAtos, rAlergias, rAntecedentes] =
        await Promise.all([
          fetch(`${API_URL}/utentes/${numUtente}`,                    { headers: headers() }),
          fetch(`${API_URL}/triagens/${codEpisodio}`,                 { headers: headers() }),
          fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`,     { headers: headers() }),
          fetch(`${API_URL}/atos/episodio/${codEpisodio}`,            { headers: headers() }),
          fetch(`${API_URL}/alergias/utente/${numUtente}`,            { headers: headers() }),
          fetch(`${API_URL}/utente-antecedentes/utente/${numUtente}`, { headers: headers() }),
        ]);

      if (rUtente.ok)    { setUtente(await rUtente.json()); }
      else               { setUtente(null); }

      if (rTriagem.ok)   { setDadosTriagem(await rTriagem.json()); }
      else               { setDadosTriagem(null); }

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

      if (rAntecedentes.ok) { setAntecedentes(await rAntecedentes.json()); }
      else                  { setAntecedentes(null); }

      setAlertas([]);

    } catch (e) {
      console.error(e);
      mostrarToast('Erro ao abrir episódio.', 'erro');
    }
  };

  // ── Abrir internamento ─────────────────────────────────────

  const abrirInternamento = async (int) => {
    if (!int) { mostrarToast('Internamento inválido.', 'erro'); return; }

    try {
      setInternamentoSelecionado(int);
      setEpisodioSelecionado(null);
      setActiveMenu('internamentos');

      const codEpisodio = getField(int, 'cod_ep_urgenc', 'codEpisodio', 'codepisodio', 'cod_epurgenc');

      // Obter episódio primeiro para extrair numUtente — InternamentoOut não tem num_utent
      let numUtente = getField(int, 'num_utent', 'numUtente', 'numutente', 'num_utente', 'codutente');
      if (!numUtente || numUtente === '—') {
        if (codEpisodio && codEpisodio !== '—') {
          try {
            const rEp = await fetch(`${API_URL}/episodios/${codEpisodio}`, { headers: headers() });
            if (rEp.ok) {
              const epData = await rEp.json();
              numUtente =
                epData?.num_utent ?? epData?.numutent ?? epData?.cod_utente ??
                epData?.codutente ?? epData?.utente_id ?? null;
            }
          } catch { numUtente = null; }
        }
      }

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
      mostrarToast('Erro ao abrir internamento.', 'erro');
    }
  };

  // ── Prescrição ─────────────────────────────────────────────

  const submeterPrescricao = async () => {
    try {
      const codEpisodio =
        getCodEpisodio(episodioSelecionado) ||
        getField(internamentoSelecionado, 'cod_ep_urgenc', 'codEpisodio', 'codepisodio', 'cod_epurgenc');

      if (!codEpisodio) { mostrarToast('Episódio inválido.', 'erro'); return; }

      const atoSelecionado = Array.isArray(atos) && atos.length > 0 ? atos[0] : null;
      const idAto = atoSelecionado?.idato ?? atoSelecionado?.id_ato ?? null;

      if (!idAto) { mostrarToast('Não existe ato clínico associado ao episódio.', 'erro'); return; }
      if (!prescricao?.codmedicamento || !prescricao?.dosagem) {
        mostrarToast('Seleciona medicamento e dosagem.', 'erro');
        return;
      }

      // CORRIGIDO: chaves alinhadas com o schema Pydantic (id_ato, cod_medicamento)
      const body = {
        id_ato:          Number(idAto),
        cod_medicamento: Number(prescricao.codmedicamento),
        dosagem:         String(prescricao.dosagem).trim(),
        observacoes:     prescricao.observacoes?.trim() || null,
      };

      // CORRIGIDO: headers: headers()
      const r = await fetch(`${API_URL}/prescricoes`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });

      const responseText = await r.text();

      if (!r.ok) {
        mostrarToast(`Erro ao prescrever (${r.status}).`, 'erro');
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

      // Alimentar medicação ativa com a prescrição acabada de criar
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
              num_utent:       Number(numUtente),
              cod_medicamento: Number(prescricao.codmedicamento),
              data_inicio:     new Date().toISOString().split('T')[0], // date only — schema espera date não datetime
              data_fim:        null,
              dosagem:         String(prescricao.dosagem).trim(),
            }),
          });
          // Recarregar medicação ativa para reflectir a nova entrada
          const rMed = await fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, { headers: headers() });
          if (rMed.ok) {
            const mData = await rMed.json();
            setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
          }
        } catch (eMed) {
          console.warn('Aviso: não foi possível atualizar medicação ativa:', eMed);
          mostrarToast('Prescrição gravada, mas não foi possível atualizar a medicação ativa.', 'aviso');
        }
      }

      setPrescricao({ codmedicamento: '', dosagem: '', observacoes: '' });
      setRiscoIA(null);
      mostrarToast(`Prescrição de ${nomeMedicamento} registada com sucesso.`, 'sucesso');
    } catch (e) {
      console.error('ERRO submeterPrescricao:', e);
      mostrarToast('Erro ao prescrever.', 'erro');
    }
  };

  // ── Avaliação de risco IA ──────────────────────────────────

  const eliminarMedicacao = async (med) => {
    const codMedicacaoAtiva =
      med?.cod_medicacao_ativa ?? med?.codmedicacaoativa ?? med?.id ?? null;

    if (!codMedicacaoAtiva) {
      mostrarToast('Não foi possível identificar a prescrição.', 'erro');
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

      mostrarToast('Prescrição eliminada com sucesso.', 'sucesso');
    } catch (e) {
      console.error('ERRO eliminarMedicacao:', e);
      mostrarToast(e.message || 'Erro ao eliminar prescrição.', 'erro');
    }
  };

  const avaliarRiscoIAFn = async () => {
    if (!prescricao?.codmedicamento) {
      mostrarToast('Seleciona um medicamento.', 'erro');
      return;
    }

    setAvaliacaoRisco(true);

    try {
      const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

      // Obter dados do medicamento selecionado
      const med = medicamentos.find(
        (m) => String(getMedicamentoId(m)) === String(prescricao.codmedicamento)
      );
      const nomeMed      = med ? getMedicamentoNome(med) : 'Medicamento';
      const classeMed    = med?.classe_terapeutica_id ?? med?.classeterapeuticaid ?? 1;

      // Verificar alergia à classe do medicamento
      const temAlergia = alergias.some((a) => {
        const txt = String(a?.descricao || a?.substancia || a?.alergia || '').toLowerCase();
        return txt.includes(nomeMed.toLowerCase());
      });

      // Verificar gravidade da alergia (0=Nenhuma até 4=Muito Grave)
      const gravidadeAlergia = temAlergia ? 2 : 0;

      // Verificar interação ativa — se já toma medicamento da mesma classe
      const temInteracao = medicacaoAtiva.some((m) => {
        const medAtivo = medicamentos.find(
          (med) => String(getMedicamentoId(med)) === String(
            m?.codmedicamento ?? m?.cod_medicamento ?? m?.id ?? ''
          )
        );
        return medAtivo?.classe_terapeutica_id === classeMed;
      });

      // Calcular idade do utente
      const idade = utente?.data_nasc
        ? Math.floor((Date.now() - new Date(utente.data_nasc).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 50;

      // Chamar modelo de IA real
      const res = await fetch(`${API_IA}/predict/v1/medicine-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Classe_Novo_Med:    classeMed,
          Tem_Alergia_Classe: temAlergia ? 1 : 0,
          Gravidade_Alergia:  gravidadeAlergia,
          Tem_Interacao_Ativa: temInteracao ? 1 : 0,
          Idade_Utente:       idade,
        }),
      });

      if (!res.ok) throw new Error(`Erro no modelo IA (${res.status})`);

      const data = await res.json();

      const resultado = {
        risco:     data.risco,
        riscoalto: data.risco === 1,
        mensagem:  data.risco === 1
          ? `Risco elevado — ${nomeMed} (prob. ${(data.probabilidade * 100).toFixed(1)}%)`
          : `Sem risco identificado — ${nomeMed} (prob. ${(data.probabilidade * 100).toFixed(1)}%)`,
        explicacao: [
          temAlergia    ? 'Alergia à classe detetada.' : null,
          temInteracao  ? 'Interação com medicação ativa.' : null,
        ].filter(Boolean).join(' ') || 'Sem fatores de risco identificados.',
      };

      setRiscoIA(resultado);
      mostrarToast('Avaliação IA concluída.', 'sucesso');
    } catch (e) {
      console.error(e);
      mostrarToast('Erro na avaliação IA.', 'erro');
    } finally {
      setAvaliacaoRisco(false);
    }
  };

  // ── Decisão clínica (urgência) ─────────────────────────────

  const submeterDecisaoClinica = async () => {
    try {
      if (aSubmeterDecisao) return;

      const codEpisodio =
        episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codep_urgenc ||
        episodioSelecionado?.cod_epurgenc  || episodioSelecionado?.codepurgenc;

      if (!codEpisodio) { mostrarToast('Episódio inválido.', 'erro'); return; }
      if (!acaoClinica)  { mostrarToast('Selecione Alta ou Internamento.', 'erro'); return; }
      if (acaoClinica === 'internamento' && !alta.servico) {
        mostrarToast('Selecione o serviço de internamento.', 'erro');
        return;
      }
      if (acaoClinica === 'internamento' && !alta.motivo_int) {
        mostrarToast('Selecione o motivo do internamento.', 'erro');
        return;
      }

      setASubmeterDecisao(true);

      const agora = new Date().toISOString();

      // CORRIGIDO: quando é internamento, cria primeiro o registo em /internamentos
      // (antes só atualizava o episódio — por isso nunca aparecia na lista de internamentos)
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

      // Atualizar estado do episódio
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
        acaoClinica === 'alta' ? 'Alta registada com sucesso.' : 'Internamento registado com sucesso.',
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
      mostrarToast(e.message || 'Erro ao registar decisão clínica.', 'erro');
    } finally {
      setASubmeterDecisao(false);
    }
  };

  // ── Alta de internamento ───────────────────────────────────

  const submeterAltaInternamento = async () => {
    try {
      if (!internamentoSelecionado) { mostrarToast('Internamento inválido.', 'erro'); return; }

      const codInternamento = getField(
        internamentoSelecionado,
        'codinternamento', 'cod_internamento', 'idinternamento', 'id_internamento'
      );

      if (!codInternamento) { mostrarToast('Código do internamento inválido.', 'erro'); return; }

      // CORRIGIDO: chaves alinhadas com InternamentoUpdate (tipo_alta, data_hora_alta)
      // estado não existe no schema — a alta é identificada pela presença de data_hora_alta
      const payload = {
        tipo_alta:      altaInternamento.tipo_alta || 'clinica',
        data_hora_alta: new Date().toISOString(),
      };

      // CORRIGIDO: API_URL (não APIURL) + headers: headers()
      const r = await fetch(`${API_URL}/internamentos/${codInternamento}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!r.ok) throw new Error(`Erro ao registar alta do internamento (${r.status})`);

      mostrarToast('Alta de internamento registada com sucesso.', 'sucesso');

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
      mostrarToast(e.message || 'Erro ao registar alta do internamento.', 'erro');
    }
  };

  // ── Guardar edição de triagem ──────────────────────────────

  const guardarEdicaoTriagem = async () => {
    try {
      const codEpisodio = getCodEpisodio(episodioSelecionado);
      if (!codEpisodio) { mostrarToast('Código do episódio não encontrado.', 'erro'); return; }

      const payload = {
        temperatura: formTriagem.temperatura || null,
        freq_card:   formTriagem.freqcard    || null,
        freq_resp:   formTriagem.freqresp    || null,
        sp_o2:       formTriagem.spo2        || null,
        sistolica:   formTriagem.sistolica   || null,
        diastolica:  formTriagem.diastolica  || null,
        sintomas:    formTriagem.sintomas    || null,
      };

      // CORRIGIDO: headers: headers()
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
      mostrarToast('Triagem atualizada com sucesso.', 'sucesso');
    } catch (error) {
      console.error('ERRO guardarEdicaoTriagem', error);
      mostrarToast('Erro ao guardar edição da triagem.', 'erro');
    }
  };

  // ── Tempo de espera ────────────────────────────────────────

  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

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
    { id: 'informacao_geral', label: 'Informação Geral',      icon: <IconChart /> },
    { id: 'fila_triagens',    label: 'Fila de Triagens',      icon: <IconQueue /> },
    { id: 'internamentos',    label: 'Internamentos Ativos',  icon: <IconBed />   },
  ];

  // ── Renders ────────────────────────────────────────────────

  const renderInformacaoGeral = () => (
    <div className="doctor-panel-card">
      <SectionHeader title="Informação Geral" subtitle="Resumo clínico e tempos de espera por prioridade" />
      <div className="doctor-kpi-grid">
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--blue">📋</div>
          <div><div className="doctor-kpi-card__label">Episódios em espera</div><div className="doctor-kpi-card__value">{totalEmEspera}</div></div>
        </div>
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--green">✓</div>
          <div><div className="doctor-kpi-card__label">Altas hoje</div><div className="doctor-kpi-card__value">{altasHoje}</div></div>
        </div>
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--purple">🏥</div>
          <div><div className="doctor-kpi-card__label">Internamentos ativos</div><div className="doctor-kpi-card__value">{totalInternamentos}</div></div>
        </div>
      </div>
      <div className="doctor-triage-times-card">
        <h3 className="doctor-card-title">Tempo de Espera por Cor de Triagem</h3>
        <p className="doctor-card-subtitle">Distribuição atual do tempo médio no hospital</p>
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
      // CORRIGIDO: estados consistentes com DoctorQueue ("terminado" em vez de "concluido")
      if (subMenuFila === 'em_espera')  return estado !== 'terminado' && estado !== 'desistiu' && estado !== 'internado';
      if (subMenuFila === 'atendimento') return estado === 'emconsulta' || estado === 'atendimento';
      // tab concluidos removida
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
            <div><h3>Dados do Utente</h3><p>Informação principal do episódio</p></div>
          </div>
          <div className="doctor-patient-grid">
            <div className="doctor-patient-item"><span>Nome</span><strong>{utente?.nome || episodioSelecionado?.nome_utente || '—'}</strong></div>
            <div className="doctor-patient-item"><span>Nº Utente</span><strong>{getField(utente, 'num_utent', 'numutente', 'numutent')}</strong></div>
            <div className="doctor-patient-item"><span>Sexo</span><strong>{utente?.sexo || '—'}</strong></div>
            <div className="doctor-patient-item"><span>Data Nascimento</span><strong>{utente?.data_nasc ? new Date(utente.data_nasc).toLocaleDateString('pt-PT') : '—'}</strong></div>
            <div className="doctor-patient-item"><span>Telefone</span><strong>{utente?.telefone || '—'}</strong></div>
            <div className="doctor-patient-item"><span>Email</span><strong>{utente?.email || '—'}</strong></div>
            <div className="doctor-patient-item"><span>Morada</span><strong>{utente?.localidade || '—'}</strong></div>
            <div className="doctor-patient-item"><span>NIF</span><strong>{utente?.nif || '—'}</strong></div>
          </div>
        </section>

        <section className="doctor-medical-card">
          <div className="doctor-medical-card__header">
            <div><h3>Triagem</h3><p>Dados clínicos iniciais do episódio</p></div>
            {!modoEdicaoTriagem ? (
              <button type="button" className="doctor-outline-btn" onClick={() => {
                setFormTriagem({
                  temperatura: getField(dadosTriagem, 'temperatura') === '—' ? '' : getField(dadosTriagem, 'temperatura'),
                  freqcard:    getField(dadosTriagem, 'freq_card', 'freqcard') === '—' ? '' : getField(dadosTriagem, 'freq_card', 'freqcard'),
                  freqresp:    getField(dadosTriagem, 'freq_resp', 'freqresp') === '—' ? '' : getField(dadosTriagem, 'freq_resp', 'freqresp'),
                  spo2:        getField(dadosTriagem, 'sp_o2', 'spo2') === '—' ? '' : getField(dadosTriagem, 'sp_o2', 'spo2'),
                  sistolica:   getField(dadosTriagem, 'sistolica') === '—' ? '' : getField(dadosTriagem, 'sistolica'),
                  diastolica:  getField(dadosTriagem, 'diastolica') === '—' ? '' : getField(dadosTriagem, 'diastolica'),
                  sintomas:    getField(dadosTriagem, 'sintomas') === '—' ? '' : getField(dadosTriagem, 'sintomas'),
                });
                setModoEdicaoTriagem(true);
              }}>Editar</button>
            ) : (
              <div className="doctor-actions-inline">
                <button type="button" className="doctor-action-btn doctor-action-btn--secondary" onClick={() => setModoEdicaoTriagem(false)}>Cancelar</button>
                <button type="button" className="doctor-action-btn doctor-action-btn--primary"   onClick={guardarEdicaoTriagem}>Guardar</button>
              </div>
            )}
          </div>

          <div className="doctor-triage-banner">
            <div className="doctor-triage-banner__priority">
              <span>Prioridade</span>
              <div className={TRIAGE_CLASS[corTriagem] || 'triage-badge'}>{corTriagem}</div>
            </div>
            <div className="doctor-triage-banner__info"><span>Tempo Espera</span><strong>{tempoEsperaAtual != null ? `${tempoEsperaAtual} min` : '—'}</strong></div>
            <div className="doctor-triage-banner__info"><span>Início</span><strong>{inicioTriagem !== '—' ? new Date(inicioTriagem).toLocaleString('pt-PT') : '—'}</strong></div>
            <div className="doctor-triage-banner__info"><span>Enfermeiro</span><strong>{getField(dadosTriagem, 'nome_enfermeiro', 'nomeenfermeiro')}</strong></div>
          </div>

          {!modoEdicaoTriagem ? (
            <>
              <div className="doctor-vitals-table">
                <div className="doctor-vital-row"><span>Temperatura</span>        <strong>{getField(dadosTriagem, 'temperatura')} °C</strong></div>
                <div className="doctor-vital-row"><span>Freq. Cardíaca</span>     <strong>{getField(dadosTriagem, 'freq_card', 'freqcard')} bpm</strong></div>
                <div className="doctor-vital-row"><span>Freq. Respiratória</span> <strong>{getField(dadosTriagem, 'freq_resp', 'freqresp')} rpm</strong></div>
                <div className="doctor-vital-row"><span>SpO2</span>               <strong>{getField(dadosTriagem, 'sp_o2', 'spo2')} %</strong></div>
                <div className="doctor-vital-row"><span>Tensão Arterial</span>    <strong>{getField(dadosTriagem, 'sistolica')}/{getField(dadosTriagem, 'diastolica')} mmHg</strong></div>
                <div className="doctor-vital-row"><span>Nível Dor</span>          <strong>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</strong></div>
                <div className="doctor-vital-row"><span>Consciência</span>        <strong>{getField(dadosTriagem, 'consciencia')}</strong></div>
              </div>
              <div className="doctor-clinical-note"><span>Sintomas Referidos</span><p>{getField(dadosTriagem, 'sintomas')}</p></div>
            </>
          ) : (
            <>
              <div className="doctor-vitals-table">
                {[['Temperatura','temperatura'],['Freq. Cardíaca','freqcard'],['Freq. Respiratória','freqresp'],['SpO2','spo2']].map(([label, campo]) => (
                  <div key={campo} className="doctor-vital-row">
                    <span>{label}</span>
                    <input className="doctor-field" type="number" value={formTriagem[campo] ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, [campo]: e.target.value }))} />
                  </div>
                ))}
                <div className="doctor-vital-row">
                  <span>Tensão Arterial</span>
                  <div className="doctor-bp-grid">
                    <input className="doctor-field" type="number" placeholder="Sistólica"  value={formTriagem.sistolica  ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, sistolica:  e.target.value }))} />
                    <input className="doctor-field" type="number" placeholder="Diastólica" value={formTriagem.diastolica ?? ''} onChange={(e) => setFormTriagem((p) => ({ ...p, diastolica: e.target.value }))} />
                  </div>
                </div>
                <div className="doctor-vital-row"><span>Nível Dor</span>  <strong>{getField(dadosTriagem, 'nivel_dor', 'niveldor')} /10</strong></div>
                <div className="doctor-vital-row"><span>Consciência</span> <strong>{getField(dadosTriagem, 'consciencia')}</strong></div>
              </div>
              <div className="doctor-clinical-note">
                <span>Sintomas Referidos</span>
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
      episodioSelecionado?.codepurgenc   ??
      episodioSelecionado?.cod_epurgenc  ??
      null;

    const submeterAlta = async () => {
      const codEp = getCodEp();
      if (!codEp) { mostrarToast('Episódio inválido.', 'erro'); return; }
      setASubmeterAlta(true);
      try {
        const agora = new Date().toISOString();
        const resEpisodio = await fetch(`${API_URL}/episodios/${codEp}`, {
          method: 'PUT', headers: headers(),
          body: JSON.stringify({ estado: 'terminado', data_hora_saida: agora }),
        });
        if (!resEpisodio.ok) throw new Error('Falha ao atualizar episódio para alta.');
        const resAto = await fetch(`${API_URL}/atos/`, {
          method: 'POST', headers: headers(),
          body: JSON.stringify({ cod_ep_urgenc: codEp, tipo: 'alta', descricao: alta.observacoes || 'Alta registada.', data_hora_inicio: agora, data_hora_fim: agora }),
        });
        if (!resAto.ok) throw new Error('Falha ao registar ato de alta.');
        setEpisodios((prev) => (prev || []).map((ep) => ep?.cod_ep_urgenc === codEp ? { ...ep, estado: 'terminado', data_hora_saida: agora } : ep));
        setSubMenuFila('em_espera');
        setEpisodioSelecionado(null);
        setAlta({ destino: 'alta', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '', observacoes: '' });
        setTipoDecisao('alta');
        mostrarToast('Alta registada com sucesso.', 'sucesso');
      } catch (error) {
        mostrarToast(error.message || 'Erro ao registar alta.', 'erro');
      } finally {
        setASubmeterAlta(false);
      }
    };

    const submeterInternamento = async () => {
      const codEp = getCodEp();
      if (!codEp) { mostrarToast('Episódio inválido.', 'erro'); return; }
      if (!alta.servico) { mostrarToast('Preencha o serviço de internamento.', 'erro'); return; }
      if (!alta.motivo_int) { mostrarToast('Preencha o motivo do internamento.', 'erro'); return; }
      setASubmeterAlta(true);
      try {
        const agora = new Date().toISOString();
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
          body: JSON.stringify({ cod_ep_urgenc: codEp, tipo: 'internamento', descricao: alta.observacoes || 'Encaminhado para internamento.', data_hora_inicio: agora, data_hora_fim: agora }),
        });
        if (!resAto.ok) throw new Error('Falha ao registar ato de internamento.');
        setEpisodios((prev) => (prev || []).map((ep) => ep?.cod_ep_urgenc === codEp ? { ...ep, estado: 'internado' } : ep));
        setSubMenuFila('em_espera');
        setEpisodioSelecionado(null);
        setAlta({ destino: 'alta', servico: '', numero_cama: '', motivo_int: '', motivo_int_outro: '', observacoes: '' });
        setTipoDecisao('alta');
        await carregarInternamentos();
        mostrarToast('Internamento registado com sucesso.', 'sucesso');
      } catch (error) {
        mostrarToast(error.message || 'Erro ao registar internamento.', 'erro');
      } finally {
        setASubmeterAlta(false);
      }
    };

    return (
      <div>
        <SectionHeader title="Decisão clínica" subtitle="Alta ou internamento" />
        <div className="doctor-toggle-row">
          <button type="button" className={`doctor-pill ${tipoDecisao === 'alta' ? 'is-active' : ''}`} onClick={() => setTipoDecisao('alta')}>Alta</button>
          <button type="button" className={`doctor-pill ${tipoDecisao === 'internamento' ? 'is-active' : ''}`} onClick={() => setTipoDecisao('internamento')}>Internamento</button>
        </div>
        <div className="doctor-form-grid">
          {tipoDecisao === 'internamento' && (
            <>
              <div>
                <label>Serviço</label>
                <select className="doctor-field" value={alta.servico} onChange={(e) => setAlta((prev) => ({ ...prev, servico: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {SERVICOS.map((s, i) => <option key={`servico-${i}`} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="doctor-form-grid__full">
                <label>Motivo</label>
                <select className="doctor-field" value={alta.motivo_int} onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {MOTIVOS_INTERNAMENTO.map((m, i) => <option key={`motivo-${i}`} value={m}>{m}</option>)}
                </select>
              </div>
              {alta.motivo_int === 'Outro' && (
                <div className="doctor-form-grid__full">
                  <label>Especificar motivo</label>
                  <input className="doctor-field" type="text" value={alta.motivo_int_outro} onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int_outro: e.target.value }))} />
                </div>
              )}
            </>
          )}
          <div className="doctor-form-grid__full">
            <label>Observações</label>
            <textarea className="doctor-field" rows="4" value={alta.observacoes} onChange={(e) => setAlta((prev) => ({ ...prev, observacoes: e.target.value }))} />
          </div>
        </div>
        <button
          type="button"
          className="doctor-action-btn doctor-action-btn--primary"
          disabled={aSubmeterAlta}
          onClick={() => tipoDecisao === 'internamento' ? submeterInternamento() : submeterAlta()}
        >
          {aSubmeterAlta ? 'A guardar...' : tipoDecisao === 'internamento' ? 'Enviar para internamento' : 'Gravar alta'}
        </button>
      </div>
    );
  };

  const renderAtendimento = () => {
    const tabs = [
      ['vitais',    'Dados Vitais'],
      ['prescricao','Prescrever'],
      ['decisao',   'Alta / Internamento'],
    ];

    const codEpisodio  = episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codepurgenc || '—';
    const dataEntrada  = dadosTriagem?.data_hora_inicio ? new Date(dadosTriagem.data_hora_inicio).toLocaleString('pt-PT') : '—';

    return (
      <div className="doctor-attendance-page">
        <div className="doctor-episode-header">
          <div className="doctor-episode-header__left">
            <button type="button" className="doctor-back-link" onClick={() => { setEpisodioSelecionado(null); setModoEdicaoTriagem(false); setTabAtendimento('vitais'); setSubMenuFila('em_espera'); }}>← Voltar à fila</button>
            <h1 className="doctor-episode-title">Episódio #{codEpisodio}</h1>
            <p className="doctor-episode-subtitle">UCIP · Urgência Central</p>
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
            // CORRIGIDO: imprimirPrescricao removido
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
        <SectionHeader title="Internamentos Ativos" subtitle="Consultar ficha do utente, prescrever e registar alta" />
        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr><th>Internamento</th><th>Episódio</th><th>Utente</th><th>Serviço</th><th>Cama</th><th>Motivo</th><th>Entrada</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {internamentos.length === 0 ? (
                <tr><td colSpan="8" className="doctor-table-empty">Sem utentes internados de momento.</td></tr>
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
                    <td><button className="doctor-action-btn doctor-action-btn--primary" onClick={() => abrirInternamento(int)}>Consultar</button></td>
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
          <button className="doctor-back-link" onClick={() => setInternamentoSelecionado(null)}>← Voltar aos internamentos</button>
          <h3 className="doctor-patient-banner__name">{internamentoSelecionado?.nome_utente || '—'}</h3>
          <p className="doctor-patient-banner__meta">Internamento #{internamentoSelecionado?.cod_internamento}</p>
        </div>
      </div>

      <div className="doctor-internamento-grid">
        <div className="doctor-subcard">
          <SectionHeader title="Dados do internamento" />
          <div className="doctor-detail-list">
            <div><span>Episódio</span><strong>#{internamentoSelecionado?.cod_ep_urgenc || '—'}</strong></div>
            <div><span>Serviço</span><strong>{internamentoSelecionado?.servico || '—'}</strong></div>
            <div><span>Cama</span><strong>{internamentoSelecionado?.numero_cama || '—'}</strong></div>
            <div><span>Motivo</span><strong>{internamentoSelecionado?.motivo_int || '—'}</strong></div>
            <div><span>Entrada</span><strong>{internamentoSelecionado?.data_hora_int ? new Date(internamentoSelecionado.data_hora_int).toLocaleString('pt-PT') : '—'}</strong></div>
          </div>
        </div>

        <div className="doctor-subcard">
          <SectionHeader title="Prescrever medicação" subtitle="Medicação ativa e nova prescrição" />

          {/* Medicação ativa */}
          {medicacaoAtivaEnriquecida.length === 0 ? (
            <div className="doctor-empty-box" style={{ marginBottom: '1rem' }}>Sem medicação ativa registada.</div>
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
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulário de prescrição */}
          <div className="doctor-form-grid">
            <div className="doctor-form-grid__full">
              <label>Medicamento</label>
              <select className="doctor-field" name="codmedicamento" value={prescricao.codmedicamento} onChange={handlePrescricaoChange}>
                <option value="">Selecione...</option>
                {Array.isArray(medicamentos) && medicamentos.map((m, index) => {
                  const medId   = getMedicamentoId(m, index);
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
              <label>Dosagem</label>
              <input className="doctor-field" type="text" name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} />
            </div>
            <div className="doctor-form-grid__full">
              <label>Observações</label>
              <input className="doctor-field" type="text" name="observacoes" value={prescricao.observacoes} onChange={handlePrescricaoChange} />
            </div>
          </div>

          {/* Avaliação IA de alergias */}
          {alergias.length > 0 ? (
            <div className="doctor-risk-box" style={{ margin: '0.75rem 0' }}>
              {riscoIA && (
                <div
                  className={`doctor-risk-result ${riscoIA?.risco === 1 || riscoIA?.riscoalto ? 'is-danger' : 'is-safe'}`}
                  style={{ marginBottom: '0.75rem' }}
                >
                  <strong>
                    {riscoIA?.risco === 1 || riscoIA?.riscoalto
                      ? 'Utente com risco/alergia para a medicação selecionada'
                      : 'Sem alergia conhecida para a medicação selecionada'}
                  </strong>
                  <span>{riscoIA?.mensagem || riscoIA?.explicacao || 'Avaliação concluída.'}</span>
                </div>
              )}
              <button
                type="button"
                className="doctor-action-btn doctor-action-btn--secondary"
                onClick={avaliarRiscoIAFn}
                disabled={avaliacaoRisco || !prescricao.codmedicamento}
              >
                {avaliacaoRisco ? 'A avaliar...' : 'Ajuda IA: avaliar alergias e risco'}
              </button>
            </div>
          ) : (
            <div className="doctor-empty-box" style={{ margin: '0.75rem 0' }}>
              O utente não tem alergias registadas para validação automática.
            </div>
          )}

          <div className="doctor-actions-inline" style={{ marginTop: '0.5rem' }}>
            <button
              className="doctor-action-btn doctor-action-btn--primary"
              onClick={submeterPrescricao}
              disabled={!prescricao.codmedicamento || !prescricao.dosagem}
            >
              Prescrever
            </button>
          </div>
        </div>
      </div>

      {/* Alta de internamento — dentro do doctor-panel-card */}
      <div className="doctor-subcard" style={{ marginTop: '1rem' }}>
        <SectionHeader title="Registar alta de internamento" />
        <div className="doctor-form-grid">
          <div>
            <label>Tipo de Alta</label>
            {/* CORRIGIDO: Transferência removida — processo simplificado */}
            <select className="doctor-field" value={altaInternamento.tipo_alta} onChange={(e) => setAltaInternamento((p) => ({ ...p, tipo_alta: e.target.value }))}>
              <option value="clinica">Alta Clínica</option>
              <option value="voluntaria">Alta Voluntária</option>
              <option value="obito">Óbito</option>
            </select>
          </div>
          <div>
            <label>Observações</label>
            <input className="doctor-field" type="text" value={altaInternamento.observacoes} onChange={(e) => setAltaInternamento((p) => ({ ...p, observacoes: e.target.value }))} />
          </div>
        </div>
        <button className="doctor-action-btn doctor-action-btn--primary" onClick={submeterAltaInternamento}>Registar alta</button>
      </div>
    </div>
    );
  };

  // ── JSX principal ──────────────────────────────────────────

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
          <button type="button" className="doctor-layout-logout" onClick={() => navigate('/login')} title={isSidebarCollapsed ? 'Terminar sessão' : undefined}>
            <span className="doctor-layout-sidebar__icon"><IconExit /></span>
            {!isSidebarCollapsed && <span>Terminar sessão</span>}
          </button>
        </div>
      </aside>

      <div className="doctor-layout-main">
        <div className="doctor-layout-container">
          <div className="doctor-breadcrumbs">Início <span>›</span> {nomeHospital}</div>
          <div className="doctor-hero-card">
            <div>
              <h1 className="doctor-hero-card__title">
                {activeMenu === 'informacao_geral' ? 'Painel do Médico' : activeMenu === 'fila_triagens' ? 'Fila de Triagens' : 'Internamentos Ativos'}
              </h1>
              <p className="doctor-hero-card__subtitle">{textos?.doctor?.descricaoPainel || 'Prioridade, detalhe clínico completo, prescrição e decisão final.'}</p>
            </div>
            <button type="button" className="doctor-action-link" onClick={carregarTudo}>Atualizar</button>
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