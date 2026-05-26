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
const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

const getSafeOptionValue = (item, fallback) =>
  String(item?.cod_medicamento ?? item?.id ?? fallback);

const getSafeOptionLabel = (item, fallback) =>
  item?.nome || item?.nomemedicamento || fallback;

const SERVICOS = ['Cardiologia', 'Medicina', 'Ortopedia', 'Cirurgia'];
const MOTIVOS_INTERNAMENTO = [
  'Insuficiência cardíaca', 'Pneumonia', 'Fratura óssea', 'Pós-operatório', 'Monitorização clínica', 'AVC', 'Sépsis', 'Descompensação diabética', 'Dor torácica', 'Outro',
];
const TRIAGE_ORDER = { Vermelho: 1, Laranja: 2, Amarelo: 3, Verde: 4, Azul: 5 };
const TRIAGE_CLASS = {
  Vermelho: 'triage-badge triage-badge--vermelho',
  Laranja: 'triage-badge triage-badge--laranja',
  Amarelo: 'triage-badge triage-badge--amarelo',
  Verde: 'triage-badge triage-badge--verde',
  Azul: 'triage-badge triage-badge--azul',
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
const normalizar = (texto) => String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const getMedicamentoId = (m, index = 0) =>
  String(
    m?.codmedicamento ??
    m?.cod_medicamento ??
    m?.idmedicamento ??
    m?.id_medicamento ??
    m?.id ??
    `med-${index}`
  );

const getCodUtente = (obj) =>
  obj?.codutente ??
  obj?.cod_utente ??
  obj?.numutent ??
  obj?.num_utent ??
  obj?.utente_id ??
  null;

const getCodEpisodio = (obj) =>
  obj?.codepurgenc ??
  obj?.cod_ep_urgenc ??
  obj?.codepisodio ??
  obj?.cod_episodio ??
  null;



const getMedicamentoNome = (m, index = 0) => {
  if (!m) return `Medicamento ${String(index + 1).padStart(3, '0')}`;

  const nome =
    m?.nome ??
    m?.nome_medicamento ??
    m?.nomemedicamento ??
    m?.medicamento_nome ??
    m?.nomeMedicamento ??
    m?.designacao ??
    m?.designacao_comercial ??
    m?.descricao ??
    m?.medicamento ??
    m?.nomecomercial ??
    m?.principioativo ??
    m?.principio_ativo ??
    m?.farmaco ??
    m?.fármaco ??
    m?.denominacao ??
    '';

  return String(nome).trim() || `Medicamento ${String(index + 1).padStart(3, '0')}`;
};

const getUtenteIdAtual = () =>
  episodioSelecionado?.cod_utente ||
  episodioSelecionado?.codutente ||
  episodioSelecionado?.numutent ||
  internamentoSelecionado?.cod_utente ||
  internamentoSelecionado?.codutente ||
  internamentoSelecionado?.numutent ||
  utente?.cod_utente ||
  utente?.codutente ||
  utente?.numutent ||
  null;

const enriquecerMedicacaoAtiva = (lista = [], medicamentos = []) =>
  lista.map((item, index) => {
    const itemId = String(
      item?.codmedicamento ??
      item?.cod_medicamento ??
      item?.idmedicamento ??
      item?.id_medicamento ??
      item?.medicamento_id ??
      item?.id ??
      ''
    );

    const medicamentoCatalogo = medicamentos.find(
      (med) => String(getMedicamentoId(med)) === itemId
    );

    const nomeApresentacao =
      item?.nomeApresentacao ||
      item?.nome ||
      item?.nome_medicamento ||
      item?.nomemedicamento ||
      item?.medicamento_nome ||
      item?.nomeMedicamento ||
      item?.designacao ||
      item?.designacao_comercial ||
      item?.descricao ||
      item?.medicamento ||
      item?.nomecomercial ||
      item?.principioativo ||
      item?.principio_ativo ||
      medicamentoCatalogo?.nome ||
      medicamentoCatalogo?.nome_medicamento ||
      medicamentoCatalogo?.nomemedicamento ||
      medicamentoCatalogo?.medicamento_nome ||
      medicamentoCatalogo?.designacao ||
      medicamentoCatalogo?.designacao_comercial ||
      medicamentoCatalogo?.descricao ||
      medicamentoCatalogo?.principioativo ||
      medicamentoCatalogo?.principio_ativo ||
      getMedicamentoNome(medicamentoCatalogo, index);

    return {
      ...item,
      nomeApresentacao,
    };
  });





const carregarMedicacaoAtiva = async (numUtente) => {
  if (!numUtente) {
    setMedicacaoAtiva([]);
    return;
  }

  try {
    const r = await fetch(
      `${API_URL}/medicacao-ativa/utente/${numUtente}`,
      {
        headers: headers(),
      }
    );

    if (!r.ok) {
      console.error('Erro carregarMedicacaoAtiva:', r.status);
      setMedicacaoAtiva([]);
      return;
    }

    const data = await r.json();
    console.log('RES medicacaoAtiva bruto', data);

    const lista = Array.isArray(data) ? data : [];
    const listaEnriquecida = enriquecerMedicacaoAtiva(lista, medicamentos);

    setMedicacaoAtiva(listaEnriquecida);
  } catch (e) {
    console.error(e);
    setMedicacaoAtiva([]);
  }
};

const carregarAlergias = async (numUtente) => {
  if (!numUtente) {
    setAlergias([]);
    return;
  }

  try {
    const r = await fetch(`${API_URL}/alergias/utente/${numUtente}`, {
      headers: headers(),
    });

    if (!r.ok) {
      console.error('Erro carregarAlergias:', r.status);
      setAlergias([]);
      return;
    }

    const data = await r.json();
    console.log('RES alergias bruto', data);
    setAlergias(Array.isArray(data) ? data : []);
  } catch (e) {
    console.error(e);
    setAlergias([]);
  }
};

const carregarAntecedentes = async (numUtente) => {
  if (!numUtente) {
    setAntecedentes(null);
    return;
  }

  try {
    const r = await fetch(`${API_URL}/utente-antecedentes/utente/${numUtente}`, {
      headers: headers(),
    });

    if (!r.ok) {
      console.error('Erro carregarAntecedentes:', r.status);
      setAntecedentes(null);
      return;
    }

    const data = await r.json();
    console.log('RES antecedentes bruto', data);
    setAntecedentes(data);
  } catch (e) {
    console.error(e);
    setAntecedentes(null);
  }
};

const carregarAtos = async (codEpisodio) => {
  if (!codEpisodio) {
    setAtos([]);
    atosRef.current = [];
    return;
  }

  try {
    const r = await fetch(`${API_URL}/atos/episodio/${codEpisodio}`, {
      headers: headers(),
    });

    if (!r.ok) {
      console.error('Erro carregarAtos:', r.status);
      setAtos([]);
      atosRef.current = [];
      return;
    }

    const data = await r.json();
    const lista = Array.isArray(data) ? data : [];
    setAtos(lista);
    atosRef.current = lista;
  } catch (e) {
    console.error(e);
    setAtos([]);
    atosRef.current = [];
  }
};

const carregarEpisodios = async () => {
  const hospitalId =
    utilizadorLogado?.hospitais?.[0]?.idhosp ||
    utilizadorLogado?.hospitais?.[0]?.id_hosp;

  if (!hospitalId) {
    console.error("Hospital ID não encontrado.");
    setEpisodios([]);
    return;
  }

  try {
    const r = await fetch(`${API_URL}/episodios/hospital/${hospitalId}`, {
      headers: headers(),
    });

    if (!r.ok) {
      console.error("Erro carregarEpisodios:", r.status);
      setEpisodios([]);
      return;
    }

    const data = await r.json();
    const listaBase = Array.isArray(data) ? data : [];

    const episodiosComTriagem = await Promise.all(
      listaBase.map(async (ep) => {
        try {
          const codEp =
            ep.cod_ep_urgenc ||
            ep.codepurgenc ||
            ep.codEpisodio ||
            ep.codepisodio;

          if (!codEp) return ep;

          const rTriagem = await fetch(`${API_URL}/triagens/${codEp}`, {
            headers: headers(),
          });

          if (!rTriagem.ok) return ep;

          const triagem = await rTriagem.json();

          return {
            ...ep,
            cortriagem:
              triagem?.cortriagem ||
              triagem?.cor_triagem ||
              ep?.cortriagem ||
              ep?.cor_triagem ||
              "",
            tempoesperaprevisto:
              triagem?.tempoesperaprevisto ||
              triagem?.tempo_espera_previsto ||
              ep?.tempoesperaprevisto ||
              ep?.tempo_espera_previsto ||
              "",
          };
        } catch (e) {
          console.error("Erro a carregar triagem do episódio:", ep, e);
          return ep;
        }
      })
    );

    console.log("EPISODIOS COM TRIAGEM:", episodiosComTriagem);
    setEpisodios(episodiosComTriagem);
  } catch (e) {
    console.error(e);
    setEpisodios([]);
  }
};

const abrirEpisodio = async (ep) => {



  if (!ep) {
    mostrarToast('Episódio inválido.', 'error');
    return;
  }

  const codEpisodio = getCodEpisodio(ep);
  const numUtente = getCodUtente(ep);

  // muda estado para em consulta
  if (ep?.estado === 'em_atendimento') {

    await fetch(`${API_URL}/episodios/${codEpisodio}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({
        estado: 'em_consulta',
      }),
    });

  }

  console.log('EPISODIO:', ep);

  console.log('COD EPISODIO:', codEpisodio);

  console.log(
    'URL TRIAGEM:',
    `${API_URL}/triagens/${codEpisodio}`
  );

  const resMedicacaoAtiva = await fetch(
    `${API_URL}/medicacao-ativa/utente/${numUtente}`,
    {
      headers: headers(),
    }
  );

  const dataMedicacaoAtiva = await resMedicacaoAtiva.json();

  setMedicacaoAtiva(
    Array.isArray(dataMedicacaoAtiva)
      ? dataMedicacaoAtiva
      : []
  );

  if (!numUtente) {
    mostrarToast('Utente do episódio não encontrado.', 'error');
    return;
  }

  if (!codEpisodio) {
    mostrarToast('Código do episódio não encontrado.', 'error');
    return;
  }

  setEpisodioSelecionado(ep);

  setTabAtendimento('prescricao');

  setRiscoIA(null);



  try {

    const [
      rUtente,
      rTriagem,
      rAlertas,
      rMedicacao,
      rAtos,
      rAlergias
    ] = await Promise.all([

      fetch(`${API_URL}/utentes/${numUtente}`, {
        headers: headers()
      }),

      fetch(`${API_URL}/triagens/${codEpisodio}`, {
        headers: headers()
      }),

      fetch(`${API_URL}/alertas/utente/${numUtente}`, {
        headers: headers()
      }),

      fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, {
        headers: headers()
      }),

      fetch(`${API_URL}/atos/episodio/${codEpisodio}`, {
        headers: headers()
      }),

      fetch(`${API_URL}/alergias/utente/${numUtente}`, {
        headers: headers()
      }),

    ]);

    if (rUtente.ok) {
      setUtente(await rUtente.json());
    } else {
      setUtente(null);
    }

    if (rTriagem.ok) {
      const triagem = await rTriagem.json();

      console.log("TRIAGEM:", triagem);
      console.log("TRIAGEM RAW KEYS:", Object.keys(triagem));
      console.log("TRIAGEM TEMPO CANDIDATOS:", {
        tempo_espera_previsto: triagem?.tempo_espera_previsto,
        tempoesperaprevisto: triagem?.tempoesperaprevisto,
        tempo_medio_espera: triagem?.tempo_medio_espera,
        tempoespera: triagem?.tempoespera,
        tempo_espera: triagem?.tempo_espera,
      });

      setDadosTriagem({
        ...triagem,
        cortriagem:
          triagem?.cortriagem ??
          triagem?.cor_triagem ??
          "",
        tempoesperaprevisto:
          triagem?.tempoesperaprevisto ??
          triagem?.tempo_espera_previsto ??
          triagem?.tempo_medio_espera ??
          triagem?.tempoespera ??
          triagem?.tempo_espera ??
          "",
        freqcard:
          triagem?.freqcard ??
          triagem?.freq_card ??
          "",
        freqresp:
          triagem?.freqresp ??
          triagem?.freq_resp ??
          "",
        spo2:
          triagem?.spo2 ??
          triagem?.sp_o2 ??
          "",
        niveldor:
          triagem?.niveldor ??
          triagem?.nivel_dor ??
          "",
        nomeenfermeiro:
          triagem?.nomeenfermeiro ??
          triagem?.nome_enfermeiro ??
          "",
        datahorainicio:
          triagem?.datahorainicio ??
          triagem?.data_hora_inicio ??
          "",
        datahorafim:
          triagem?.datahorafim ??
          triagem?.data_hora_fim ??
          "",
      });
    } else if (rTriagem.status === 404) {
      console.log("Triagem ainda não criada.");

      setDadosTriagem({
        cortriagem: "—",
        temperatura: "—",
        freqcard: "—",
        freqresp: "—",
        spo2: "—",
        sistolica: "—",
        diastolica: "—",
        niveldor: "—",
        consciencia: "—",
        sintomas: "Sem triagem registada.",
        tempoesperaprevisto: "—",
        nomeenfermeiro: "—",
        datahorainicio: "—",
        datahorafim: "—",
      });
    } else {
      console.log("ERRO TRIAGEM:", rTriagem.status);
      setDadosTriagem(null);
    }

    if (rAlertas.ok) {

      const a = await rAlertas.json();

      setAlertas(Array.isArray(a) ? a : []);

    } else {

      setAlertas([]);

    }

    if (rMedicacao.ok) {

      const m = await rMedicacao.json();

      setMedicacaoAtiva(Array.isArray(m) ? m : []);

    } else {

      setMedicacaoAtiva([]);

    }

    if (rAtos.ok) {

      const listaAtos = await rAtos.json();

      const finalAtos = Array.isArray(listaAtos)
        ? listaAtos
        : [];

      setAtos(finalAtos);

      atosRef.current = finalAtos;

    } else {

      setAtos([]);

      atosRef.current = [];

    }

    if (rAlergias.ok) {

      const al = await rAlergias.json();

      setAlergias(Array.isArray(al) ? al : []);

    } else {

      setAlergias([]);

    }

    await carregarMedicamentos();

  } catch (e) {

    console.error(e);

    mostrarToast(
      'Erro ao abrir o episódio.',
      'error'
    );

  }

};

function SectionHeader({ title, subtitle }) {
  return (
    <div className="doctor-section-header">
      <h2 className="doctor-section-header__title">{title}</h2>
      {subtitle ? <p className="doctor-section-header__subtitle">{subtitle}</p> : null}
    </div>
  );
}



const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 2,
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

const SvgExit = () => (
  <svg {...iconProps}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const SvgInfo = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
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

const IconMenu = SvgMenu;
const IconChart = SvgInfo;
const IconQueue = SvgList;
const IconClipboard = SvgClipboard;
const IconExit = SvgExit;
const IconBed = SvgFileText;


export default function DoctorDashboard() {

  const navigate = useNavigate();
  const { textos } = useLanguage();
  const { toast, mostrarToast, fecharToast } = useToast();

  const [medicamentos, setMedicamentos] = useState([]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('informacao_geral');
  const [subMenuFila, setSubMenuFila] = useState('em_espera');

  const [episodios, setEpisodios] = useState([]);
  const [episodiosEstado, setEpisodiosEstado] = useState({});
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);

  const [filtro, setFiltro] = useState('');

  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [antecedentes, setAntecedentes] = useState(null);
  const [dadosTriagem, setDadosTriagem] = useState(null);

  const [prescricaoImpressao, setPrescricaoImpressao] = useState(null);

  const [tabAtendimento, setTabAtendimento] = useState('vitais');

  const [internamentos, setInternamentos] = useState([]);
  const [internamentoSelecionado, setInternamentoSelecionado] = useState(null);

  const [altaInternamento, setAltaInternamento] = useState({
    tipo_alta: 'clinica',
    observacoes: '',
  });


  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [modoEdicaoTriagem, setModoEdicaoTriagem] = useState(false);
  const [formTriagem, setFormTriagem] = useState({
    cortriagem: "",
    tempoesperaprevisto: "",
    temperatura: "",
    freqcard: "",
    freqresp: "",
    spo2: "",
    sistolica: "",
    diastolica: "",
    niveldor: "",
    consciencia: "",
    sintomas: "",
    nomeenfermeiro: "",
  });

  const [prescricao, setPrescricao] = useState({
    codmedicamento: "",
    dosagem: "",
    frequencia: "",
    observacoes: "",
  });

  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—',
    laranja: '—',
    amarelo: '—',
    verde: '—',
    azul: '—',
  });



  const [alergias, setAlergias] = useState([]);
  const [atos, setAtos] = useState([]);

  const atosRef = useRef([]);

  const [riscoIA, setRiscoIA] = useState(null);
  const [avaliacaoRisco, setAvaliacaoRisco] = useState(false);

  const [alta, setAlta] = useState({
    destino: 'alta',
    observacoes: '',
    servico: '',
    numero_cama: '',
    motivo_int: '',
    motivo_int_outro: '',
  });

  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const getField = (obj, ...keys) => {

    for (const key of keys) {

      const value = obj?.[key];

      if (value !== undefined && value !== null) {
        return value;
      }
    }

    return '—';
  };


  const nomeUtilizador =
    utilizadorLogado?.nome ||
    utilizadorLogado?.name ||
    utilizadorLogado?.username ||
    'Utilizador';

  const nomeHospital =
    utilizadorLogado?.hospitais?.[0]?.nome ||
    'Hospital de Santa Maria';

  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  const token = () => sessionStorage.getItem('token');

  const headers = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token()}`,
  });

  useEffect(() => {
    carregarTudo();
  }, []);



  const carregarTudo = () => {
    carregarEpisodios();
    carregarTemposMedios();
    carregarInternamentos();
    carregarMedicamentos();
  };

  const submeterPrescricao = async () => {
    try {
      const codEpisodio =
        episodioSelecionado?.cod_ep_urgenc || episodioSelecionado?.codepurgenc;

      if (!codEpisodio) {
        mostrarToast('Episódio inválido.', 'error');
        return;
      }

      const atoSelecionado = atos?.[0];
      const idAto = atoSelecionado?.id_ato || atoSelecionado?.idato;

      if (!idAto) {
        mostrarToast('Não existe ato clínico associado ao episódio.', 'error');
        return;
      }

      const body = {
        id_ato: Number(idAto),
        cod_medicamento: Number(prescricao?.codmedicamento),
        dosagem: prescricao?.dosagem,
        frequencia: prescricao?.frequencia,
        observacoes: prescricao?.observacoes,
      };

      console.log('BODY PRESCRICAO:', body);

      const r = await fetch(`${API_URL}/prescricoes/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(body),
      });

      const responseText = await r.text();
      console.log('RES POST /prescricoes status:', r.status);
      console.log('RES POST /prescricoes body:', responseText);

      if (r.ok) {
        const created = responseText ? JSON.parse(responseText) : null;

        const medicamentoSelecionado = medicamentos.find(
          (m) => String(getMedicamentoId(m)) === String(prescricao?.codmedicamento)
        );

        const medicamentoSelecionadoAtivo = medicacaoAtiva.find(
          (m) =>
            String(
              m?.codmedicamento ??
              m?.cod_medicamento ??
              m?.idmedicamento ??
              m?.id_medicamento ??
              m?.id
            ) === String(prescricao?.codmedicamento)
        );

        const nomeMedicamento =
          medicamentoSelecionadoAtivo?.nomeApresentacao ||
          medicamentoSelecionadoAtivo?.nome ||
          medicamentoSelecionadoAtivo?.nomemedicamento ||
          medicamentoSelecionadoAtivo?.nome_medicamento ||
          medicamentoSelecionadoAtivo?.medicamento ||
          medicamentoSelecionado?.nome ||
          medicamentoSelecionado?.nomemedicamento ||
          medicamentoSelecionado?.nome_medicamento ||
          medicamentoSelecionado?.designacao ||
          medicamentoSelecionado?.descricao ||
          getMedicamentoNome(medicamentoSelecionadoAtivo || medicamentoSelecionado) ||
          '—';

        const novaMedicacao = {
          id: created?.id_prescricao ?? `tmp-${Date.now()}`,
          id_prescricao: created?.id_prescricao ?? null,
          id_ato: created?.id_ato ?? Number(idAto),
          codmedicamento:
            created?.cod_medicamento ?? Number(prescricao?.codmedicamento),
          cod_medicamento:
            created?.cod_medicamento ?? Number(prescricao?.codmedicamento),
          dosagem: created?.dosagem ?? prescricao?.dosagem,
          frequencia: created?.frequencia ?? prescricao?.frequencia,
          observacoes: created?.observacoes ?? prescricao?.observacoes,
          estado_prescricao: created?.estado_prescricao ?? 'pendente',
          nomeApresentacao: nomeMedicamento,
        };

        const dadosParaImpressao = {
          codmedicamento:
            created?.cod_medicamento ?? Number(prescricao?.codmedicamento),
          nomeApresentacao: nomeMedicamento,
          dosagem: created?.dosagem ?? prescricao?.dosagem,
          frequencia: created?.frequencia ?? prescricao?.frequencia,
          observacoes: created?.observacoes ?? prescricao?.observacoes,
          numeroUtente:
            utente?.num_utente ||
            utente?.numutente ||
            utente?.numutent ||
            utente?.codutente ||
            utente?.cod_utente ||
            episodioSelecionado?.num_utente ||
            episodioSelecionado?.numutente ||
            episodioSelecionado?.numutent ||
            episodioSelecionado?.codutente ||
            episodioSelecionado?.cod_utente ||
            '—',
        };

        setPrescricaoImpressao(dadosParaImpressao);
        setMedicacaoAtiva((prev) => [novaMedicacao, ...prev]);
        mostrarToast('Prescrição registada.', 'success');

        setPrescricao({
          codmedicamento: '',
          dosagem: '',
          frequencia: '',
          observacoes: '',
        });

        setRiscoIA(null);
        setTabAtendimento('prescricao');
      } else {
        mostrarToast(`Erro ao prescrever (${r.status}).`, 'error');
      }
    } catch (e) {
      console.error('ERRO submeterPrescricao:', e);
      mostrarToast('Erro ao prescrever.', 'error');
    }
  };


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

      const r = await fetch(
        `${API_URL}/episodios/hospital/${hospitalId}`,
        {
          headers: headers(),
        }
      );

      if (r.ok) {

        const data = await r.json();
        console.log("EPISODIOS:", data);

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


  const prepararImpressaoPrescricao = (med) => {
    const medicamentoCatalogo = medicamentos.find(
      (m) => String(getMedicamentoId(m)) === String(
        med?.codmedicamento ?? med?.cod_medicamento ?? med?.idmedicamento ?? med?.id_medicamento ?? med?.id
      )
    );

    setPrescricaoImpressao({
      codmedicamento:
        med?.codmedicamento ??
        med?.cod_medicamento ??
        med?.idmedicamento ??
        med?.id_medicamento ??
        med?.id ??
        null,
      nomeApresentacao:
        med?.nomeApresentacao ||
        med?.nome ||
        med?.nomemedicamento ||
        med?.nome_medicamento ||
        med?.medicamento ||
        medicamentoCatalogo?.nome ||
        medicamentoCatalogo?.nomemedicamento ||
        medicamentoCatalogo?.designacao ||
        medicamentoCatalogo?.descricao ||
        '',
      dosagem: med?.dosagem || '',
      frequencia: med?.frequencia || '',
      observacoes: med?.observacoes || '',
      numeroUtente:
        utente?.num_utente ||
        utente?.numutente ||
        utente?.numutent ||
        utente?.codutente ||
        utente?.cod_utente ||
        episodioSelecionado?.num_utente ||
        episodioSelecionado?.numutente ||
        episodioSelecionado?.numutent ||
        episodioSelecionado?.codutente ||
        episodioSelecionado?.cod_utente ||
        '—',
    });
  };

  const carregarTemposMedios = async () => {

    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) return;

    try {

      const r = await fetch(
        `${API_URL}/predict/tempos-espera/${hospitalId}`,
        {
          headers: headers(),
        }
      );

      if (r.ok) {

        const data = await r.json();

        const tempos = data?.tempos_espera || data || {};

        setTemposMediosHospital({
          vermelho: tempos?.vermelho?.minutos != null
            ? `${tempos.vermelho.minutos} min`
            : '—',

          laranja: tempos?.laranja?.minutos != null
            ? `${tempos.laranja.minutos} min`
            : '—',

          amarelo: tempos?.amarelo?.minutos != null
            ? `${tempos.amarelo.minutos} min`
            : '—',

          verde: tempos?.verde?.minutos != null
            ? `${tempos.verde.minutos} min`
            : '—',

          azul: tempos?.azul?.minutos != null
            ? `${tempos.azul.minutos} min`
            : '—',
        });

      }

    } catch (e) {

      console.error(e);

    }
  };

  const carregarInternamentos = async () => {

    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) {
      setInternamentos([]);
      return;
    }

    try {

      const r = await fetch(
        `${API_URL}/internamentos/hospital/${hospitalId}`,
        {
          headers: headers(),
        }
      );

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

      const r = await fetch(
        `${API_URL}/medicamentos/`,
        {
          headers: headers(),
        }
      );

      if (r.ok) {

        const data = await r.json();

        console.log('RES medicamentos bruto', data);

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

  const abrirEpisodio = async (ep) => {

    if (!ep) {
      mostrarToast('Episódio inválido.', 'error');
      return;
    }

    const numUtente = getCodUtente(ep);
    const codEpisodio = getCodEpisodio(ep);

    if (!numUtente || !codEpisodio) {
      mostrarToast('Dados do episódio inválidos.', 'error');
      return;
    }

    setEpisodioSelecionado(ep);

    setSubMenuFila('atendimento');

    setTabAtendimento('vitais');

    setRiscoIA(null);



    try {

      const [
        rUtente,
        rTriagem,
        rAlertas,
        rMedicacao,
        rAtos,
        rAlergias,
      ] = await Promise.all([
        fetch(`${API_URL}/utentes/${numUtente}`, {
          headers: headers(),
        }),

        fetch(`${API_URL}/triagens/${codEpisodio}`, {
          headers: headers(),
        }),

        fetch(`${API_URL}/alertas/utente/${numUtente}`, {
          headers: headers(),
        }),

        fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, {
          headers: headers(),
        }),

        fetch(`${API_URL}/atos/episodio/${codEpisodio}`, {
          headers: headers(),
        }),

        fetch(`${API_URL}/alergias/utente/${numUtente}`, {
          headers: headers(),
        }),
      ]);

      if (rUtente.ok) {

        const dataUtente = await rUtente.json();

        console.log('UTENTE:', dataUtente);

        setUtente(dataUtente);

      } else {

        setUtente(null);

      }

      if (rTriagem.ok) {

        const triagem = await rTriagem.json();

        console.log('TRIAGEM:', triagem);

        setDadosTriagem(triagem);

      } else {

        console.warn('Triagem não encontrada');

        setDadosTriagem(null);

      }

      if (rAlertas.ok) {

        const a = await rAlertas.json();

        setAlertas(Array.isArray(a) ? a : []);

      } else {

        setAlertas([]);

      }

      if (rMedicacao.ok) {

        const m = await rMedicacao.json();

        setMedicacaoAtiva(Array.isArray(m) ? m : []);

      } else {

        setMedicacaoAtiva([]);

      }

      if (rAtos.ok) {

        const listaAtos = await rAtos.json();

        const finalAtos = Array.isArray(listaAtos)
          ? listaAtos
          : [];

        setAtos(finalAtos);

        atosRef.current = finalAtos;

      } else {

        setAtos([]);
        atosRef.current = [];

      }

      if (rAlergias.ok) {

        const al = await rAlergias.json();

        setAlergias(Array.isArray(al) ? al : []);

      } else {

        setAlergias([]);

      }

    } catch (e) {

      console.error(e);

      mostrarToast(
        'Erro ao abrir episódio.',
        'error'
      );
    }
  };

  const episodiosEmEspera = episodios.filter(
    (ep) =>
      ep.estado === 'em_atendimento'
  );

  const episodiosAtendimento = episodios.filter(
    (ep) =>
      ep.estado === 'em_consulta'
  );

  const episodiosConcluidos = episodios.filter(
    (ep) =>
      ep.estado === 'concluido'
  );

  const episodiosOrdenados = useMemo(() => {

    return [...episodios]

      .filter((ep) => {

        const estado =
          ep.estado ||
          ep.estado_local ||
          ep.estado_episodio;

        const corTriagem =
          ep.cor_triagem ||
          ep.cortriagem;

        // apenas episódios ativos
        if (estado === 'concluido') {
          return false;
        }

        // apenas episódios já triados
        if (!corTriagem) {
          return false;
        }

        if (!filtro) {
          return true;
        }

        const f = normalizar(filtro);

        return (
          normalizar(
            ep.nome_utente || ''
          ).includes(f)

          ||

          normalizar(
            corTriagem || ''
          ).includes(f)
        );
      })

      .sort((a, b) => {

        const corA =
          a.cor_triagem ||
          a.cortriagem;

        const corB =
          b.cor_triagem ||
          b.cortriagem;

        return (
          (TRIAGE_ORDER[corA] || 9)
          -
          (TRIAGE_ORDER[corB] || 9)
        );
      });

  }, [episodios, filtro]);

  const totalEmEspera = episodios.length;
  const altasHoje = 0;
  const totalInternamentos = internamentos.length;

  const menus = [
    {
      id: 'informacao_geral',
      label: 'Informação Geral',
      icon: <IconChart />,
    },
    {
      id: 'fila_triagens',
      label: 'Fila de Triagens',
      icon: <IconQueue />,
    },
    {
      id: 'internamentos',
      label: 'Internamentos Ativos',
      icon: <IconBed />,
    },
  ];
  const submeterAlta = async () => {

    try {

      const cod =
        episodioSelecionado?.cod_ep_urgenc ||
        episodioSelecionado?.codepurgenc;

      if (!cod) {

        mostrarToast(
          'Episódio inválido.',
          'error'
        );

        return;
      }

      const body = {
        ...episodioSelecionado,

        estado: 'concluido',

        data_alta: new Date().toISOString(),
      };

      const r = await fetch(
        `${API_URL}/episodios/${cod}`,
        {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify(body),
        }
      );

      if (r.ok) {

        setEpisodios((prev) =>
          prev.map((e) => {

            const eCod =
              e.cod_ep_urgenc ||
              e.codepurgenc;

            if (eCod === cod) {

              return {
                ...e,
                estado_local: 'concluido',
                data_alta: new Date().toISOString(),
              };
            }

            return e;
          })
        );

        mostrarToast(
          'Alta registada.',
          'success'
        );

        setSubMenuFila('concluidos');

        setTabAtendimento('vitais');

      } else {

        mostrarToast(
          'Erro ao registar alta.',
          'error'
        );
      }

    } catch (e) {

      console.error(e);

      mostrarToast(
        'Erro ao registar alta.',
        'error'
      );
    }
  };
  const submeterAltaRapida = async (ep) => {

    try {

      const cod =
        ep.cod_ep_urgenc || ep.codepurgenc;

      const r = await fetch(
        `${API_URL}/episodios/${cod}`,
        {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify({
            ...ep,
            estado: 'concluido',
            data_alta: new Date().toISOString(),
          }),
        }
      );

      if (r.ok) {

        setEpisodios((prev) =>
          prev.map((e) => {

            const eCod =
              e.cod_ep_urgenc || e.codepurgenc;

            if (eCod === cod) {
              return {
                ...e,
                estado_local: 'concluido',
                data_alta: new Date().toISOString(),
              };
            }

            return e;
          })
        );

        mostrarToast('Alta registada.', 'success');

      } else {

        mostrarToast('Erro ao registar alta.', 'error');
      }

    } catch {

      mostrarToast('Erro ao registar alta.', 'error');
    }
  };

  const renderFilaTriagens = () => {

    if (subMenuFila === 'atendimento' && episodioSelecionado) {
      return renderAtendimento();
    }

    const episodiosFiltrados = episodios.filter((ep) => {

      const estado =
        ep.estado ||
        ep.estado_local ||
        ep.estado_episodio;

      if (subMenuFila === 'em_espera') {
        return estado !== 'concluido';
      }

      if (subMenuFila === 'concluidos') {
        return estado === 'concluido';
      }

      return true;
    });

    return (
      <DoctorQueue
        episodios={episodios}
        episodiosOrdenados={episodios}
        setEpisodios={setEpisodios}
        subMenuFila={subMenuFila}
        setSubMenuFila={setSubMenuFila}
        filtro={filtro}
        setFiltro={setFiltro}
        abrirEpisodio={abrirEpisodio}
        TRIAGECLASS={TRIAGE_CLASS}
        episodioSelecionado={episodioSelecionado}
        setEpisodioSelecionado={setEpisodioSelecionado}
      />
    );
  };

  const renderInformacaoGeral = () => (
    <div className="doctor-panel-card">
      <SectionHeader
        title="Informação Geral"
        subtitle="Resumo clínico e tempos de espera por prioridade"
      />

      <div className="doctor-kpi-grid">
        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--blue">📋</div>
          <div>
            <div className="doctor-kpi-card__label">Episódios em espera</div>
            <div className="doctor-kpi-card__value">{totalEmEspera}</div>
          </div>
        </div>

        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--green">✓</div>
          <div>
            <div className="doctor-kpi-card__label">Altas hoje</div>
            <div className="doctor-kpi-card__value">{altasHoje}</div>
          </div>
        </div>

        <div className="doctor-kpi-card">
          <div className="doctor-kpi-card__icon doctor-kpi-card__icon--purple">🏥</div>
          <div>
            <div className="doctor-kpi-card__label">Internamentos ativos</div>
            <div className="doctor-kpi-card__value">{totalInternamentos}</div>
          </div>
        </div>
      </div>

      <div className="doctor-triage-times-card">
        <h3 className="doctor-card-title">Tempo de Espera por Cor de Triagem</h3>
        <p className="doctor-card-subtitle">
          Distribuição atual do tempo médio no hospital
        </p>

        <div className="doctor-triage-times-grid">
          {[
            ['vermelho', 'Vermelho'],
            ['laranja', 'Laranja'],
            ['amarelo', 'Amarelo'],
            ['verde', 'Verde'],
            ['azul', 'Azul'],
          ].map(([key, label]) => (
            <div key={key} className="doctor-triage-time-item">
              <span className={`doctor-triage-time-dot doctor-triage-time-dot--${key}`} />
              <span className="doctor-triage-time-label">{label}</span>
              <span className="doctor-triage-time-value">
                {temposMediosHospital[key] ?? '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const guardarEdicaoTriagem = async () => {
    try {
      const codEpisodio = getCodEpisodio(episodioSelecionado);

      if (!codEpisodio) {
        mostrarToast("Código do episódio não encontrado.", "error");
        return;
      }

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
        method: "PUT",
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro ao guardar triagem: ${response.status}`);
      }

      const triagemAtualizada = await response.json();

      setDadosTriagem((prev) => ({
        ...(prev || {}),
        ...triagemAtualizada,
        temperatura:
          triagemAtualizada?.temperatura ??
          formTriagem.temperatura ??
          prev?.temperatura ??
          "",
        freqcard:
          triagemAtualizada?.freqcard ??
          triagemAtualizada?.freq_card ??
          formTriagem.freqcard ??
          prev?.freqcard ??
          prev?.freq_card ??
          "",
        freqresp:
          triagemAtualizada?.freqresp ??
          triagemAtualizada?.freq_resp ??
          formTriagem.freqresp ??
          prev?.freqresp ??
          prev?.freq_resp ??
          "",
        spo2:
          triagemAtualizada?.spo2 ??
          triagemAtualizada?.sp_o2 ??
          formTriagem.spo2 ??
          prev?.spo2 ??
          prev?.sp_o2 ??
          "",
        sistolica:
          triagemAtualizada?.sistolica ??
          formTriagem.sistolica ??
          prev?.sistolica ??
          "",
        diastolica:
          triagemAtualizada?.diastolica ??
          formTriagem.diastolica ??
          prev?.diastolica ??
          "",
        sintomas:
          triagemAtualizada?.sintomas ??
          formTriagem.sintomas ??
          prev?.sintomas ??
          "",
      }));

      setModoEdicaoTriagem(false);
      mostrarToast("Triagem atualizada com sucesso.", "success");
    } catch (error) {
      console.error(error);
      mostrarToast("Erro ao guardar edição da triagem.", "error");
    }
  };

  const renderTabVitais = () => {
    const tempoEsperaTriagem = getField(
      dadosTriagem,
      "tempo_espera_previsto",
      "tempoesperaprevisto",
      "tempoEsperaPrevisto"
    );

    const inicioTriagem = getField(
      dadosTriagem,
      "data_hora_inicio",
      "datahorainicio"
    );

    const corTriagem = getField(
      dadosTriagem,
      "cor_triagem",
      "cortriagem"
    );

    return (
      <div className="doctor-stacked-sections">
        <section className="doctor-medical-card">
          <div className="doctor-medical-card__header">
            <div>
              <h3>Dados do Utente</h3>
              <p>Informação principal do episódio</p>
            </div>
          </div>

          <div className="doctor-patient-grid">
            <div className="doctor-patient-item">
              <span>Nome</span>
              <strong>{utente?.nome || episodioSelecionado?.nome_utente || "—"}</strong>
            </div>

            <div className="doctor-patient-item">
              <span>Nº Utente</span>
              <strong>
                {getField(utente, "num_utent", "numutente", "numutent")}
              </strong>
            </div>

            <div className="doctor-patient-item">
              <span>Sexo</span>
              <strong>{utente?.sexo || "—"}</strong>
            </div>

            <div className="doctor-patient-item">
              <span>Data Nascimento</span>
              <strong>
                {utente?.data_nasc
                  ? new Date(utente.data_nasc).toLocaleDateString("pt-PT")
                  : "—"}
              </strong>
            </div>

            <div className="doctor-patient-item">
              <span>Telefone</span>
              <strong>{utente?.telefone || "—"}</strong>
            </div>

            <div className="doctor-patient-item">
              <span>Email</span>
              <strong>{utente?.email || "—"}</strong>
            </div>

            <div className="doctor-patient-item">
              <span>Morada</span>
              <strong>{utente?.localidade || "—"}</strong>
            </div>

            <div className="doctor-patient-item">
              <span>NIF</span>
              <strong>{utente?.nif || "—"}</strong>
            </div>
          </div>
        </section>

        <section className="doctor-medical-card">
          <div className="doctor-medical-card__header">
            <div>
              <h3>Triagem</h3>
              <p>Dados clínicos iniciais do episódio</p>
            </div>

            {!modoEdicaoTriagem ? (
              <button
                type="button"
                className="doctor-outline-btn"
                onClick={() => {
                  setFormTriagem({
                    temperatura:
                      getField(dadosTriagem, "temperatura") === "—"
                        ? ""
                        : getField(dadosTriagem, "temperatura"),
                    freqcard:
                      getField(dadosTriagem, "freq_card", "freqcard") === "—"
                        ? ""
                        : getField(dadosTriagem, "freq_card", "freqcard"),
                    freqresp:
                      getField(dadosTriagem, "freq_resp", "freqresp") === "—"
                        ? ""
                        : getField(dadosTriagem, "freq_resp", "freqresp"),
                    spo2:
                      getField(dadosTriagem, "sp_o2", "spo2") === "—"
                        ? ""
                        : getField(dadosTriagem, "sp_o2", "spo2"),
                    sistolica:
                      getField(dadosTriagem, "sistolica") === "—"
                        ? ""
                        : getField(dadosTriagem, "sistolica"),
                    diastolica:
                      getField(dadosTriagem, "diastolica") === "—"
                        ? ""
                        : getField(dadosTriagem, "diastolica"),
                    sintomas:
                      getField(dadosTriagem, "sintomas") === "—"
                        ? ""
                        : getField(dadosTriagem, "sintomas"),
                  });
                  setModoEdicaoTriagem(true);
                }}
              >
                Editar
              </button>
            ) : (
              <div className="doctor-actions-inline">
                <button
                  type="button"
                  className="doctor-action-btn doctor-action-btn--secondary"
                  onClick={() => setModoEdicaoTriagem(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="doctor-action-btn doctor-action-btn--primary"
                  onClick={guardarEdicaoTriagem}
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          <div className="doctor-triage-banner">
            <div className="doctor-triage-banner__priority">
              <span>Prioridade</span>
              <div className={TRIAGE_CLASS[corTriagem] || "triage-badge"}>
                {corTriagem}
              </div>
            </div>

            <div className="doctor-triage-banner__info">
              <span>Tempo Espera</span>
              <strong>
                {tempoEsperaTriagem !== "—" &&
                  tempoEsperaTriagem !== "" &&
                  tempoEsperaTriagem !== null &&
                  tempoEsperaTriagem !== undefined
                  ? `${tempoEsperaTriagem} min`
                  : "—"}
              </strong>
            </div>

            <div className="doctor-triage-banner__info">
              <span>Início</span>
              <strong>
                {inicioTriagem !== "—"
                  ? new Date(inicioTriagem).toLocaleString("pt-PT")
                  : "—"}
              </strong>
            </div>

            <div className="doctor-triage-banner__info">
              <span>Enfermeiro</span>
              <strong>
                {getField(dadosTriagem, "nome_enfermeiro", "nomeenfermeiro")}
              </strong>
            </div>
          </div>

          {!modoEdicaoTriagem ? (
            <>
              <div className="doctor-vitals-table">
                <div className="doctor-vital-row">
                  <span>Temperatura</span>
                  <strong>{getField(dadosTriagem, "temperatura")} °C</strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Freq. Cardíaca</span>
                  <strong>
                    {getField(dadosTriagem, "freq_card", "freqcard")} bpm
                  </strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Freq. Respiratória</span>
                  <strong>
                    {getField(dadosTriagem, "freq_resp", "freqresp")} rpm
                  </strong>
                </div>

                <div className="doctor-vital-row">
                  <span>SpO2</span>
                  <strong>{getField(dadosTriagem, "sp_o2", "spo2")} %</strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Tensão Arterial</span>
                  <strong>
                    {getField(dadosTriagem, "sistolica")}/
                    {getField(dadosTriagem, "diastolica")} mmHg
                  </strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Nível Dor</span>
                  <strong>
                    {getField(dadosTriagem, "nivel_dor", "niveldor")} /10
                  </strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Consciência</span>
                  <strong>{getField(dadosTriagem, "consciencia")}</strong>
                </div>
              </div>

              <div className="doctor-clinical-note">
                <span>Sintomas Referidos</span>
                <p>{getField(dadosTriagem, "sintomas")}</p>
              </div>
            </>
          ) : (
            <>
              <div className="doctor-vitals-table">
                <div className="doctor-vital-row">
                  <span>Temperatura</span>
                  <input
                    className="doctor-field"
                    type="number"
                    value={formTriagem.temperatura ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        temperatura: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="doctor-vital-row">
                  <span>Freq. Cardíaca</span>
                  <input
                    className="doctor-field"
                    type="number"
                    value={formTriagem.freqcard ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        freqcard: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="doctor-vital-row">
                  <span>Freq. Respiratória</span>
                  <input
                    className="doctor-field"
                    type="number"
                    value={formTriagem.freqresp ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        freqresp: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="doctor-vital-row">
                  <span>SpO2</span>
                  <input
                    className="doctor-field"
                    type="number"
                    value={formTriagem.spo2 ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        spo2: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="doctor-vital-row">
                  <span>Tensão Arterial</span>
                  <div className="doctor-bp-grid">
                    <input
                      className="doctor-field"
                      type="number"
                      placeholder="Sistólica"
                      value={formTriagem.sistolica ?? ""}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({
                          ...prev,
                          sistolica: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="doctor-field"
                      type="number"
                      placeholder="Diastólica"
                      value={formTriagem.diastolica ?? ""}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({
                          ...prev,
                          diastolica: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="doctor-vital-row">
                  <span>Nível Dor</span>
                  <strong>
                    {getField(dadosTriagem, "nivel_dor", "niveldor")} /10
                  </strong>
                </div>

                <div className="doctor-vital-row">
                  <span>Consciência</span>
                  <strong>{getField(dadosTriagem, "consciencia")}</strong>
                </div>
              </div>

              <div className="doctor-clinical-note">
                <span>Sintomas Referidos</span>
                <textarea
                  className="doctor-field"
                  rows={3}
                  value={formTriagem.sintomas ?? ""}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({
                      ...prev,
                      sintomas: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}
        </section>
      </div>
    );
  };

  const renderTabPrescricao = () => {
    const medicacaoAtivaEnriquecida =
      enriquecerMedicacaoAtiva(medicacaoAtiva);

    return (
      <div className="doctor-stacked-sections">
        <section className="doctor-subcard">
          <SectionHeader
            title="Medicação ativa"
            subtitle="Terapêutica atual do utente"
          />

          {medicacaoAtivaEnriquecida.length === 0 ? (
            <div className="doctor-empty-box">
              Nenhuma medicação ativa registada.
            </div>
          ) : (
            <div className="doctor-alert-list">
              {medicacaoAtivaEnriquecida.map((m, i) => (
                <div
                  key={`med-ativa-${i}`}
                  className="doctor-med-item"
                >
                  <strong>
                    {m.nomeApresentacao || `Medicamento ${i + 1}`}
                  </strong>

                  <span>
                    {m?.dosagem
                      ? `Dosagem: ${m.dosagem}`
                      : "Sem dosagem"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="doctor-subcard">
          <SectionHeader
            title="Alertas"
            subtitle="Alergias e observações críticas"
          />

          {alertas.length === 0 ? (
            <div className="doctor-empty-box">
              Sem alertas registados.
            </div>
          ) : (
            <div className="doctor-alert-list">
              {alertas.map((a, i) => (
                <div
                  key={i}
                  className="doctor-alert-item"
                >
                  {a.descricao || a.mensagem || a.alerta}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="doctor-subcard">
          <SectionHeader
            title="Nova Prescrição"
            subtitle="Registar medicação"
          />

          <div className="doctor-form-grid">
            <div>
              <label>Medicamento</label>

              <select
                className="doctor-field"
                name="cod_medicamento"
                value={Prescricao.codmedicamento || ""}
                onChange={handlePrescricaoChange}
              >
                <option value="">
                  Selecione...
                </option>

                {Array.isArray(medicamentos) &&
                  medicamentos.map((m, index) => {
                    const medId =
                      getMedicamentoId(m, index);

                    const medNome =
                      getMedicamentoNome(m, index);

                    return (
                      <option
                        key={`med-${medId}-${index}`}
                        value={medId}
                      >
                        {medNome}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label>Dosagem</label>

              <input
                className="doctor-field"
                type="text"
                name="dosagem"
                value={Prescricao.dosagem || ""}
                onChange={handlePrescricaoChange}
              />
            </div>

            <div className="doctor-form-grid-full">
              <label>Observações</label>

              <input
                className="doctor-field"
                type="text"
                name="observacoes"
                value={Prescricao.observacoes || ""}
                onChange={handlePrescricaoChange}
              />
            </div>
          </div>

          <div
            className="doctor-actions-inline"
            style={{ marginTop: "1rem" }}
          >
            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--secondary"
              onClick={async () => {
                if (!Prescricao.codmedicamento) {
                  mostrarToast("Seleciona um medicamento.", "error");
                  return;
                }

                setAvaliacaoRisco(true);

                try {
                  const med = medicamentos.find(
                    (m, index) =>
                      String(getMedicamentoId(m, index)) ===
                      String(Prescricao.cod_medicamento)
                  );

                  const nomeMed = med
                    ? getMedicamentoNome(med)
                    : "Medicamento";

                  const existeAlergia = alergias.some((a) => {
                    const txt = String(
                      a?.descricao ||
                      a?.substancia ||
                      a?.alergia ||
                      ""
                    ).toLowerCase();

                    return txt.includes(nomeMed.toLowerCase());
                  });

                  const resultado = existeAlergia
                    ? {
                      risco: 1,
                      riscoalto: true,
                      mensagem: "Possível alergia detetada",
                      explicacao: `O utente pode ter alergia a ${nomeMed}.`,
                    }
                    : {
                      risco: 0,
                      riscoalto: false,
                      mensagem: "Sem risco conhecido",
                      explicacao: `Não foram encontradas alergias para ${nomeMed}.`,
                    };

                  setRiscoIA(resultado);

                  mostrarToast(
                    "Avaliação concluída.",
                    "success"
                  );
                } catch (e) {
                  console.error(e);

                  mostrarToast(
                    "Erro na avaliação IA.",
                    "error"
                  );
                } finally {
                  setAvaliacaoRisco(false);
                }
              }}
              disabled={!Prescricao.cod_medicamento || avaliacaoRisco}
            >
              {avaliacaoRisco
                ? "A avaliar..."
                : "Avaliar risco IA"}
            </button>

            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--secondary"
              onClick={prepararImpressaoPrescricao(item)}
              disabled={medicacaoAtivaEnriquecida.length === 0}
            >
              Imprimir medicação ativa
            </button>

            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--primary"
              onClick={submeterPrescricao}
              disabled={
                !prescricao?.codmedicamento ||
                !prescricao?.dosagem
              }
            >
              Registar prescrição
            </button>
          </div>

          {riscoIA && (
            <div
              className={`doctor-risk-result ${riscoIA?.risco === 1 || riscoIA?.riscoalto
                ? "is-danger"
                : "is-safe"
                }`}
              style={{ marginTop: "1rem" }}
            >
              <strong>
                {riscoIA?.mensagem}
              </strong>

              <span>
                {riscoIA?.explicacao}
              </span>
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderTabDecisao = () => {
    return (
      <div className="doctor-stacked-sections">

        <section className="doctor-subcard">

          <SectionHeader
            title="Decisão Clínica"
            subtitle="Alta médica ou internamento"
          />

          <div className="doctor-form-grid">

            <div>
              <label>Destino</label>

              <select
                className="doctor-field"
                value={alta.destino}
                onChange={(e) =>
                  setAlta((prev) => ({
                    ...prev,
                    destino: e.target.value,
                  }))
                }
              >
                <option value="alta">
                  Alta
                </option>

                <option value="internamento">
                  Internamento
                </option>
              </select>
            </div>

            {alta.destino === 'internamento' && (
              <>
                <div>
                  <label>Serviço</label>

                  <select
                    className="doctor-field"
                    value={alta.servico}
                    onChange={(e) =>
                      setAlta((prev) => ({
                        ...prev,
                        servico: e.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Selecionar...
                    </option>

                    {SERVICOS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Número da cama</label>

                  <input
                    className="doctor-field"
                    type="text"
                    value={alta.numero_cama}
                    onChange={(e) =>
                      setAlta((prev) => ({
                        ...prev,
                        numero_cama: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            <div className="doctor-form-grid-full">

              <label>Observações</label>

              <textarea
                className="doctor-field"
                rows={4}
                value={alta.observacoes}
                onChange={(e) =>
                  setAlta((prev) => ({
                    ...prev,
                    observacoes: e.target.value,
                  }))
                }
              />

            </div>

          </div>

          <div
            className="doctor-actions-inline"
            style={{ marginTop: '1rem' }}
          >
            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--primary"
              onClick={submeterAlta}
            >
              Confirmar decisão
            </button>
          </div>

        </section>

      </div>
    );
  };

  const avaliarRiscoIAFn = async () => {
    if (!prescricao?.codmedicamento) {
      mostrarToast('Seleciona um medicamento.', 'error');
      return;
    }

    setAvaliacaoRisco(true);

    try {
      const med = medicamentos.find(
        (m) => String(getMedicamentoId(m)) === String(prescricao.codmedicamento)
      );

      const nomeMed = med ? getMedicamentoNome(med) : 'Medicamento';

      const existeAlergia = alergias.some((a) => {
        const txt = String(
          a?.descricao || a?.substancia || a?.alergia || ''
        ).toLowerCase();

        return txt.includes(nomeMed.toLowerCase());
      });

      const resultado = existeAlergia
        ? {
          risco: 1,
          riscoalto: true,
          mensagem: 'Possível alergia detetada.',
          explicacao: `O utente pode ter alergia a ${nomeMed}.`,
        }
        : {
          risco: 0,
          riscoalto: false,
          mensagem: 'Sem risco conhecido.',
          explicacao: `Não foram encontradas alergias registadas para ${nomeMed}.`,
        };

      setRiscoIA(resultado);
      mostrarToast('Avaliação concluída.', 'success');
    } catch (e) {
      console.error(e);
      mostrarToast('Erro na avaliação IA.', 'error');
    } finally {
      setAvaliacaoRisco(false);
    }
  };
  const renderAtendimento = () => {

    const tabs = [
      ['vitais', 'Dados Vitais'],
      ['prescricao', 'Prescrever'],
      ['decisao', 'Alta / Internamento'],
    ];

    const nomeUtente =
      utente?.nome ||
      episodioSelecionado?.nome_utente ||
      episodioSelecionado?.nomeutente ||
      'Utente';

    const codEpisodio =
      episodioSelecionado?.cod_ep_urgenc ||
      episodioSelecionado?.codepurgenc ||
      '—';

    const dataEntrada =
      dadosTriagem?.datahorainicio
        ? new Date(dadosTriagem.datahorainicio).toLocaleString('pt-PT')
        : '—';

    return (
      <div className="doctor-attendance-page">

        <div className="doctor-episode-header">

          <div className="doctor-episode-header__left">

            <button
              type="button"
              className="doctor-back-link"
              onClick={() => {
                setEpisodioSelecionado(null);
                setModoEdicaoTriagem(false);
                setTabAtendimento('vitais');
                setSubMenuFila('em_espera');
              }}
            >
              ← Voltar à fila
            </button>

            <h1 className="doctor-episode-title">
              Episódio #{codEpisodio}
            </h1>

            <p className="doctor-episode-subtitle">
              UCIP · Urgência Central
            </p>

          </div>

          <div className="doctor-episode-header__right">

            <div className="doctor-episode-date-card">

              <span className="doctor-episode-date-label">
                Data de entrada
              </span>

              <strong className="doctor-episode-date-value">
                {dataEntrada}
              </strong>

            </div>

          </div>

        </div>

        <div className="doctor-tabs-row">

          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`doctor-tab-btn ${tabAtendimento === id ? 'is-active' : ''
                }`}
              onClick={() => setTabAtendimento(id)}
            >
              {label}
            </button>
          ))}

        </div>

        <div className="doctor-attendance-content">

          {tabAtendimento === 'vitais' && renderTabVitais()}

          {tabAtendimento === 'prescricao' && (
            <DoctorPrescription
              medicacaoAtiva={medicacaoAtiva}
              enriquecerMedicacaoAtiva={enriquecerMedicacaoAtiva}
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
              imprimirPrescricao={imprimirPrescricao}
            />
          )}

          {tabAtendimento === 'decisao' && renderTabDecisao()}

        </div>

      </div>
    );
  };


  const formatarValorAntecedente = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return '—';
    }

    if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') {
      return String(valor);
    }

    if (Array.isArray(valor)) {
      if (valor.length === 0) return '—';

      return valor
        .map((item) => {
          if (item === null || item === undefined) return null;

          if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
            return String(item);
          }

          if (typeof item === 'object') {
            return (
              item.nome ||
              item.designacao ||
              item.descricao ||
              item.substancia ||
              item.medicamento ||
              item.valor ||
              JSON.stringify(item)
            );
          }

          return String(item);
        })
        .filter(Boolean)
        .join(', ');
    }

    if (typeof valor === 'object') {
      return Object.entries(valor)
        .map(([chave, conteudo]) => {
          if (conteudo === null || conteudo === undefined || conteudo === '') return null;

          if (
            typeof conteudo === 'string' ||
            typeof conteudo === 'number' ||
            typeof conteudo === 'boolean'
          ) {
            return `${chave.replace(/_/g, ' ')}: ${conteudo}`;
          }

          if (Array.isArray(conteudo)) {
            const textoArray = conteudo
              .map((item) => {
                if (typeof item === 'object' && item !== null) {
                  return (
                    item.nome ||
                    item.designacao ||
                    item.descricao ||
                    item.substancia ||
                    item.medicamento ||
                    JSON.stringify(item)
                  );
                }
                return String(item);
              })
              .join(', ');

            return `${chave.replace(/_/g, ' ')}: ${textoArray}`;
          }

          if (typeof conteudo === 'object') {
            return `${chave.replace(/_/g, ' ')}: ${JSON.stringify(conteudo)}`;
          }

          return `${chave.replace(/_/g, ' ')}: ${String(conteudo)}`;
        })
        .filter(Boolean)
        .join(' | ');
    }

    return String(valor);
  };

  const formatarTexto = (valor) => {
    if (valor === null || valor === undefined || valor === '') return '—';
    if (typeof valor === 'string' || typeof valor === 'number' || typeof valor === 'boolean') {
      return String(valor);
    }
    if (Array.isArray(valor)) {
      return valor
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return item.nome || item.descricao || item.substancia || JSON.stringify(item);
          }
          return String(item);
        })
        .join(', ');
    }
    if (typeof valor === 'object') {
      return Object.entries(valor)
        .map(([chave, conteudo]) => `${chave.replace(/_/g, ' ')}: ${formatarTexto(conteudo)}`)
        .join(' | ');
    }
    return String(valor);
  };

  const renderTabAntecedentes = () => {
    if (!antecedentes) {
      return (
        <div>
          <SectionHeader
            title="Antecedentes clínicos"
            subtitle="Histórico clínico relevante do utente"
          />
          <div className="doctor-empty-box">Sem antecedentes registados.</div>
        </div>
      );
    }

    if (Array.isArray(antecedentes)) {
      return (
        <div>
          <SectionHeader
            title="Antecedentes clínicos"
            subtitle="Histórico clínico relevante do utente"
          />
          {antecedentes.length === 0 ? (
            <div className="doctor-empty-box">Sem antecedentes registados.</div>
          ) : (
            <div className="doctor-alert-list">
              {antecedentes.map((item, index) => (
                <div key={`ant-${index}`} className="doctor-info-card">
                  <span className="doctor-info-card-label">
                    {item?.tipo || item?.categoria || `Antecedente ${index + 1}`}
                  </span>
                  <span className="doctor-info-card-value">
                    {item?.nome || item?.descricao || formatarTexto(item)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <SectionHeader
          title="Antecedentes clínicos"
          subtitle="Histórico clínico relevante do utente"
        />
        {Object.keys(antecedentes).length === 0 ? (
          <div className="doctor-empty-box">Sem antecedentes registados.</div>
        ) : (
          <div className="doctor-vitals-grid">
            {Object.entries(antecedentes).map(([k, v], index) => (
              <div key={`${k}-${index}`} className="doctor-info-card">
                <span className="doctor-info-card-label">
                  {k.replace(/_/g, ' ')}
                </span>
                <span className="doctor-info-card-value">
                  {formatarTexto(v)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTabHistorico = () => (
    <div>
      <SectionHeader
        title="Histórico clínico"
        subtitle="Atos clínicos registados neste episódio"
      />
      <div className="doctor-table-shell">
        <table className="doctor-modern-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Início</th>
              <th>Fim</th>
            </tr>
          </thead>
          <tbody>
            {atos.length === 0 ? (
              <tr>
                <td colSpan="5" className="doctor-table-empty">
                  Sem atos clínicos registados para este episódio.
                </td>
              </tr>
            ) : (
              atos.map((a) => (
                <tr key={a.id_ato || a.idato}>
                  <td>{a.id_ato || a.idato}</td>
                  <td>{a.tipo || '—'}</td>
                  <td>{a.descricao || '—'}</td>
                  <td>
                    {a.data_hora_inicio || a.datahorainicio
                      ? new Date(a.data_hora_inicio || a.datahorainicio).toLocaleString('pt-PT')
                      : '—'}
                  </td>
                  <td>
                    {a.data_hora_fim || a.datahorafim
                      ? new Date(a.data_hora_fim || a.datahorafim).toLocaleString('pt-PT')
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabAlertas = () => (
    <div>
      <SectionHeader
        title="Alertas"
        subtitle="Atenção clínica, alergias e observações críticas"
      />

      {alertas.length === 0 ? (
        <div className="doctor-empty-box">Sem alertas críticos registados.</div>
      ) : (
        <div className="doctor-alert-list">
          {alertas.map((a, i) => (
            <div key={i} className="doctor-alert-item">
              {a.descricao || a.mensagem || a.alerta}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTabMedicacao = () => {
    const medicacaoAtivaEnriquecida = enriquecerMedicacaoAtiva(medicacaoAtiva);

    return (
      <div>
        <SectionHeader
          title="Medicação ativa"
          subtitle="Terapêutica habitual e medicação atualmente registada"
        />

        {medicacaoAtivaEnriquecida.length === 0 ? (
          <div className="doctor-empty-box">Nenhum medicamento ativo associado.</div>
        ) : (
          <div className="doctor-alert-list">
            {medicacaoAtivaEnriquecida.map((m, i) => (
              <div key={`med-ativa-${i}`} className="doctor-med-item">
                <strong>{m.nomeApresentacao || `Medicamento ${i + 1}`}</strong>
                <span>
                  {m?.dosagem ? `Dosagem: ${m.dosagem}` : 'Sem dosagem registada'}
                  {m?.observacoes ? ` · ${m.observacoes}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };



  const imprimirPrescricao = () => {
    const dadosImpressao = prescricaoImpressao || {};

    const codEpisodio =
      episodioSelecionado?.cod_ep_urgenc ||
      episodioSelecionado?.codepurgenc ||
      episodioSelecionado?.codepisodio ||
      episodioSelecionado?.cod_episodio ||
      '—';

    const nomeUtente =
      utente?.nome ||
      utente?.nome_utente ||
      episodioSelecionado?.nome_utente ||
      episodioSelecionado?.nomeutente ||
      '—';

    const numeroUtente =
      dadosImpressao.numeroUtente ||
      utente?.num_utente ||
      utente?.numutente ||
      utente?.numutent ||
      utente?.codutente ||
      utente?.cod_utente ||
      episodioSelecionado?.num_utente ||
      episodioSelecionado?.numutente ||
      episodioSelecionado?.numutent ||
      episodioSelecionado?.codutente ||
      episodioSelecionado?.cod_utente ||
      '—';

    const dataNascimento =
      utente?.data_nasc ||
      utente?.datanasc ||
      utente?.data_nascimento ||
      '—';

    const idade =
      dataNascimento && dataNascimento !== '—'
        ? calcularIdade(dataNascimento)
        : '—';

    const sexo =
      utente?.sexo ||
      utente?.genero ||
      '—';

    const medico =
      utilizadorLogado?.nome ||
      utilizadorLogado?.name ||
      utilizadorLogado?.username ||
      'Médico';

    const corTriagem =
      dadosTriagem?.cor_triagem ||
      dadosTriagem?.cortriagem ||
      episodioSelecionado?.cor_triagem ||
      episodioSelecionado?.cortriagem ||
      '—';

    const medicamentoSelecionadoCatalogo = medicamentos.find(
      (m) =>
        String(getMedicamentoId(m)) ===
        String(dadosImpressao?.codmedicamento ?? prescricao?.codmedicamento)
    );

    const medicamentoSelecionadoAtivo = medicacaoAtiva.find(
      (m) =>
        String(
          m?.codmedicamento ??
          m?.cod_medicamento ??
          m?.idmedicamento ??
          m?.id_medicamento ??
          m?.id
        ) === String(dadosImpressao?.codmedicamento ?? prescricao?.codmedicamento)
    );

    const nomeMedicamento =
      dadosImpressao?.nomeApresentacao ||
      medicamentoSelecionadoAtivo?.nomeApresentacao ||
      medicamentoSelecionadoAtivo?.nome ||
      medicamentoSelecionadoAtivo?.nomemedicamento ||
      medicamentoSelecionadoAtivo?.nome_medicamento ||
      medicamentoSelecionadoAtivo?.medicamento ||
      medicamentoSelecionadoAtivo?.designacao ||
      medicamentoSelecionadoAtivo?.descricao ||
      medicamentoSelecionadoCatalogo?.nome ||
      medicamentoSelecionadoCatalogo?.nomemedicamento ||
      medicamentoSelecionadoCatalogo?.nome_medicamento ||
      medicamentoSelecionadoCatalogo?.medicamento ||
      medicamentoSelecionadoCatalogo?.designacao ||
      medicamentoSelecionadoCatalogo?.descricao ||
      getMedicamentoNome(
        medicamentoSelecionadoAtivo || medicamentoSelecionadoCatalogo
      ) ||
      '—';

    const dosagem =
      dadosImpressao?.dosagem ||
      medicamentoSelecionadoAtivo?.dosagem ||
      '—';

    const frequencia =
      dadosImpressao?.frequencia ||
      medicamentoSelecionadoAtivo?.frequencia ||
      '—';

    const observacoes =
      dadosImpressao?.observacoes ||
      medicamentoSelecionadoAtivo?.observacoes ||
      'Sem observações adicionais.';

    const dataAtual = new Date();
    const dataEmissao = dataAtual.toLocaleDateString('pt-PT');
    const horaEmissao = dataAtual.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const estadoIA = riscoIA
      ? riscoIA.riscoalto
        ? 'Risco identificado'
        : 'Sem risco identificado'
      : 'Não avaliado';

    const detalheIA =
      riscoIA?.explicacao ||
      riscoIA?.mensagem ||
      'Sem observações adicionais da avaliação inteligente.';

    const janela = window.open('', '_blank', 'width=1024,height=840');

    if (!janela) {
      mostrarToast('Não foi possível abrir a janela de impressão.', 'error');
      return;
    }

    const html = `
    <!DOCTYPE html>
    <html lang="pt">
      <head>
        <meta charset="UTF-8" />
        <title>Prescrição Médica - ${nomeHospital}</title>
        <style>
          * { box-sizing: border-box; }

          :root {
            --ink: #1f2937;
            --muted: #6b7280;
            --line: #d7dde5;
            --soft: #eef3f7;
            --soft-2: #f8fafc;
            --brand: #0f766e;
            --brand-2: #155e75;
            --brand-soft: #dff5f2;
            --danger: #9f1239;
            --danger-soft: #fde8ef;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #e9eef3;
            color: var(--ink);
            font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
          }

          body { padding: 32px 20px; }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #fff;
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
            position: relative;
            overflow: hidden;
          }

          .page::before {
            content: "";
            display: block;
            height: 10px;
            background: linear-gradient(90deg, var(--brand) 0%, var(--brand-2) 100%);
          }

          .sheet { padding: 32px 36px 28px; }

          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            border-bottom: 1px solid var(--line);
            padding-bottom: 20px;
            margin-bottom: 24px;
          }

          .brand {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }

          .brand-mark {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            letter-spacing: 0.06em;
            flex-shrink: 0;
          }

          .brand h1 {
            margin: 0;
            font-size: 28px;
            line-height: 1.1;
            letter-spacing: -0.02em;
          }

          .brand p {
            margin: 6px 0 0;
            color: var(--muted);
            font-size: 14px;
          }

          .doc-meta {
            text-align: right;
            min-width: 240px;
          }

          .doc-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 7px 12px;
            border-radius: 999px;
            background: var(--brand-soft);
            color: var(--brand);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 10px;
          }

          .doc-meta-row {
            margin-top: 6px;
            font-size: 14px;
            color: var(--muted);
          }

          .section { margin-bottom: 22px; }

          .section-title {
            margin: 0 0 12px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .info-card {
            border: 1px solid var(--line);
            background: var(--soft-2);
            border-radius: 14px;
            padding: 14px 16px;
          }

          .label {
            display: block;
            margin-bottom: 6px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
            font-weight: 700;
          }

          .value {
            font-size: 17px;
            font-weight: 600;
            color: var(--ink);
            line-height: 1.35;
          }

          .prescription-box {
            border: 1px solid #bfdbfe;
            background: linear-gradient(180deg, #f8fbff 0%, #f3f8fd 100%);
            border-radius: 18px;
            padding: 18px;
          }

          .prescription-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 14px;
          }

          .prescription-header h2 {
            margin: 0;
            font-size: 24px;
            line-height: 1.15;
          }

          .prescription-sub {
            margin: 6px 0 0;
            color: var(--muted);
            font-size: 14px;
          }

          .triage-tag {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            border-radius: 999px;
            padding: 8px 12px;
            background: white;
            border: 1px solid var(--line);
            font-size: 13px;
            color: var(--ink);
            font-weight: 600;
            white-space: nowrap;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          .rx-table {
            overflow: hidden;
            border-radius: 14px;
            border: 1px solid var(--line);
            background: white;
          }

          .rx-table th {
            text-align: left;
            padding: 12px 14px;
            background: #f3f6f9;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }

          .rx-table td {
            padding: 14px;
            border-top: 1px solid var(--line);
            vertical-align: top;
            font-size: 14px;
          }

          .rx-main {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }

          .rx-note {
            margin-top: 14px;
            padding: 14px 16px;
            border-radius: 14px;
            background: white;
            border: 1px dashed #cbd5e1;
            color: #334155;
            font-size: 14px;
            line-height: 1.6;
          }

          .ia-box {
            margin-top: 18px;
            border-radius: 16px;
            padding: 16px 18px;
            border: 1px solid ${riscoIA?.riscoalto ? '#f3b4c4' : '#b7e4dd'};
            background: ${riscoIA?.riscoalto ? 'var(--danger-soft)' : 'var(--brand-soft)'};
          }

          .ia-title {
            margin: 0 0 8px;
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: ${riscoIA?.riscoalto ? 'var(--danger)' : 'var(--brand)'};
          }

          .ia-status {
            margin: 0 0 8px;
            font-size: 18px;
            font-weight: 700;
            color: var(--ink);
          }

          .ia-text {
            margin: 0;
            color: #334155;
            font-size: 14px;
            line-height: 1.6;
          }

          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin-top: 26px;
          }

          .signature-card {
            border: 1px solid var(--line);
            border-radius: 16px;
            padding: 18px 18px 42px;
            background: white;
            min-height: 120px;
            position: relative;
          }

          .signature-line {
            position: absolute;
            left: 18px;
            right: 18px;
            bottom: 18px;
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
            font-size: 12px;
            color: var(--muted);
          }

          .footer {
            margin-top: 28px;
            padding-top: 14px;
            border-top: 1px solid var(--line);
            display: flex;
            justify-content: space-between;
            gap: 20px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.6;
          }

          .actions {
            width: 210mm;
            margin: 16px auto 0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
          }

          .btn {
            border: none;
            border-radius: 12px;
            padding: 12px 18px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .btn-secondary {
            background: #dfe5eb;
            color: #0f172a;
          }

          .btn-primary {
            background: linear-gradient(90deg, var(--brand) 0%, var(--brand-2) 100%);
            color: white;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .page {
              width: 100%;
              min-height: auto;
              box-shadow: none;
              margin: 0;
            }

            .actions {
              display: none;
            }

            @page {
              size: A4;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="sheet">
            <header class="topbar">
              <div class="brand">
                <div class="brand-mark">RX</div>
                <div>
                  <h1>${nomeHospital}</h1>
                  <p>Serviço de Urgência · Documento clínico de prescrição médica</p>
                </div>
              </div>

              <div class="doc-meta">
                <div class="doc-badge">Prescrição Médica</div>
                <div class="doc-meta-row"><strong>Data:</strong> ${dataEmissao}</div>
                <div class="doc-meta-row"><strong>Hora:</strong> ${horaEmissao}</div>
                <div class="doc-meta-row"><strong>Episódio:</strong> #${codEpisodio}</div>
              </div>
            </header>

            <section class="section">
              <h3 class="section-title">Identificação do utente</h3>
              <div class="info-grid">
                <div class="info-card">
                  <span class="label">Nome completo</span>
                  <div class="value">${nomeUtente}</div>
                </div>
                <div class="info-card">
                  <span class="label">N.º do utente</span>
                  <div class="value">${numeroUtente}</div>
                </div>
                <div class="info-card">
                  <span class="label">Data de nascimento</span>
                  <div class="value">${dataNascimento}</div>
                </div>
                <div class="info-card">
                  <span class="label">Idade / Sexo</span>
                  <div class="value">${idade} anos · ${sexo}</div>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="prescription-box">
                <div class="prescription-header">
                  <div>
                    <h2>Detalhe da Prescrição</h2>
                    <p class="prescription-sub">
                      Emissão clínica validada pelo médico assistente no contexto do episódio de urgência.
                    </p>
                  </div>
                  <div class="triage-tag">Triagem: ${corTriagem}</div>
                </div>

                <div class="rx-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Medicamento</th>
                        <th>Dosagem</th>
                        <th>Frequência</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="rx-main">${nomeMedicamento}</div>
                          <div>Prescrição individual do episódio #${codEpisodio}</div>
                        </td>
                        <td>${dosagem}</td>
                        <td>${frequencia}</td>
                        <td>${observacoes}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="ia-box">
                  <div class="ia-title">Validação clínica assistida por IA</div>
                  <p class="ia-status">${estadoIA}</p>
                  <p class="ia-text">${detalheIA}</p>
                </div>

                <div class="rx-note">
                  <strong>Nota clínica:</strong> Este documento representa a prescrição registada no sistema à data de emissão e deve ser interpretado no contexto do quadro clínico atual do utente, antecedentes, alergias conhecidas e avaliação médica presencial.
                </div>
              </div>
            </section>

            <section class="section">
              <h3 class="section-title">Validação e assinatura</h3>
              <div class="signature-grid">
                <div class="signature-card">
                  <span class="label">Médico responsável</span>
                  <div class="value">${medico}</div>
                  <div style="margin-top:8px; color:#64748b; font-size:14px;">
                    Emitido eletronicamente pelo painel clínico
                  </div>
                  <div class="signature-line">Assinatura / vinheta médica</div>
                </div>

                <div class="signature-card">
                  <span class="label">Confirmação de emissão</span>
                  <div class="value">${dataEmissao} · ${horaEmissao}</div>
                  <div style="margin-top:8px; color:#64748b; font-size:14px;">
                    Documento preparado para impressão e arquivo clínico
                  </div>
                  <div class="signature-line">Carimbo / validação institucional</div>
                </div>
              </div>
            </section>

            <footer class="footer">
              <div>
                Documento gerado automaticamente no painel médico do hospital.
              </div>
              <div>
                ${nomeHospital} · Prescrição clínica do episódio #${codEpisodio}
              </div>
            </footer>
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" onclick="window.close()">Fechar</button>
          <button class="btn btn-primary" onclick="window.print()">Imprimir</button>
        </div>
      </body>
    </html>
  `;

    janela.document.open();
    janela.document.write(html);
    janela.document.close();
  };



  const renderInternamentos = () => {
    if (internamentoSelecionado) return renderFichaInternamento();

    return (
      <div className="doctor-panel-card">
        <SectionHeader
          title="Internamentos Ativos"
          subtitle="Consultar ficha do utente, prescrever e registar alta"
        />

        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr>
                <th>Internamento</th>
                <th>Episódio</th>
                <th>Utente</th>
                <th>Serviço</th>
                <th>Cama</th>
                <th>Motivo</th>
                <th>Entrada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {internamentos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="doctor-table-empty">
                    Sem utentes internados de momento.
                  </td>
                </tr>
              ) : (
                internamentos.map((int) => (
                  <tr key={int.cod_internamento}>
                    <td>#{int.cod_internamento}</td>
                    <td>#{int.cod_ep_urgenc}</td>
                    <td>{int.nome_utente || '—'}</td>
                    <td>{int.servico || '—'}</td>
                    <td>{int.numero_cama || '—'}</td>
                    <td>{int.motivo_int || '—'}</td>
                    <td>
                      {int.data_hora_int
                        ? new Date(int.data_hora_int).toLocaleString('pt-PT')
                        : '—'}
                    </td>
                    <td>
                      <button
                        className="doctor-action-btn doctor-action-btn--primary"
                        onClick={() => setInternamentoSelecionado(int)}
                      >
                        Consultar
                      </button>
                    </td>
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
          <button
            className="doctor-back-link"
            onClick={() => setInternamentoSelecionado(null)}
          >
            ← Voltar aos internamentos
          </button>
          <h3 className="doctor-patient-banner__name">
            {internamentoSelecionado?.nome_utente || '—'}
          </h3>
          <p className="doctor-patient-banner__meta">
            Internamento #{internamentoSelecionado?.cod_internamento}
          </p>
        </div>
      </div>

      <div className="doctor-internamento-grid">
        <div className="doctor-subcard">
          <SectionHeader title="Dados do internamento" />
          <div className="doctor-detail-list">
            <div>
              <span>Episódio</span>
              <strong>#{internamentoSelecionado?.cod_ep_urgenc || '—'}</strong>
            </div>
            <div>
              <span>Serviço</span>
              <strong>{internamentoSelecionado?.servico || '—'}</strong>
            </div>
            <div>
              <span>Cama</span>
              <strong>{internamentoSelecionado?.numero_cama || '—'}</strong>
            </div>
            <div>
              <span>Motivo</span>
              <strong>{internamentoSelecionado?.motivo_int || '—'}</strong>
            </div>
            <div>
              <span>Entrada</span>
              <strong>
                {internamentoSelecionado?.data_hora_int
                  ? new Date(internamentoSelecionado.data_hora_int).toLocaleString('pt-PT')
                  : '—'}
              </strong>
            </div>
          </div>
        </div>

        <div className="doctor-subcard">
          <SectionHeader title="Prescrever medicação" />
          <div className="doctor-form-grid">
            <div className="doctor-form-grid__full">
              <label>Medicamento</label>
              <select
                className="doctor-field"
                name="codmedicamento"
                value={Prescricao.codmedicamento}
                onChange={handlePrescricaoChange}
              >
                <option value="">Selecione...</option>
                {Array.isArray(medicamentos) &&
                  medicamentos.map((m, index) => {
                    const medId = getMedicamentoId(m, index);
                    const medNome = getMedicamentoNome(m, index);

                    return (
                      <option key={`med-int-${medId}-${index}`} value={medId}>
                        {medNome}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="doctor-form-grid__full">
              <label>Dosagem</label>
              <input
                className="doctor-field"
                type="text"
                name="dosagem"
                value={Prescricao.dosagem}
                onChange={handlePrescricaoChange}
              />
            </div>
          </div>

          <button
            className="doctor-action-btn doctor-action-btn--primary"
            onClick={() => submeterPrescricao(internamentoSelecionado?.cod_ep_urgenc)}
          >
            Prescrever
          </button>
        </div>
      </div>

      <div className="doctor-subcard">
        <SectionHeader title="Registar alta de internamento" />
        <div className="doctor-form-grid">
          <div>
            <label>Tipo de Alta</label>
            <select
              className="doctor-field"
              value={altaInternamento.tipo_alta}
              onChange={(e) =>
                setAltaInternamento((prev) => ({ ...prev, tipo_alta: e.target.value }))
              }
            >
              <option value="clinica">Alta Clínica</option>
              <option value="voluntaria">Alta Voluntária</option>
              <option value="transferencia">Transferência</option>
              <option value="obito">Óbito</option>
            </select>
          </div>

          <div>
            <label>Observações</label>
            <input
              className="doctor-field"
              type="text"
              value={altaInternamento.observacoes}
              onChange={(e) =>
                setAltaInternamento((prev) => ({ ...prev, observacoes: e.target.value }))
              }
            />
          </div>
        </div>

        <button
          className="doctor-action-btn doctor-action-btn--primary"
          onClick={submeterAltaInternamento}
        >
          Registar alta
        </button>
      </div>
    </div>
  );

  return (
    <div className={`doctor-layout-shell ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <Toast toast={toast} onClose={fecharToast} />

      <aside className="doctor-layout-sidebar">
        <button
          type="button"
          className="doctor-layout-sidebar__toggle"
          onClick={() => setIsSidebarCollapsed((v) => !v)}
          aria-label="Alternar sidebar"
        >
          <IconMenu />
        </button>

        <div className="doctor-layout-sidebar__brand">
          <img src={logo} alt="SIAGUH" className="doctor-layout-sidebar__logo" />
          {!isSidebarCollapsed && (
            <span className="doctor-layout-sidebar__hospital-name"></span>
          )}
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
            <button
              key={menu.id}
              type="button"
              className={`doctor-layout-sidebar__link ${activeMenu === menu.id ? 'is-active' : ''}`}
              onClick={() => {
                setActiveMenu(menu.id);
                setEpisodioSelecionado(null);
                setInternamentoSelecionado(null);
              }}
              title={isSidebarCollapsed ? menu.label : undefined}
            >
              <span className="doctor-layout-sidebar__icon">{menu.icon}</span>
              {!isSidebarCollapsed && (
                <span className="doctor-layout-sidebar__text">{menu.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="doctor-layout-sidebar__footer">
          <button
            type="button"
            className="doctor-layout-logout"
            onClick={() => navigate('/login')}
            title={isSidebarCollapsed ? 'Terminar sessão' : undefined}
          >
            <span className="doctor-layout-sidebar__icon">
              <IconExit />
            </span>
            {!isSidebarCollapsed && <span>Terminar sessão</span>}
          </button>
        </div>
      </aside>

      <div className="doctor-layout-main">
        <div className="doctor-layout-container">
          <div className="doctor-breadcrumbs">
            Início <span>›</span> {nomeHospital}
          </div>

          <div className="doctor-hero-card">
            <div>
              <h1 className="doctor-hero-card__title">
                {activeMenu === 'informacao_geral'
                  ? 'Painel do Médico'
                  : activeMenu === 'fila_triagens'
                    ? 'Fila de Triagens'
                    : 'Internamentos Ativos'}
              </h1>

              <p className="doctor-hero-card__subtitle">
                {textos?.doctor?.descricaoPainel ||
                  'Prioridade, detalhe clínico completo, prescrição e decisão final.'}
              </p>
            </div>

            <button
              type="button"
              className="doctor-action-link"
              onClick={carregarTudo}
            >
              Atualizar
            </button>
          </div>

          {activeMenu === 'informacao_geral' && renderInformacaoGeral()}
          {activeMenu === 'fila_triagens' && (
            subMenuFila === 'atendimento' && episodioSelecionado
              ? renderAtendimento()
              : renderFilaTriagens()
          )}
          {activeMenu === 'internamentos' && renderInternamentos()}
        </div>

        <FooterLayout />
      </div>
    </div>
  );
}