import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import '../../styles/pages/doctor-dashboard.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import Toast, { useToast } from '../../components/ui/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api/v1`;
const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

const getSafeOptionValue = (item, fallback) =>
  String(item?.codmedicamento ?? item?.id ?? fallback);

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
    m?.principioativo ??
    m?.principio_ativo ??
    m?.designacao ??
    m?.descricao ??
    m?.medicamento ??
    m?.nomecomercial ??
    m?.farmaco ??
    m?.fármaco ??
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

const enriquecerMedicacaoAtiva = (lista = []) =>
  lista.map((item, index) => {
    const medicamentoCatalogo = medicamentos.find(
      (med) => String(getMedicamentoId(med)) === String(
        item?.codmedicamento ??
        item?.idmedicamento ??
        item?.id ??
        item?.cod_medicamento
      )
    );

    return {
      ...item,
      nomeApresentacao:
        item?.nomemedicamento ||
        item?.medicamento ||
        item?.principioativo ||
        item?.designacao ||
        medicamentoCatalogo?.nome ||
        medicamentoCatalogo?.nomemedicamento ||
        medicamentoCatalogo?.principioativo ||
        medicamentoCatalogo?.designacao ||
        `Medicamento ${index + 1}`,
    };
  });

const carregarMedicacaoAtiva = async (numUtente) => {
  if (!numUtente) {
    setMedicacaoAtiva([]);
    return;
  }

  try {
    const r = await fetch(`${API_URL}/medicacao-ativa/utente/${numUtente}`, {
      headers: headers(),
    });

    if (!r.ok) {
      console.error('Erro carregarMedicacaoAtiva:', r.status);
      setMedicacaoAtiva([]);
      return;
    }

    const data = await r.json();
    console.log('RES medicacaoAtiva bruto', data);
    setMedicacaoAtiva(Array.isArray(data) ? data : []);
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

const abrirEpisodio = async (ep) => {
  setEpisodioSelecionado(ep);
  setTabAtendimento('prescricao');
  setRiscoIA(null);

  const numUtente =
    ep?.num_utente ||
    ep?.numutente ||
    ep?.codutente ||
    ep?.numutent;

  const codEpisodio =
    ep?.cod_ep_urgenc ||
    ep?.codepurgenc;

  if (!numUtente) {
    mostrarToast('Episódio sem utente associado.', 'error');
    return;
  }

  try {
    const rUtente = await fetch(`${API_URL}/utentes/${numUtente}`, {
      headers: headers(),
    });

    if (rUtente.ok) {
      const dataUtente = await rUtente.json();
      setUtente(dataUtente);
    } else {
      setUtente(null);
    }

    await Promise.all([
      carregarMedicacaoAtiva(numUtente),
      carregarAlergias(numUtente),
      carregarAntecedentes(numUtente),
      carregarAtos(codEpisodio),
    ]);
  } catch (e) {
    console.error(e);
    mostrarToast('Erro ao abrir o episódio.', 'error');
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

const handlePrescricaoChange = (e) => {
  const { name, value } = e.target;

  setPrescricao((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === 'codmedicamento') {
    setRiscoIA(null);
  }
};

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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('informacao_geral');
  const [subMenuFila, setSubMenuFila] = useState('em_espera');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [antecedentes, setAntecedentes] = useState(null);
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [modoEdicaoTriagem, setModoEdicaoTriagem] = useState(false);
  const [tabAtendimento, setTabAtendimento] = useState('vitais');
  const [internamentos, setInternamentos] = useState([]);
  const [internamentoSelecionado, setInternamentoSelecionado] = useState(null);
  const [altaInternamento, setAltaInternamento] = useState({ tipo_alta: 'clinica', observacoes: '' });
  const [formTriagem, setFormTriagem] = useState({
    cor_triagem: '',
    temperatura: '',
    freq_card: '',
    freq_resp: '',
    sp_o2: '',
    sistolica: '',
    diastolica: '',
    nivel_dor: '',
    consciencia: 'Acordado',
  });
  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—',
    laranja: '—',
    amarelo: '—',
    verde: '—',
    azul: '—',
  });
  const [filtro, setFiltro] = useState('');
  const [prescricao, setPrescricao] = useState({ codmedicamento: '', dosagem: '', observacoes: '' });
  const [medicamentos, setMedicamentos] = useState([]);
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

  const carregarEpisodios = async () => {
    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) {
      console.error('Hospital ID não encontrado no utilizador logado.');
      setEpisodios([]);
      return;
    }

    try {
      const r = await fetch(`${API_URL}/triagens/hospital/${hospitalId}`, {
        headers: headers(),
      });

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

    if (!hospitalId) {
      console.error('Hospital ID não encontrado no utilizador logado.');
      setTemposMediosHospital({
        vermelho: '—',
        laranja: '—',
        amarelo: '—',
        verde: '—',
        azul: '—',
      });
      return;
    }

    try {
      const r = await fetch(`${API_URL}/predict/tempos-espera/${hospitalId}`, {
        headers: headers(),
      });

      if (r.ok) {
        const data = await r.json();
        const tempos = data?.tempos_espera || data || {};

        setTemposMediosHospital({
          vermelho:
            tempos?.vermelho?.minutos != null ? `${tempos.vermelho.minutos} min` : '—',
          laranja:
            tempos?.laranja?.minutos != null ? `${tempos.laranja.minutos} min` : '—',
          amarelo:
            tempos?.amarelo?.minutos != null ? `${tempos.amarelo.minutos} min` : '—',
          verde:
            tempos?.verde?.minutos != null ? `${tempos.verde.minutos} min` : '—',
          azul:
            tempos?.azul?.minutos != null ? `${tempos.azul.minutos} min` : '—',
        });
      } else {
        console.error('Erro carregarTemposMedios:', r.status);
        setTemposMediosHospital({
          vermelho: '—',
          laranja: '—',
          amarelo: '—',
          verde: '—',
          azul: '—',
        });
      }
    } catch (e) {
      console.error(e);
      setTemposMediosHospital({
        vermelho: '—',
        laranja: '—',
        amarelo: '—',
        verde: '—',
        azul: '—',
      });
    }
  };

  const carregarInternamentos = async () => {
    const hospitalId =
      utilizadorLogado?.hospitais?.[0]?.idhosp ||
      utilizadorLogado?.hospitais?.[0]?.id_hosp;

    if (!hospitalId) {
      console.error('Hospital ID não encontrado no utilizador logado.');
      setInternamentos([]);
      return;
    }

    try {
      const r = await fetch(`${API_URL}/internamentos/hospital/${hospitalId}`, {
        headers: headers(),
      });

      if (r.ok) {
        const data = await r.json();
        setInternamentos(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro carregarInternamentos:', r.status);
        setInternamentos([]);
      }
    } catch (e) {
      console.error(e);
      setInternamentos([]);
    }
  };

  const carregarMedicamentos = async () => {
    try {
      const r = await fetch(`${API_URL}/medicamentos/`, {
        headers: headers(),
      });

      if (r.ok) {
        const data = await r.json();
        console.log('RES medicamentos bruto', data);
        console.table(Array.isArray(data) ? data.slice(0, 10) : data);
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

  const carregarDadosEpisodio = async (ep) => {
    setEpisodioSelecionado(ep);
    setTabAtendimento('vitais');
    setRiscoIA(null);

    try {
      const [rUtente, rTriagem, rAlertas, rMed, rAnteced, rAtos, rAlergias] =
        await Promise.all([
          fetch(`${API_URL}/utentes/${ep.codutente}`, { headers }),
          fetch(`${API_URL}/triagens/${ep.codepurgenc}`, { headers }),
          fetch(`${API_URL}/alertas/utente/${ep.codutente}`, { headers }),
          fetch(`${API_URL}/medicacao-ativa/utente/${ep.codutente}`, { headers }),
          fetch(`${API_URL}/antecedentes/utente/${ep.codutente}`, { headers }),
          fetch(`${API_URL}/atos/episodio/${ep.codepurgenc}`, { headers }),
          fetch(`${API_URL}/alergias/utente/${ep.codutente}`, { headers }),
        ]);

      if (rUtente.ok) setUtente(await rUtente.json());

      if (rTriagem.ok) {
        const t = await rTriagem.json();
        setDadosTriagem(t);
        setFormTriagem({
          cortriagem: t.cortriagem || '',
          temperatura: t.temperatura || '',
          freqcard: t.freqcard || '',
          freqresp: t.freqresp || '',
          spo2: t.spo2 || '',
          sistolica: t.sistolica || '',
          diastolica: t.diastolica || '',
          niveldor: t.niveldor || '',
          consciencia: t.consciencia || 'Acordado',
        });
      }

      if (rAlertas.ok) setAlertas(await rAlertas.json());
      if (rMed.ok) setMedicacaoAtiva(await rMed.json());
      if (rAnteced.ok) setAntecedentes(await rAnteced.json());

      if (rAtos.ok) {
        const a = await rAtos.json();
        setAtos(a);
        atosRef.current = a;
      }

      if (rAlergias.ok) setAlergias(await rAlergias.json());
    } catch (e) {
      console.error(e);
      mostrarToast('Erro ao carregar o episódio.', 'error');
    }
  };

  const guardarEdicaoTriagem = async () => {
    try {
      const r = await fetch(`${API_URL}/triagens/${episodioSelecionado.cod_ep_urgenc}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(formTriagem),
      });

      if (r.ok) {
        setDadosTriagem((prev) => ({ ...prev, ...formTriagem }));
        setModoEdicaoTriagem(false);
        mostrarToast('Triagem atualizada com sucesso.', 'success');
      }
    } catch {
      mostrarToast('Erro ao guardar triagem.', 'error');
    }
  };

  const avaliarRiscoIAFn = async () => {
    if (!prescricao.codmedicamento) {
      mostrarToast('Seleciona um medicamento antes de avaliar o risco.', 'error');
      return;
    }

    if (!utente) {
      mostrarToast('Utente não carregado.', 'error');
      return;
    }

    setAvaliacaoRisco(true);
    setRiscoIA(null);

    try {
      const med = medicamentos.find(
        (m) => String(getMedicamentoId(m)) === String(prescricao.codmedicamento)
      );

      if (!med) {
        throw new Error('Medicamento não encontrado.');
      }

      const nomeMed = getMedicamentoNome(med);

      const classeNovoMed =
        med?.classe_terapeutica_id ??
        med?.classeterapeuticaid ??
        med?.classeTerapeuticaId ??
        med?.cod_classe_terapeutica ??
        null;

      if (!classeNovoMed) {
        const alergiaTexto = alergias.find((a) => {
          const txt = String(
            a?.substancia ||
            a?.descricao ||
            a?.alergia ||
            a?.nome ||
            ''
          ).toLowerCase();

          return txt.includes(String(nomeMed).toLowerCase());
        });

        const respostaLocal = alergiaTexto
          ? {
            risco: 1,
            riscoalto: true,
            mensagem: `O utente pode ser alérgico a ${nomeMed}.`,
            explicacao: `Foi encontrada uma alergia potencialmente relacionada com o medicamento ${nomeMed}.`,
          }
          : {
            risco: 0,
            riscoalto: false,
            mensagem: `Não foi identificada alergia conhecida para ${nomeMed}.`,
            explicacao: `Não foram encontradas alergias diretamente associadas ao medicamento selecionado.`,
          };

        setRiscoIA(respostaLocal);
        mostrarToast('Avaliação local concluída.', 'success');
        return;
      }

      const alergiaClasse = alergias.find((a) => {
        const classeAlergia =
          a?.classe_terapeutica_id ??
          a?.classeterapeuticaid ??
          a?.classeTerapeuticaId ??
          a?.cod_classe_terapeutica;

        return String(classeAlergia) === String(classeNovoMed);
      });

      const temAlergia = alergiaClasse ? 1 : 0;

      const gravidade = alergiaClasse?.nivel_gravidade || alergiaClasse?.nivelgravidade || 'Baixa';
      const MAPA_GRAVIDADE = { Baixa: 1, Média: 2, Media: 2, Alta: 3 };
      const gravidadeAlergia = MAPA_GRAVIDADE[gravidade] || 0;

      const temInteracao = medicacaoAtiva.some((mAtivo) => {
        const medAtivo = medicamentos.find(
          (x) =>
            String(getMedicamentoId(x)) ===
            String(
              mAtivo?.cod_medicamento ??
              mAtivo?.codmedicamento ??
              mAtivo?.id_medicamento ??
              mAtivo?.idmedicamento ??
              mAtivo?.id
            )
        );

        const classeAtiva =
          medAtivo?.classe_terapeutica_id ??
          medAtivo?.classeterapeuticaid ??
          medAtivo?.classeTerapeuticaId ??
          medAtivo?.cod_classe_terapeutica;

        return String(classeAtiva) === String(classeNovoMed);
      }) ? 1 : 0;

      const idade = calcularIdade(utente?.data_nasc || utente?.datanasc);

      const res = await fetch(`${API_IA}/predict/v1/medicine-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ClasseNovoMed: Number(classeNovoMed),
          TemAlergiaClasse: temAlergia,
          GravidadeAlergia: gravidadeAlergia,
          TemInteracaoAtiva: temInteracao,
          IdadeUtente: idade,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || 'Erro na avaliação de risco.');
      }

      const riscoNormalizado = {
        risco:
          data?.risco ??
          data?.risk ??
          data?.prediction ??
          (data?.riscoalto ? 1 : 0) ??
          0,
        riscoalto:
          data?.riscoalto ??
          data?.high_risk ??
          data?.risk_high ??
          data?.risco === 1 ??
          false,
        mensagem:
          data?.mensagem ||
          data?.message ||
          (temAlergia
            ? `O utente pode ser alérgico a ${nomeMed}.`
            : `Não foi identificada alergia conhecida para ${nomeMed}.`),
        explicacao:
          data?.explicacao ||
          data?.explanation ||
          `Resultado obtido com base na classe terapêutica, alergias registadas, medicação ativa e idade do utente.`,
      };

      setRiscoIA(riscoNormalizado);
      mostrarToast('Avaliação de risco concluída.', 'success');
    } catch (e) {
      mostrarToast(e.message || 'Erro na avaliação de risco IA.', 'error');
    } finally {
      setAvaliacaoRisco(false);
    }
  };


  const submeterPrescricao = async () => {
    const idAto =
      atosRef.current?.length > 0
        ? atosRef.current[0]?.id_ato || atosRef.current[0]?.idato
        : null;

    if (!prescricao.codmedicamento) {
      mostrarToast('Seleciona um medicamento.', 'error');
      return;
    }

    if (!prescricao.dosagem) {
      mostrarToast('Indica a dosagem.', 'error');
      return;
    }

    if (!idAto) {
      mostrarToast('Não existe ato clínico associado a este episódio.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/prescricoes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idato: idAto,
          codmedicamento: Number(prescricao.codmedicamento),
          dosagem: prescricao.dosagem,
          observacoes: prescricao.observacoes || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || data?.message || 'Erro ao registar prescrição.');
      }

      mostrarToast('Prescrição registada com sucesso.', 'success');

      setPrescricao({
        codmedicamento: '',
        dosagem: '',
        observacoes: '',
      });
      setRiscoIA(null);
    } catch (e) {
      mostrarToast(e.message || 'Erro ao registar prescrição.', 'error');
    }
  };

  const submeterAltaRapida = async (ep) => {
    try {
      const r = await fetch(`${API_URL}/episodios/${ep.cod_ep_urgenc}/alta`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          destino: 'alta',
          observacoes: 'Alta rápida registada pelo médico.',
          cod_ep_urgenc: ep.cod_ep_urgenc,
        }),
      });

      if (r.ok) {
        setEpisodios((prev) => prev.filter((e) => e.cod_ep_urgenc !== ep.cod_ep_urgenc));
        mostrarToast('Alta registada.', 'success');
      }
    } catch {
      mostrarToast('Erro ao registar alta.', 'error');
    }
  };

  const submeterAlta = async () => {
    try {
      const r = await fetch(`${API_URL}/episodios/${episodioSelecionado.cod_ep_urgenc}/alta`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          ...alta,
          cod_ep_urgenc: episodioSelecionado.cod_ep_urgenc,
        }),
      });

      if (r.ok) {
        setEpisodios((prev) =>
          prev.filter((e) => e.cod_ep_urgenc !== episodioSelecionado.cod_ep_urgenc)
        );
        setEpisodioSelecionado(null);

        if (alta.destino === 'internamento') {
          await carregarInternamentos();
        }

        mostrarToast(
          alta.destino === 'internamento'
            ? 'Utente enviado para internamento.'
            : 'Alta registada.',
          'success'
        );
      }
    } catch {
      mostrarToast('Erro ao registar alta.', 'error');
    }
  };

  const submeterAltaInternamento = async () => {
    try {
      const r = await fetch(
        `${API_URL}/internamentos/${internamentoSelecionado.cod_internamento}/alta`,
        {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(altaInternamento),
        }
      );

      if (r.ok) {
        setInternamentos((prev) =>
          prev.filter((i) => i.cod_internamento !== internamentoSelecionado.cod_internamento)
        );
        setInternamentoSelecionado(null);
        mostrarToast('Alta de internamento registada.', 'success');
      }
    } catch {
      mostrarToast('Erro ao registar alta de internamento.', 'error');
    }
  };

  const episodiosOrdenados = useMemo(() => {
    return [...episodios]
      .filter((ep) => {
        if (!filtro) return true;
        const f = normalizar(filtro);
        return (
          normalizar(ep.nome_utente || '').includes(f) ||
          normalizar(ep.cor_triagem || '').includes(f)
        );
      })
      .sort(
        (a, b) =>
          (TRIAGE_ORDER[a.cor_triagem] || 9) -
          (TRIAGE_ORDER[b.cor_triagem] || 9)
      );
  }, [episodios, filtro]);

  const totalEmEspera = episodios.length;
  const altasHoje = 0;
  const totalInternamentos = internamentos.length;

  const menus = [
    { id: 'informacao_geral', label: 'Informação Geral', icon: <IconChart /> },
    { id: 'fila_triagens', label: 'Fila de Triagens', icon: <IconQueue /> },
    { id: 'internamentos', label: 'Internamentos Ativos', icon: <IconBed /> },
  ];

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

  const renderFilaTriagens = () => {
    const getEstadoEpisodio = (ep) =>
      normalizar(ep?.estado || ep?.estado_episodio || ep?.estadoepisodio || '');

    const episodiosEmEspera = episodiosOrdenados.filter((ep) => {
      const estado = getEstadoEpisodio(ep);
      return (
        estado === 'triado' ||
        estado === 'triagem concluida' ||
        estado === 'triagem concluída' ||
        estado === 'em_espera' ||
        estado === 'em espera'
      );
    });

    const episodiosTriados = episodiosOrdenados.filter((ep) => {
      const estado = getEstadoEpisodio(ep);
      return (
        estado === 'em_triagem' ||
        estado === 'em triagem' ||
        estado === 'triado'
      );
    });

    const episodiosAtendimento = episodiosOrdenados.filter((ep) => {
      const estado = getEstadoEpisodio(ep);
      return (
        estado === 'em_atendimento' ||
        estado === 'em atendimento' ||
        estado === 'atendimento'
      );
    });

    const episodiosConcluidos = episodiosOrdenados.filter((ep) => {
      const estado = getEstadoEpisodio(ep);
      return (
        estado === 'terminado' ||
        estado === 'concluido' ||
        estado === 'concluído' ||
        estado === 'alta' ||
        estado === 'internado'
      );
    });

    const listaAtual =
      subMenuFila === 'em_espera'
        ? episodiosEmEspera
        : subMenuFila === 'triados'
          ? episodiosTriados
          : subMenuFila === 'atendimento'
            ? episodiosAtendimento
            : episodiosConcluidos;

    if (subMenuFila === 'atendimento' && episodioSelecionado) {
      return renderAtendimento();
    }

    return (
      <div className="doctor-panel-card">
        <SectionHeader
          title="Fila de Triagens"
          subtitle="Organizada da prioridade mais urgente para a menos urgente"
        />

        <div className="doctor-toolbar-row">
          <div className="doctor-menu-pills">
            <button
              type="button"
              className={`doctor-pill ${subMenuFila === 'em_espera' ? 'is-active' : ''}`}
              onClick={() => {
                setSubMenuFila('em_espera');
                setEpisodioSelecionado(null);
              }}
            >
              Em espera
            </button>

            <button
              type="button"
              className={`doctor-pill ${subMenuFila === 'triados' ? 'is-active' : ''}`}
              onClick={() => {
                setSubMenuFila('triados');
                setEpisodioSelecionado(null);
              }}
            >
              Triados
            </button>

            <button
              type="button"
              className={`doctor-pill ${subMenuFila === 'atendimento' ? 'is-active' : ''}`}
              onClick={() => setSubMenuFila('atendimento')}
            >
              Atendimento
            </button>

            <button
              type="button"
              className={`doctor-pill ${subMenuFila === 'concluidos' ? 'is-active' : ''}`}
              onClick={() => {
                setSubMenuFila('concluidos');
                setEpisodioSelecionado(null);
              }}
            >
              Concluídos
            </button>
          </div>

          <input
            className="doctor-search-input"
            type="text"
            placeholder="Utente, cor ou episódio..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr>
                <th>Episódio</th>
                <th>Utente</th>
                <th>Triagem</th>
                <th>Espera</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {listaAtual.length === 0 ? (
                <tr>
                  <td colSpan="5" className="doctor-table-empty">
                    {subMenuFila === 'em_espera'
                      ? 'Sem episódios em espera.'
                      : subMenuFila === 'triados'
                        ? 'Sem episódios triados.'
                        : subMenuFila === 'atendimento'
                          ? 'Sem episódios em atendimento.'
                          : 'Sem episódios concluídos.'}
                  </td>
                </tr>
              ) : (
                listaAtual.map((ep) => {
                  const codEpisodio = ep.cod_ep_urgenc || ep.codepurgenc;
                  const nomeUtente = ep.nome_utente || ep.nomeutente || '—';
                  const corTriagem = ep.cor_triagem || ep.cortriagem || '—';
                  const tempoEspera = ep.tempo_espera_previsto || ep.tempoesperaprevisto;

                  return (
                    <tr key={codEpisodio}>
                      <td>#{codEpisodio}</td>
                      <td>{nomeUtente}</td>
                      <td>
                        <span className={TRIAGE_CLASS[corTriagem] || 'triage-badge'}>
                          {corTriagem}
                        </span>
                      </td>
                      <td>{tempoEspera ? `${tempoEspera} min` : '—'}</td>
                      <td>
                        <div className="doctor-actions-inline">
                          {subMenuFila !== 'concluidos' && subMenuFila !== 'atendimento' && (
                            <>
                              <button
                                type="button"
                                className="doctor-action-btn doctor-action-btn--secondary"
                                onClick={() => submeterAltaRapida(ep)}
                              >
                                Dar alta
                              </button>

                              <button
                                type="button"
                                className="doctor-action-btn doctor-action-btn--primary"
                                onClick={() => {
                                  setSubMenuFila('atendimento');
                                  carregarDadosEpisodio(ep);
                                }}
                              >
                                Atender
                              </button>
                            </>
                          )}

                          {subMenuFila === 'atendimento' && (
                            <button
                              type="button"
                              className="doctor-action-btn doctor-action-btn--primary"
                              onClick={() => carregarDadosEpisodio(ep)}
                            >
                              Abrir
                            </button>
                          )}

                          {subMenuFila === 'concluidos' && (
                            <span className="doctor-muted-text">Sem ações disponíveis</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
      '—';

    const codEpisodio =
      episodioSelecionado?.cod_ep_urgenc ||
      episodioSelecionado?.codepurgenc ||
      '—';

    const tempoEspera =
      episodioSelecionado?.tempo_espera_previsto ||
      episodioSelecionado?.tempoesperaprevisto;

    const corTriagem =
      episodioSelecionado?.cor_triagem ||
      episodioSelecionado?.cortriagem ||
      '—';

    return (
      <div className="doctor-panel-card doctor-panel-card--wide">
        <div className="doctor-patient-banner">
          <div>
            <button
              type="button"
              className="doctor-back-link"
              onClick={() => {
                setEpisodioSelecionado(null);
                setModoEdicaoTriagem(false);
                setTabAtendimento('vitais');
                setSubMenuFila('triados');
              }}
            >
              ← Voltar à fila
            </button>

            <h3 className="doctor-patient-banner__name">{nomeUtente}</h3>

            <p className="doctor-patient-banner__meta">
              Episódio #{codEpisodio}
              {tempoEspera ? ` · Espera: ${tempoEspera} min` : ''}
            </p>
          </div>

          <span className={TRIAGE_CLASS[corTriagem] || 'triage-badge'}>
            {corTriagem}
          </span>
        </div>

        <div className="doctor-tabs-row">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`doctor-tab-btn ${tabAtendimento === id ? 'is-active' : ''}`}
              onClick={() => setTabAtendimento(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="doctor-tab-panel">
          {tabAtendimento === 'vitais' && renderTabVitais()}
          {tabAtendimento === 'prescricao' && renderTabPrescricao()}
          {tabAtendimento === 'decisao' && renderTabDecisao()}
        </div>
      </div>
    );
  };

  const renderTabVitais = () => {
    const campos = [
      ['Cor de Triagem', 'cortriagem', 'select', ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']],
      ['Temperatura (°C)', 'temperatura', 'number'],
      ['Freq. Cardíaca (bpm)', 'freqcard', 'number'],
      ['Freq. Respiratória (rpm)', 'freqresp', 'number'],
      ['SpO2 (%)', 'spo2', 'number'],
      ['Nível de Dor', 'niveldor', 'number'],
      ['Consciência', 'consciencia', 'select', ['Acordado', 'Confuso', 'Inconsciente']],
    ];

    return (
      <div className="doctor-stacked-sections">
        <section className="doctor-subcard">
          <div className="doctor-tab-topbar">
            <SectionHeader
              title="Dados vitais da triagem"
              subtitle="Registos clínicos iniciais e parâmetros observados"
            />

            {!modoEdicaoTriagem ? (
              <button
                type="button"
                className="doctor-action-btn doctor-action-btn--secondary"
                onClick={() => setModoEdicaoTriagem(true)}
              >
                Editar dados
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

          <div className="doctor-vitals-grid">
            {campos.map(([label, campo, tipo, opts]) => (
              <div key={campo} className="doctor-info-card">
                <span className="doctor-info-card__label">{label}</span>

                {modoEdicaoTriagem ? (
                  tipo === 'select' ? (
                    <select
                      className="doctor-field"
                      value={formTriagem[campo]}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))
                      }
                    >
                      {opts.map((o, index) => (
                        <option key={`${campo}-${index}-${o}`} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="doctor-field"
                      type={tipo}
                      value={formTriagem[campo]}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))
                      }
                    />
                  )
                ) : (
                  <span className="doctor-info-card__value">
                    {dadosTriagem?.[campo] ?? '—'}
                  </span>
                )}
              </div>
            ))}

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Tensão Arterial</span>

              {modoEdicaoTriagem ? (
                <div className="doctor-bp-grid">
                  <input
                    className="doctor-field"
                    type="number"
                    placeholder="Sistólica"
                    value={formTriagem.sistolica}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({ ...prev, sistolica: e.target.value }))
                    }
                  />
                  <input
                    className="doctor-field"
                    type="number"
                    placeholder="Diastólica"
                    value={formTriagem.diastolica}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({ ...prev, diastolica: e.target.value }))
                    }
                  />
                </div>
              ) : (
                <span className="doctor-info-card__value">
                  {dadosTriagem?.sistolica ?? '—'} / {dadosTriagem?.diastolica ?? '—'} mmHg
                </span>
              )}
            </div>

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Sintomas</span>
              <span className="doctor-info-card__value">{dadosTriagem?.sintomas || '—'}</span>
            </div>

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Enfermeiro</span>
              <span className="doctor-info-card__value">
                {dadosTriagem?.nomeenfermeiro || '—'}
              </span>
            </div>
          </div>
        </section>

        <section className="doctor-subcard">
          <SectionHeader
            title="Antecedentes"
            subtitle="Histórico pessoal e clínico relevante do utente"
          />

          {antecedentes && Object.keys(antecedentes).length > 0 ? (
            <div className="doctor-vitals-grid">
              {Object.entries(antecedentes).map(([k, v]) => (
                <div key={k} className="doctor-info-card">
                  <span className="doctor-info-card__label">
                    {k.replaceAll('_', ' ')}
                  </span>
                  <span className="doctor-info-card__value">
                    {Array.isArray(v) ? v.join(', ') : String(v)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="doctor-empty-box">Sem antecedentes registados.</div>
          )}
        </section>

        <section className="doctor-subcard">
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
                    <tr key={a.idato || a.id_ato}>
                      <td>{a.idato || a.id_ato}</td>
                      <td>{a.tipo || '—'}</td>
                      <td>{a.descricao || '—'}</td>
                      <td>
                        {a.datahorainicio
                          ? new Date(a.datahorainicio).toLocaleString('pt-PT')
                          : '—'}
                      </td>
                      <td>
                        {a.datahorafim
                          ? new Date(a.datahorafim).toLocaleString('pt-PT')
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
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

  const renderTabMedicacao = () => (
    <div>
      <SectionHeader
        title="Medicação ativa"
        subtitle="Terapêutica habitual e medicação atualmente registada"
      />

      {medicacaoAtiva.length === 0 ? (
        <div className="doctor-empty-box">Nenhum medicamento ativo associado.</div>
      ) : (
        <div className="doctor-alert-list">
          {medicacaoAtiva.map((m, i) => {
            const medId = String(
              m?.codmedicamento ??
              m?.cod_medicamento ??
              m?.idmedicamento ??
              m?.id_medicamento ??
              m?.id ??
              ''
            );

            const medCatalogo = medicamentos.find(
              (med, index) => String(getMedicamentoId(med, index)) === medId
            );

            const nome =
              getMedicamentoNome(m, i) ||
              getMedicamentoNome(medCatalogo, i) ||
              `Medicamento ${i + 1}`;

            return (
              <div key={`med-ativa-${i}`} className="doctor-med-item">
                <strong>{nome}</strong>
                <span>
                  {m?.dosagem ? `Dosagem: ${m.dosagem}` : 'Sem dosagem registada'}
                  {m?.observacoes ? ` · ${m.observacoes}` : ''}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderTabPrescricao = () => (
    <div className="doctor-stacked-sections">
      <section className="doctor-subcard">
        <SectionHeader
          title="Medicação ativa"
          subtitle="Terapêutica habitual e medicação atualmente registada"
        />

        {medicacaoAtiva.length === 0 ? (
          <div className="doctor-empty-box">Nenhum medicamento ativo associado.</div>
        ) : (
          <div className="doctor-alert-list">
            {medicacaoAtiva.map((m, i) => {
              const medId = String(
                m?.codmedicamento ??
                m?.cod_medicamento ??
                m?.idmedicamento ??
                m?.id_medicamento ??
                m?.id ??
                ''
              );

              const medCatalogo = medicamentos.find(
                (med) => String(getMedicamentoId(med)) === medId
              );

              const nome =
                getMedicamentoNome(m, i) ||
                getMedicamentoNome(medCatalogo, i) ||
                `Medicamento ${i + 1}`;

              return (
                <div key={`med-ativa-${i}`} className="doctor-med-item">
                  <strong>{nome}</strong>
                  <span>
                    {m?.dosagem ? `Dosagem: ${m.dosagem}` : 'Sem dosagem registada'}
                    {m?.observacoes ? ` · ${m.observacoes}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="doctor-subcard">
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
      </section>

      <section className="doctor-subcard">
        <SectionHeader
          title="Prescrever medicação"
          subtitle="Selecionar fármaco, validar risco e emitir prescrição"
        />

        <div className="doctor-form-grid">
          <div>
            <label>Medicamento</label>
            <select
              className="doctor-field"
              name="codmedicamento"
              value={prescricao.codmedicamento || ''}
              onChange={handlePrescricaoChange}
            >
              <option value="">Selecione...</option>

              {Array.isArray(medicamentos) &&
                medicamentos.map((m, index) => {
                  const medId = getMedicamentoId(m, index);
                  const medNome = getMedicamentoNome(m, index);
                  const principio = m?.principioativo || m?.principio_ativo || '';

                  return (
                    <option key={`med-${medId}-${index}`} value={medId}>
                      {principio && principio !== medNome
                        ? `${medNome} — ${principio}`
                        : medNome}
                    </option>
                  );
                })}
            </select>

            {Array.isArray(medicamentos) && medicamentos.length === 0 && (
              <div className="doctor-empty-box" style={{ marginTop: '0.5rem' }}>
                Catálogo de medicamentos vazio.
              </div>
            )}
          </div>

          <div>
            <label>Dosagem</label>
            <input
              className="doctor-field"
              type="text"
              name="dosagem"
              value={prescricao.dosagem}
              onChange={handlePrescricaoChange}
            />
          </div>

          <div className="doctor-form-grid-full">
            <label>Observações</label>
            <input
              className="doctor-field"
              type="text"
              name="observacoes"
              value={prescricao.observacoes}
              onChange={handlePrescricaoChange}
            />
          </div>
        </div>

        {alergias.length > 0 ? (
          <div className="doctor-risk-box">
            {riscoIA ? (
              <div
                className={`doctor-risk-result ${riscoIA?.risco === 1 || riscoIA?.riscoalto ? 'is-danger' : 'is-safe'
                  }`}
                style={{ marginBottom: '0.75rem' }}
              >
                <strong>
                  {riscoIA?.risco === 1 || riscoIA?.riscoalto
                    ? 'Utente com risco/alergia para a medicação selecionada'
                    : 'Sem alergia conhecida para a medicação selecionada'}
                </strong>
                <span>{riscoIA?.mensagem || riscoIA?.explicacao || 'Avaliação concluída.'}</span>
              </div>
            ) : null}

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
          <div className="doctor-empty-box">
            O utente não tem alergias registadas para validação automática.
          </div>
        )}

        <div className="doctor-actions-inline" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="doctor-action-btn doctor-action-btn--primary"
            onClick={submeterPrescricao}
            disabled={!prescricao.codmedicamento || !prescricao.dosagem}
          >
            Registar prescrição
          </button>

          <button
            type="button"
            className="doctor-action-btn doctor-action-btn--secondary"
            onClick={imprimirPrescricao}
          >
            Imprimir prescrição
          </button>
        </div>
      </section>
    </div>
  );

  const imprimirPrescricao = () => {
    const nomeUtente =
      utente?.nome ||
      episodioSelecionado?.nome_utente ||
      episodioSelecionado?.nomeutente ||
      '—';

    const numeroUtente =
      utente?.num_utente ||
      utente?.numutent ||
      utente?.codutente ||
      episodioSelecionado?.codutente ||
      '—';

    const dataNascimento =
      utente?.data_nasc ||
      utente?.datanasc ||
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

    const codEpisodio =
      episodioSelecionado?.cod_ep_urgenc ||
      episodioSelecionado?.codepurgenc ||
      '—';

    const corTriagem =
      episodioSelecionado?.cor_triagem ||
      episodioSelecionado?.cortriagem ||
      '—';

    const medicamentoSelecionado = medicamentos.find(
      (m) => String(m.codmedicamento || m.id) === String(prescricao.codmedicamento)
    );

    const nomeMedicamento =
      medicamentoSelecionado?.nome ||
      medicamentoSelecionado?.nomemedicamento ||
      '—';

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
          * {
            box-sizing: border-box;
          }

          :root {
            --ink: #1f2937;
            --muted: #6b7280;
            --line: #d7dde5;
            --soft: #eef3f7;
            --soft-2: #f8fafc;
            --brand: #0f766e;
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

          body {
            padding: 32px 20px;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
            position: relative;
            overflow: hidden;
          }

          .page::before {
            content: "";
            display: block;
            height: 10px;
            background: linear-gradient(90deg, #0f766e 0%, #155e75 100%);
          }

          .sheet {
            padding: 32px 36px 28px;
          }

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
            background: linear-gradient(135deg, #0f766e 0%, #155e75 100%);
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

          .section {
            margin-bottom: 22px;
          }

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
            background: linear-gradient(90deg, #0f766e 0%, #155e75 100%);
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
                        <th>Via / Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="rx-main">${nomeMedicamento}</div>
                          <div>Prescrição individual do episódio #${codEpisodio}</div>
                        </td>
                        <td>${prescricao.dosagem || '—'}</td>
                        <td>${prescricao.observacoes || 'Sem observações adicionais.'}</td>
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



  const renderTabDecisao = () => (
    <div>
      <SectionHeader title="Decisão clínica" subtitle="Alta ou internamento" />

      <div className="doctor-form-grid">
        <div>
          <label>Destino</label>
          <select
            className="doctor-field"
            value={alta.destino}
            onChange={(e) => setAlta((prev) => ({ ...prev, destino: e.target.value }))}
          >
            <option value="alta">Alta</option>
            <option value="internamento">Internamento</option>
          </select>
        </div>

        {alta.destino === 'internamento' && (
          <>
            <div>
              <label>Serviço</label>
              <select
                className="doctor-field"
                value={alta.servico}
                onChange={(e) => setAlta((prev) => ({ ...prev, servico: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {SERVICOS.map((s, index) => (
                  <option key={`servico-${index}-${s}`} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>N.º Cama</label>
              <input
                className="doctor-field"
                type="text"
                value={alta.numero_cama}
                onChange={(e) =>
                  setAlta((prev) => ({ ...prev, numero_cama: e.target.value }))
                }
              />
            </div>

            <div className="doctor-form-grid__full">
              <label>Motivo</label>
              <select
                className="doctor-field"
                value={alta.motivo_int}
                onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {MOTIVOS_INTERNAMENTO.map((m, index) => (
                  <option key={`motivo-${index}-${m}`} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {alta.motivo_int === 'Outro' && (
              <div className="doctor-form-grid__full">
                <label>Especificar motivo</label>
                <input
                  className="doctor-field"
                  type="text"
                  value={alta.motivo_int_outro}
                  onChange={(e) =>
                    setAlta((prev) => ({ ...prev, motivo_int_outro: e.target.value }))
                  }
                />
              </div>
            )}
          </>
        )}

        <div className="doctor-form-grid__full">
          <label>Observações</label>
          <textarea
            className="doctor-field"
            rows="4"
            value={alta.observacoes}
            onChange={(e) => setAlta((prev) => ({ ...prev, observacoes: e.target.value }))}
          />
        </div>
      </div>

      <button className="doctor-action-btn doctor-action-btn--primary" onClick={submeterAlta}>
        {alta.destino === 'internamento' ? 'Enviar para internamento' : 'Registar alta'}
      </button>
    </div>
  );

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
                value={prescricao.codmedicamento}
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
                value={prescricao.dosagem}
                onChange={(e) =>
                  setPrescricao((prev) => ({ ...prev, dosagem: e.target.value }))
                }
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
          {activeMenu === 'fila_triagens' && renderFilaTriagens()}
          {activeMenu === 'internamentos' && renderInternamentos()}
        </div>

        <FooterLayout />
      </div>
    </div>
  );
}