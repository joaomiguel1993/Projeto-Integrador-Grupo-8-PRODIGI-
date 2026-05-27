/**
 * @file AdminDashboard.jsx
 * @description Painel central de gestão para os administradores do sistema SIAGUH.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import React from "react";
import '../../styles/main.css';
import { apiFetch } from '../../services/api';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLES, STORAGE_KEYS } from '../../constants/roles';
import { FiUserPlus, FiEdit2, FiLock, FiMenu } from 'react-icons/fi';
import * as XLSX from "xlsx";

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const gerarUsername = (nome) => {
  const partes = normalizar(nome).trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  if (partes.length === 1) return partes[0];
  return `${partes[0]}.${partes[partes.length - 1]}`;
};

const extrairHospitais = (entidade) => {
  if (!entidade) return [];

  let ids = [];
  let raw =
    entidade?.hospitais ??
    entidade?.hospitalid ??
    entidade?.id_hosp ??
    entidade?.idhosp;

  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      // ignorar
    }
  }

  if (Array.isArray(raw)) {
    ids = raw.map((h) =>
      typeof h === 'object' && h !== null
        ? h?.id_hosp ?? h?.idhosp ?? h?.idHosp ?? h?.id
        : h
    );
  } else {
    if (entidade?.id_hosp) ids.push(entidade.id_hosp);
    if (entidade?.idhosp) ids.push(entidade.idhosp);
    if (entidade?.hospitalid) ids.push(entidade.hospitalid);
    if (entidade?.idHospital) ids.push(entidade.idHospital);
  }

  return [...new Set(
    ids
      .filter((val) => val !== null && val !== undefined && val !== '')
      .map(Number)
      .filter((val) => !Number.isNaN(val) && val > 0)
  )];
};

const mapHospitalFromApi = (hospital) => ({
  ...hospital,
  idhosp: Number(
    hospital?.id_hosp ??
    hospital?.idhosp ??
    hospital?.idHosp ??
    hospital?.id ??
    0
  ),
  nome: hospital?.nome ?? '',
  email: hospital?.email ?? '',
  localidade: hospital?.localizacao ?? hospital?.localidade ?? '',
  contacto: hospital?.telefone ?? hospital?.contacto ?? '',
});

const obterIdFunc = (item) =>
  item?.id_func ??
  item?.idfunc ??
  item?.idFunc ??
  item?.IdFunc ??
  item?.funcionario?.id_func ??
  item?.funcionario?.idfunc ??
  item?.funcionario?.idFunc ??
  null;


const valorTexto = (...candidatos) => {
  for (const candidato of candidatos) {

    if (typeof candidato === 'object' && candidato !== null) {
      continue;
    }
    const texto = String(candidato ?? '').trim();
    if (
      texto &&
      texto !== '[object Object]'
    ) {
      return texto;
    }
  }

  return '';
};

const obterNome = (item) =>
  item?.nome ??
  item?.Nome ??
  item?.funcionario?.nome ??
  item?.funcionario?.Nome ??
  '—';

const obterTipoFuncRaw = (item) =>
  valorTexto(
    item?.role,
    item?.tipofunc,
    item?.tipo_func,
    item?.TipoFunc,
    item?.funcionario?.role,
    item?.funcionario?.tipofunc,
    item?.funcionario?.tipo_func,
    item?.funcionario?.TipoFunc
  );

const obterFuncaoTraduzida = (item, textos) => {
  const valor =
    item?.tipo_func ??
    item?.tipofunc ??
    item?.TipoFunc ??
    item?.role ??
    item?.funcionario?.tipo_func ??
    item?.funcionario?.tipofunc ??
    item?.funcionario?.TipoFunc ??
    '';

  const v = String(valor).toLowerCase();

  if (v === 'admin') return textos.admin.roleAdmin;
  if (v === 'medico') return textos.admin.roleMedico;
  if (v === 'enfermeiro') return textos.admin.roleEnfermeiro;
  if (v === 'rececionista') return textos.admin.roleRececionista;

  return valor || '—';
};

const exportarRelatorioExcel = (dados) => {
  const lista = Array.isArray(dados) ? dados : [];

  if (lista.length === 0) {
    alert(ta('semHistorico', 'Sem histórico.'));
    return;
  }

  const extrairDataHora = (valor) => {
    if (!valor) return { data: '', hora: '' };
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return { data: String(valor), hora: '' };

    return {
      data: d.toLocaleDateString('pt-PT'),
      hora: d.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  const rows = lista.map((log) => {
    const { data, hora } = extrairDataHora(log.criado_em || log.data);

    return {
      Data: data,
      Hora: hora,
      Utilizador: log.username || '',
      Ação: log.acao || '',
      Detalhe: log.detalhe || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  ws['!cols'] = [
    { wch: 14 },
    { wch: 10 },
    { wch: 20 },
    { wch: 30 },
    { wch: 70 },
  ];

  ws['!autofilter'] = { ref: `A1:E${rows.length + 1}` };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatórios');
  XLSX.writeFile(wb, 'relatorio_logs.xlsx');
};

const obterNumFunc = (item) => obterIdFunc(item);

const getText = (path, fallback, textos) => {
  const parts = path.split('.');
  let cur = textos;
  for (const p of parts) cur = cur?.[p];
  return cur ?? fallback;
};

const Button = ({ children, className = '', ...props }) => (
  <button className={className} {...props}>{children}</button>
);

const SelectorHospitais = ({
  hospitaisDisponiveisTotais = [],
  valoresSelecionados = [],
  onChange,
  pesquisaDisponiveis = '',
  onPesquisaDisponiveisChange,
  pesquisaSelecionados = '',
  onPesquisaSelecionadosChange,
  textos = {},
}) => {
  const {
    hospitaisDisponiveis = 'Hospitais disponíveis',
    hospitaisSelecionados = 'Hospitais selecionados',
    semHospitaisDisponiveis = 'Sem hospitais disponíveis.',
    nenhumHospitalSelecionado = 'Nenhum hospital selecionado.',
    semLocalizacao = 'Sem localização',
    adicionar = 'Adicionar',
    remover = 'Remover',
    pesquisarHospital = 'Pesquisar hospital',
  } = textos;

  const getHospitalId = (h) => Number(h?.idhosp ?? h?.id_hosp ?? h?.idHosp ?? h?.id ?? 0);

  const idsSelecionados = (valoresSelecionados || [])
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id) && id > 0);

  const termoDisponiveis = normalizar(pesquisaDisponiveis);
  const termoSelecionados = normalizar(pesquisaSelecionados);

  const disponiveis = hospitaisDisponiveisTotais.filter((h) => {
    const id = getHospitalId(h);
    const nome = normalizar(h?.nome ?? '');
    const localidade = normalizar(h?.localidade ?? h?.localizacao ?? '');
    return !idsSelecionados.includes(id) && (nome.includes(termoDisponiveis) || localidade.includes(termoDisponiveis));
  });

  const selecionadosFiltrados = hospitaisDisponiveisTotais.filter((h) => {
    const id = getHospitalId(h);
    const nome = normalizar(h?.nome ?? '');
    const localidade = normalizar(h?.localidade ?? h?.localizacao ?? '');
    return idsSelecionados.includes(id) && (nome.includes(termoSelecionados) || localidade.includes(termoSelecionados));
  });

  const adicionarHospital = (idHosp) => {
    const id = Number(idHosp);
    const novos = [...idsSelecionados, id].filter((v, i, arr) => arr.indexOf(v) === i);
    onChange(novos);
  };

  const removerHospital = (idHosp) => {
    const id = Number(idHosp);
    const novos = idsSelecionados.filter((item) => item !== id);
    onChange(novos);
  };

  return (
    <div className="selector-hospitais">
      <div className="selector-hospitais-coluna">
        <h4 className="selector-hospitais-titulo">{hospitaisDisponiveis}</h4>
        <input
          type="text"
          className="selector-hospitais-search"
          value={pesquisaDisponiveis}
          onChange={(e) => onPesquisaDisponiveisChange?.(e.target.value)}
          placeholder={pesquisarHospital}
        />
        <div className="selector-hospitais-lista">
          {disponiveis.length === 0 ? (
            <p className="selector-hospitais-vazio">{semHospitaisDisponiveis}</p>
          ) : (
            disponiveis.map((h) => (
              <div key={getHospitalId(h)} className="selector-hospitais-item">
                <div className="selector-hospitais-info">
                  <span className="selector-hospitais-nome">{h.nome}</span>
                  <span className="selector-hospitais-meta">{h.localidade || semLocalizacao}</span>
                </div>
                <button
                  type="button"
                  className="selector-hospitais-acao selector-hospitais-acao--add"
                  onClick={() => adicionarHospital(getHospitalId(h))}
                >
                  {adicionar}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="selector-hospitais-coluna">
        <h4 className="selector-hospitais-titulo">{hospitaisSelecionados}</h4>
        <input
          type="text"
          className="selector-hospitais-search"
          value={pesquisaSelecionados}
          onChange={(e) => onPesquisaSelecionadosChange?.(e.target.value)}
          placeholder={pesquisarHospital}
        />
        <div className="selector-hospitais-lista">
          {selecionadosFiltrados.length === 0 ? (
            <p className="selector-hospitais-vazio">{nenhumHospitalSelecionado}</p>
          ) : (
            selecionadosFiltrados.map((h) => (
              <div key={getHospitalId(h)} className="selector-hospitais-item">
                <div className="selector-hospitais-info">
                  <span className="selector-hospitais-nome">{h.nome}</span>
                  <span className="selector-hospitais-meta">{h.localidade || semLocalizacao}</span>
                </div>
                <button
                  type="button"
                  className="selector-hospitais-acao selector-hospitais-acao--remove"
                  onClick={() => removerHospital(getHospitalId(h))}
                >
                  {remover}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { textos, idioma, mudarIdioma } = useLanguage();
  const tAdmin = textos?.admin || {};
  const tGeral = textos?.geral || {};

  const [pesquisaHospitalAssociacao, setPesquisaHospitalAssociacao] = useState('');

  const tt = (key, fallback) => tGeral?.[key] ?? fallback;
  const ta = (key, fallback) => tAdmin?.[key] ?? fallback;


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('utilizadores');
  const [userView, setUserView] = useState('lista');
  const [employeeView, setEmployeeView] = useState('lista');
  const [hospitalView, setHospitalView] = useState('lista');

  const [profissionais, setProfissionais] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [hospitais, setHospitais] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [logs, setLogs] = useState([]);

  const [loadingProfissionais, setLoadingProfissionais] = useState(false);
  const [loadingUtilizadores, setLoadingUtilizadores] = useState(false);
  const [loadingHospitais, setLoadingHospitais] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [erroProfissionais, setErroProfissionais] = useState('');
  const [erroUtilizadores, setErroUtilizadores] = useState('');
  const [erroHospitais, setErroHospitais] = useState('');
  const [erroLogs, setErroLogs] = useState('');

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [pesquisaFuncionarioNovoUser, setPesquisaFuncionarioNovoUser] = useState('');

  const [filtroUserUsername, setFiltroUserUsername] = useState('');
  const [filtroUserNome, setFiltroUserNome] = useState('');
  const [filtroUserNumero, setFiltroUserNumero] = useState('');

  const [filtroFuncNome, setFiltroFuncNome] = useState('');
  const [filtroFuncNumero, setFiltroFuncNumero] = useState('');
  const [filtroFuncTipo, setFiltroFuncTipo] = useState('');

  const [filtroHospitalNome, setFiltroHospitalNome] = useState('');
  const [filtroHospitalLocalidade, setFiltroHospitalLocalidade] = useState('');

  const [filtroLogTermo, setFiltroLogTermo] = useState('');
  const [filtroLogData, setFiltroLogData] = useState('');
  const [tipoAcao, setTipoAcao] = useState('');

  const [novoUtilizador, setNovoUtilizador] = useState({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] });
  const [novoProfissional, setNovoProfissional] = useState({ nome: '', tipo_func: ROLES.ADMIN, sexo: 'M', hospitais: [] });
  const [novoHospital, setNovoHospital] = useState({ nome: '', email: '', localidade: '', contacto: '' });

  const [utilizadorEditando, setUtilizadorEditando] = useState(null);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [hospitalEditando, setHospitalEditando] = useState(null);

  const [mensagemUser, setMensagemUser] = useState('');
  const [erroUser, setErroUser] = useState('');
  const [submittingUser, setSubmittingUser] = useState(false);

  const [mensagemFunc, setMensagemFunc] = useState('');
  const [erroFunc, setErroFunc] = useState('');
  const [submittingFunc, setSubmittingFunc] = useState(false);

  const [mensagemHospital, setMensagemHospital] = useState('');
  const [erroHospital, setErroHospital] = useState('');
  const [submittingHospital, setSubmittingHospital] = useState(false);

  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState(ta('tituloPainel', 'Administrator Panel'));
  const [fotoUtilizador, setFotoUtilizador] = useState('');

  const breadcrumbsLinks = [
    { name: tt('inicio', 'Início'), path: '/' },
    { name: ta('tituloPainel', 'Administrator Panel'), path: '/admin' },
  ];

  const resetMensagens = () => {
    setMensagemUser(''); setErroUser('');
    setMensagemFunc(''); setErroFunc('');
    setMensagemHospital(''); setErroHospital('');
    setErroProfissionais(''); setErroUtilizadores(''); setErroHospitais(''); setErroLogs('');
  };

  const adicionarHistorico = (acao, detalhe) => {
    setHistorico((prev) => [
      {
        id: Date.now(),
        acao,
        detalhe,
        username: funcionarioAutenticadoNome || 'Sistema',
        data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB'),
      },
      ...prev,
    ]);
  };

  const resolverUtilizadorAutenticado = () => {
    try {
      const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA) || sessionStorage.getItem('user');
      const userObj = rawUser ? JSON.parse(rawUser) : null;

      if (userObj?.nome) setFuncionarioAutenticadoNome(userObj.nome);
      else if (userObj?.username) setFuncionarioAutenticadoNome(userObj.username);
      else setFuncionarioAutenticadoNome(ta('tituloPainel', 'Administrator Panel'));

      let fotoGuardada = userObj?.foto_url || userObj?.foto || userObj?.avatar || userObj?.fotoPerfil || userObj?.imagem || '';
      if (fotoGuardada && !fotoGuardada.startsWith('http://') && !fotoGuardada.startsWith('https://') && !fotoGuardada.startsWith('blob:')) {
        const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_OPEN_APIURL || '';
        if (apiBase) {
          const cleanBase = apiBase.replace(/\/+$/, '');
          const cleanSrc = fotoGuardada.replace(/^\/+/, '');
          fotoGuardada = `${cleanBase}/${cleanSrc}`;
        } else {
          fotoGuardada = fotoGuardada.startsWith('/') ? fotoGuardada : `/${fotoGuardada}`;
        }
      }
      setFotoUtilizador(fotoGuardada);
    } catch {
      setFuncionarioAutenticadoNome(ta('tituloPainel', 'Administrator Panel'));
      setFotoUtilizador('');
    }
  };

  const obterIniciais = (nome = '') =>
    String(nome)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() || '')
      .join('');

  const fazerLogout = () => {
    sessionStorage.removeItem('user');
    Object.values(STORAGE_KEYS).forEach((key) => sessionStorage.removeItem(key));
    navigate('/');
  };

  const carregarProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      setErroProfissionais('');
      const data = await apiFetch('/api/v1/profissionais/');
      setProfissionais(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroProfissionais(err.message);
      setProfissionais([]);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  const carregarUtilizadores = async () => {
    try {
      setLoadingUtilizadores(true);
      setErroUtilizadores('');
      const data = await apiFetch('/api/v1/utilizadores/');
      const normalizados = Array.isArray(data)
        ? data.map((u) => ({
          ...u,
          idfunc: Number(u?.idfunc ?? u?.id_func ?? u?.id ?? 0),
        }))
        : [];
      setUtilizadores(normalizados);
    } catch (err) {
      setErroUtilizadores(err.message);
      setUtilizadores([]);
    } finally {
      setLoadingUtilizadores(false);
    }
  };

  const carregarHospitais = async () => {
    try {
      setLoadingHospitais(true);
      setErroHospitais('');
      const data = await apiFetch('/api/v1/hospitais/');
      setHospitais(Array.isArray(data) ? data.map(mapHospitalFromApi) : []);
    } catch (err) {
      setErroHospitais(err.message);
      setHospitais([]);
    } finally {
      setLoadingHospitais(false);
    }
  };

  const carregarLogs = async () => {
    try {
      setLoadingLogs(true);
      setErroLogs('');
      const data = await apiFetch('/api/v1/logs/');
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroLogs(err.message);
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const carregarTudo = async () => {
    await Promise.all([carregarProfissionais(), carregarUtilizadores(), carregarHospitais()]);
  };


  useEffect(() => {
    console.log('PROFISSIONAIS', profissionais);
  }, [profissionais]);

  useEffect(() => { carregarTudo(); iniciarHistoricoBase(); }, []);
  useEffect(() => { resolverUtilizadorAutenticado(); }, [profissionais, utilizadores, tAdmin.tituloPainel]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownAberto(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    if (mainMenu === 'relatorios') carregarLogs();
  }, [mainMenu]);

  useEffect(() => {
    if (profissionais.length > 0) {
      carregarHospitaisPorFuncionario();
    }
  }, [profissionais]);

  function iniciarHistoricoBase() {
    setHistorico([
      {
        id: 1,
        acao: 'Sistema iniciado',
        detalhe: 'O painel de administração foi carregado.',
        username: 'Sistema',
        data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB'),
      },
    ]);
  }

  const idsComConta = useMemo(
    () => new Set(utilizadores.map((u) => Number(obterIdFunc(u))).filter(Boolean)),
    [utilizadores]
  );

  const logsFiltrados = useMemo(() => {
    let resultado = logs;

    // filtrar por termo (ação, detalhe, username)
    if (filtroLogTermo) {
      const termo = normalizar(filtroLogTermo);
      resultado = resultado.filter(log =>
        normalizar(log?.acao || '').includes(termo) ||
        normalizar(log?.detalhe || '').includes(termo) ||
        normalizar(log?.username || '').includes(termo)
      );
    }

    // filtrar por data
    if (filtroLogData) {
      const dataAlvo = filtroLogData;
      resultado = resultado.filter(log => {
        const dataLog = log?.criado_em || log?.data;
        return dataLog && new Date(dataLog).toISOString().split('T')[0] === dataAlvo;
      });
    }

    // filtrar por tipo de ação (se tiveres)
    if (tipoAcao) {
      const nAcao = normalizar(tipoAcao);
      const mapAcao = {
        login: /login/i,
        'criar-utilizador': /criar.*utilizador/i,
        'editar-utilizador': /editar.*utilizador/i,
        'criar-hospital': /criar.*hospital/i,
        'editar-hospital': /editar.*hospital/i,
      };

      const regex = mapAcao[nAcao];

      if (!regex) return []; // não filtra se não for um tipo conhecido

      resultado = resultado.filter(log => {
        const acao = (log?.acao || '').toLowerCase();
        return regex.test(normalizar(acao));
      });
    }

    return resultado;
  }, [logs, filtroLogTermo, filtroLogData, tipoAcao]);

  const utilizadoresComConta = utilizadores.filter((u) => u.bloqueado !== true);
  const utilizadoresBloqueados = utilizadores.filter((u) => u.bloqueado === true);

  const funcionariosSemConta = profissionais.filter(
    (p) => !idsComConta.has(Number(obterIdFunc(p)))
  );



  const utilizadoresComContaFiltrados = utilizadoresComConta.filter((u) => {
    const prof = profissionais.find((p) => obterIdFunc(p) === obterIdFunc(u));
    const nome = obterNome(prof || u);
    const funcao = obterFuncaoTraduzida(prof || u, textos);
    const numero = obterNumFunc(u);

    return (
      normalizar(u?.username || '').includes(normalizar(filtroUserUsername)) &&
      normalizar(nome).includes(normalizar(filtroUserNome)) &&
      String(numero).includes(filtroUserNumero)
    );
  });

  const utilizadoresBloqueadosFiltrados = utilizadoresBloqueados.filter((u) => {
    const prof = profissionais.find((p) => obterIdFunc(p) === obterIdFunc(u));
    const nome = obterNome(prof || u);
    const funcao = obterFuncaoTraduzida(prof || u, textos);
    const numero = obterNumFunc(u);

    return (
      normalizar(u?.username || '').includes(normalizar(filtroUserUsername)) &&
      normalizar(nome).includes(normalizar(filtroUserNome)) &&
      String(numero).includes(filtroUserNumero)
    );
  });

  const funcionariosSemContaFiltrados = funcionariosSemConta.filter((p) => {
    const nome = obterNome(p);
    const numero = obterNumFunc(p);

    return (
      normalizar(nome).includes(normalizar(filtroUserNome)) &&
      String(numero).includes(filtroUserNumero)
    );
  });

  const funcionariosFiltrados = profissionais.filter((p) => {
    const nome = obterNome(p);
    const numero = obterNumFunc(p);
    const funcao = String(obterTipoFuncRaw(p) || '').toLowerCase();

    return (
      normalizar(nome).includes(normalizar(filtroFuncNome)) &&
      String(numero).includes(filtroFuncNumero) &&
      (!filtroFuncTipo || funcao === normalizar(filtroFuncTipo))
    );
  });

  const funcionariosPesquisaNovoUser = funcionariosSemConta.filter((p) => {
    const nome = obterNome(p);
    const numero = obterNumFunc(p);

    return (
      normalizar(nome).includes(normalizar(pesquisaFuncionarioNovoUser)) ||
      String(numero).includes(pesquisaFuncionarioNovoUser)
    );
  });

  const hospitaisFiltrados = hospitais.filter(
    (h) =>
      normalizar(h.nome).includes(normalizar(filtroHospitalNome)) &&
      normalizar(h.localidade || '').includes(normalizar(filtroHospitalLocalidade))
  );


  const selecionarFuncionarioNovoUser = (funcionario) => {
    setNovoUtilizador((prev) => ({
      ...prev,
      idfunc: obterIdFunc(funcionario),
      username: gerarUsername(obterNome(funcionario)),
      role: obterTipoFuncRaw(funcionario) || ROLES.ADMIN,
      hospitais: extrairHospitais(funcionario),
    }));

    setPesquisaFuncionarioNovoUser(obterNome(funcionario));
    setDropdownAberto(false);
  };

  const abrirNovoUtilizador = () => {
    resetMensagens();
    setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] });
    setPesquisaFuncionarioNovoUser('');
    setDropdownAberto(false);
    setUtilizadorEditando(null);
    setUserView('novo');
  };

  const abrirEditarUtilizador = async (utilizador) => {
    resetMensagens();

    try {
      const idFunc = Number(obterIdFunc(utilizador));

      const [utilizadorData, hospitaisData, profissionalData] = await Promise.all([
        apiFetch(`/api/v1/utilizadores/${idFunc}`),
        apiFetch(`/api/v1/trabalha/funcionario/${idFunc}`),
        apiFetch(`/api/v1/profissionais/${idFunc}`),
      ]);

      const hospitaisIds = Array.isArray(hospitaisData)
        ? hospitaisData
          .map((item) => Number(item?.id_hosp ?? item?.idhosp ?? item?.idHosp ?? item?.id))
          .filter((id) => !Number.isNaN(id) && id > 0)
        : [];

      const prof = profissionalData || profissionais.find(
        (p) => Number(obterIdFunc(p)) === idFunc
      );

      setUtilizadorEditando({
        idfunc: idFunc,
        username: utilizadorData?.username ?? utilizador?.username ?? '',
        password: '',
        role: String(
          utilizadorData?.role ??
          prof?.tipo_func ??
          prof?.tipofunc ??
          utilizador?.role ??
          ROLES.ADMIN
        ).toLowerCase(),
        nome: prof?.nome ?? utilizador?.nome ?? '',
        sexo: prof?.sexo ?? utilizador?.sexo ?? 'M',
        bloqueado: utilizadorData?.bloqueado ?? utilizador?.bloqueado ?? false,
        hospitais: hospitaisIds,
      });

      setUserView('editar');
    } catch (err) {
      console.error('Erro ao abrir edição do utilizador:', err);
      setErroUser('Não foi possível carregar os dados do utilizador.');
    }
  };

  const abrirCriarAPartirFuncionario = (funcionario) => {
    resetMensagens();

    setUtilizadorEditando({
      idfunc: obterIdFunc(funcionario),
      nome: obterNome(funcionario),
      tipo_func: obterTipoFuncRaw(funcionario),
      sexo: funcionario?.sexo ?? funcionario?.Sexo ?? 'M',
      username: gerarUsername(obterNome(funcionario)),
      password: '',
      role: obterTipoFuncRaw(funcionario) || ROLES.ADMIN,
      hospitais: extrairHospitais(funcionario),
      isNovo: true,
    });

    setUserView('editar');
  };

  const abrirNovoFuncionario = () => {
    resetMensagens();
    setNovoProfissional({ nome: '', tipo_func: ROLES.ADMIN, sexo: 'M', hospitais: [] });
    setFuncionarioEditando(null);
    setEmployeeView('novo');
  };

  const abrirEditarFuncionario = async (funcionario) => {
    resetMensagens();

    const idfunc = Number(obterIdFunc(funcionario));
    console.log('FUNCIONARIO CLICADO', funcionario);
    console.log('IDFUNC', idfunc);

    setFuncionarioEditando({
      idfunc,
      nome: funcionario?.nome ?? '',
      tipo_func: String(
        funcionario?.tipo_func ??
        funcionario?.tipofunc ??
        funcionario?.role ??
        ROLES.ADMIN
      ).toLowerCase(),
      sexo: funcionario?.sexo ?? 'M',
      email: funcionario?.email ?? '',
      telefone: funcionario?.telefone ?? '',
      biografia: funcionario?.biografia ?? '',
      foto_url: funcionario?.foto_url ?? '',
      hospitais: [],
    });

    setEmployeeView('editar');

    try {
      setLoadingProfissionais(true);

      const hospitaisData = await apiFetch(`/api/v1/trabalha/funcionario/${idfunc}`);
      console.log('HOSPITAIS DO FUNCIONARIO', hospitaisData);

      const idsHospitais = Array.isArray(hospitaisData)
        ? hospitaisData
          .map((h) => Number(h?.id_hosp ?? h?.idhosp ?? h?.idHosp ?? h?.id))
          .filter((id) => !Number.isNaN(id) && id > 0)
        : [];

      console.log('IDS HOSPITAIS EXTRAIDOS', idsHospitais);

      setFuncionarioEditando((prev) => ({
        ...prev,
        hospitais: idsHospitais,
      }));
    } catch (err) {
      console.error('ERRO HOSPITAIS FUNCIONARIO', err);
      setErroFunc('Aviso: não foi possível carregar os hospitais atuais deste funcionário.');
    } finally {
      setLoadingProfissionais(false);
    }
  };

  const abrirNovoHospital = () => {
    resetMensagens();
    setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' });
    setHospitalEditando(null);
    setHospitalView('novo');
  };

  const abrirEditarHospital = (hospital) => {
    resetMensagens();
    setHospitalEditando(mapHospitalFromApi(hospital));
    setHospitalView('editar');
  };

  const handleNovoUserChange = (e) => setNovoUtilizador((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoProfChange = (e) => setNovoProfissional((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoHospitalChange = (e) => setNovoHospital((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarUserChange = (e) => setUtilizadorEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarFuncChange = (e) => setFuncionarioEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarHospitalChange = (e) => setHospitalEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const criarUtilizador = async (e) => {
    e.preventDefault();
    setMensagemUser('');
    setErroUser('');
    try {
      setSubmittingUser(true);
      const payload = { ...novoUtilizador, idfunc: Number(novoUtilizador.idfunc), hospitais: novoUtilizador.hospitais || [] };
      const data = await apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemUser(ta('sucessoCriarUser', 'User created successfully.'));
      adicionarHistorico('Criar utilizador', `Foi criado o utilizador ${data.username || novoUtilizador.username}.`);
      setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] });
      setPesquisaFuncionarioNovoUser('');
      await carregarUtilizadores();
      setUserView('lista');
    } catch (err) {
      setErroUser(err.message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const getHospitaisCount = (funcionario) => {
    const idfunc = Number(obterIdFunc(funcionario));
    return hospitaisPorFuncionario[idfunc] ?? 0;
  };

  const criarFuncionario = async (e) => {
    e.preventDefault();
    setMensagemFunc('');
    setErroFunc('');
    try {
      setSubmittingFunc(true);
      const payload = { nome: novoProfissional.nome, tipo_func: novoProfissional.tipo_func, sexo: novoProfissional.sexo };
      const data = await apiFetch('/api/v1/profissionais/', { method: 'POST', body: JSON.stringify(payload) });
      for (const idhosp of novoProfissional.hospitais || []) {
        await apiFetch('/api/v1/trabalha/', {
          method: 'POST',
          body: JSON.stringify({ id_func: data.id_func, id_hosp: Number(idhosp) }),
        });
      }
      setMensagemFunc(ta('sucessoCriarFunc', 'Employee created successfully.'));
      adicionarHistorico('Criar funcionário', `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`);
      setNovoProfissional({ nome: '', tipo_func: ROLES.ADMIN, sexo: 'M', hospitais: [] });
      await carregarProfissionais();
      setEmployeeView('lista');
    } catch (err) {
      setErroFunc(err.message);
    } finally {
      setSubmittingFunc(false);
    }
  };

  const criarHospital = async (e) => {
    e.preventDefault();
    setMensagemHospital('');
    setErroHospital('');
    if (!novoHospital.nome.trim() || !novoHospital.localidade.trim()) return setErroHospital('Campos obrigatórios em falta.');
    try {
      setSubmittingHospital(true);
      const payload = {
        nome: novoHospital.nome.trim(),
        localizacao: novoHospital.localidade.trim(),
        email: novoHospital.email.trim() || null,
        telefone: novoHospital.contacto.trim() || null,
      };
      await apiFetch('/api/v1/hospitais/', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemHospital(ta('sucessoCriarHosp', 'Hospital created successfully.'));
      adicionarHistorico('Criar hospital', `Foi criado o hospital ${novoHospital.nome}.`);
      setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' });
      await carregarHospitais();
      setHospitalView('lista');
    } catch (err) {
      setErroHospital(err.message);
    } finally {
      setSubmittingHospital(false);
    }
  };

  const guardarUtilizadorEditado = async (e) => {
    e.preventDefault();
    setMensagemUser('');
    setErroUser('');

    try {
      setSubmittingUser(true);

      const idfunc = Number(utilizadorEditando.idfunc);

      const payloadUser = {
        username: utilizadorEditando.username,
        role: utilizadorEditando.role,
        bloqueado: utilizadorEditando.bloqueado ?? false,
      };

      if (utilizadorEditando.password?.trim()) {
        payloadUser.password = utilizadorEditando.password.trim();
      }

      await apiFetch(`/api/v1/utilizadores/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify(payloadUser),
      });

      await apiFetch(`/api/v1/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: utilizadorEditando.nome,
          tipo_func: utilizadorEditando.role,
          sexo: utilizadorEditando.sexo,
        }),
      });

      let hospitaisAntigos = [];
      try {
        const resAntigos = await apiFetch(`/api/v1/trabalha/funcionario/${idfunc}`);
        hospitaisAntigos = Array.isArray(resAntigos)
          ? resAntigos
            .map((h) => Number(h?.id_hosp ?? h?.idhosp ?? h?.idHosp ?? h?.id))
            .filter((id) => !Number.isNaN(id) && id > 0)
          : [];
      } catch (err) {
        console.warn('Erro ao carregar hospitais antigos do utilizador:', err);
      }

      const hospitaisSelecionados = Array.isArray(utilizadorEditando.hospitais)
        ? utilizadorEditando.hospitais
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id) && id > 0)
        : [];

      const adicionar = hospitaisSelecionados.filter((h) => !hospitaisAntigos.includes(h));
      const remover = hospitaisAntigos.filter((h) => !hospitaisSelecionados.includes(h));

      for (const idhosp of adicionar) {
        console.log('A adicionar hospital', {
          id_func: idfunc,
          id_hosp: idhosp,
        });

        await apiFetch('/api/v1/trabalha/', {
          method: 'POST',
          body: JSON.stringify({
            id_func: idfunc,
            id_hosp: idhosp,
          }),
        });
      }

      for (const idhosp of remover) {
        await apiFetch(`/api/v1/trabalha/${idfunc}/${idhosp}`, {
          method: 'DELETE',
        });
      }

      setMensagemUser(textos.admin.sucessoEditarUser);
      adicionarHistorico(
        'Editar utilizador',
        `Foram atualizados os dados de ${utilizadorEditando.username}.`
      );

      await carregarUtilizadores();
      await carregarProfissionais();

      setUtilizadorEditando(null);
      setUserView('lista');
    } catch (err) {
      console.error('Erro ao guardar utilizador:', err);

      const mensagem =
        err?.message ||
        err?.detail ||
        err?.erro ||
        (Array.isArray(err) ? JSON.stringify(err) : null) ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));

      setErroUser(mensagem);
    } finally {
      setSubmittingUser(false);
    }
  };

  const guardarFuncionarioEditado = async (e) => {
    e.preventDefault();
    setMensagemFunc('');
    setErroFunc('');

    try {
      setSubmittingFunc(true);

      const idfunc = Number(funcionarioEditando.idfunc);

      const payloadFunc = {
        nome: funcionarioEditando.nome,
        tipo_func: String(funcionarioEditando.tipo_func),
        sexo: funcionarioEditando.sexo,
        email: funcionarioEditando.email || null,
        telefone: funcionarioEditando.telefone || null,
        biografia: funcionarioEditando.biografia || null,
        foto_url: funcionarioEditando.foto_url || null,
      };

      await apiFetch(`/api/v1/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify(payloadFunc),
      });

      let hospitaisAntigos = [];
      try {
        const resAntigos = await apiFetch(`/api/v1/trabalha/funcionario/${idfunc}`);
        hospitaisAntigos = Array.isArray(resAntigos)
          ? resAntigos
            .map((h) => Number(h?.id_hosp ?? h?.idhosp ?? h?.idHosp ?? h?.id))
            .filter((id) => !Number.isNaN(id) && id > 0)
          : [];
      } catch (e) {
        console.warn('Sem hospitais anteriores ou erro ao consultar.', e);
      }

      const hospitaisSelecionados = Array.isArray(funcionarioEditando.hospitais)
        ? funcionarioEditando.hospitais
          .map((id) => Number(id))
          .filter((id) => !Number.isNaN(id) && id > 0)
        : [];

      const adicionar = hospitaisSelecionados.filter((h) => !hospitaisAntigos.includes(h));
      const remover = hospitaisAntigos.filter((h) => !hospitaisSelecionados.includes(h));

      for (const idhosp of adicionar) {
        await apiFetch('/api/v1/trabalha/', {
          method: 'POST',
          body: JSON.stringify({
            id_func: idfunc,
            id_hosp: idhosp,
          }),
        });
      }

      for (const idhosp of remover) {
        await apiFetch(`/api/v1/trabalha/${idfunc}/${idhosp}`, {
          method: 'DELETE',
        });
      }

      setMensagemFunc(textos.admin.sucessoEditarFunc);
      adicionarHistorico(
        'Editar funcionário',
        `Foram atualizados os dados do funcionário ${funcionarioEditando.nome}.`
      );

      await carregarProfissionais();

      setFuncionarioEditando(null);
      setEmployeeView('lista');
    } catch (err) {
      console.error('Erro ao guardar funcionário:', err);

      const mensagem =
        err?.message ||
        err?.detail ||
        err?.erro ||
        (Array.isArray(err) ? JSON.stringify(err) : null) ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));

      setErroFunc(mensagem);
    } finally {
      setSubmittingFunc(false);
    }
  };

  const guardarHospitalEditado = async (e) => {
    e.preventDefault();
    setMensagemHospital('');
    setErroHospital('');
    try {
      setSubmittingHospital(true);
      const payload = {
        nome: hospitalEditando.nome,
        localizacao: hospitalEditando.localidade,
        email: hospitalEditando.email || null,
        telefone: hospitalEditando.contacto || null,
      };
      await apiFetch(`/api/v1/hospitais/${hospitalEditando.idhosp || hospitalEditando.id_hosp}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setMensagemHospital(ta('sucessoEditarHosp', 'Hospital updated successfully.'));
      adicionarHistorico('Editar hospital', `Foram atualizados os dados do hospital ${hospitalEditando.nome}.`);
      await carregarHospitais();
      setHospitalEditando(null);
      setHospitalView('lista');
    } catch (err) {
      setErroHospital(err.message);
    } finally {
      setSubmittingHospital(false);
    }
  };

  const bloquearUtilizador = async (utilizador) => {
    if (!window.confirm(`Tens a certeza que pretendes bloquear "${utilizador.username}"?`)) return;
    try {
      await apiFetch(`/api/v1/utilizadores/${utilizador.idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({ username: utilizador.username, password: null, hospitais: extrairHospitais(utilizador), bloqueado: true }),
      });
      adicionarHistorico('Bloquear utilizador', `O utilizador ${utilizador.username} foi bloqueado.`);
      await carregarUtilizadores();
    } catch (err) {
      setErroUtilizadores(err.message);
    }
  };

  const desbloquearUtilizador = async (utilizador) => {
    if (!window.confirm(`Tens a certeza que pretendes desbloquear "${utilizador.username}"?`)) return;
    try {
      await apiFetch(`/api/v1/utilizadores/${utilizador.idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({ username: utilizador.username, password: null, hospitais: extrairHospitais(utilizador), bloqueado: false }),
      });
      adicionarHistorico('Desbloquear utilizador', `O utilizador ${utilizador.username} foi desbloqueado.`);
      await carregarUtilizadores();
    } catch (err) {
      setErroUtilizadores(err.message);
    }
  };

  const exportarRelatorioSeguro = () => {
    if (logsFiltrados.length === 0) return alert('Sem dados para exportar.');
    const cabecalhos = ['Data/Hora', 'Utilizador', 'Ação', 'Detalhe'];
    const linhas = logsFiltrados.map((log) => [
      log.criado_em ? new Date(log.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') : '',
      `"${(log.username || '').replace(/"/g, '""')}"`,
      `"${(log.acao || '').replace(/"/g, '""')}"`,
      `"${(log.detalhe || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [cabecalhos.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio_logs.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHospitalNomeFuncionario = (funcionario) => {
    const arrHosp = extrairHospitais(funcionario);
    if (arrHosp.length === 0) return '—';
    if (arrHosp.length === 1) {
      const hObj = hospitais.find((h) => Number(h.idhosp) === arrHosp[0]);
      return hObj ? hObj.nome : '—';
    }
    return `${arrHosp.length} Hospitais`;
  };

  const getHospitalCountFuncionario = (funcionario) => {
    const arrHosp = extrairHospitais(funcionario);
    return arrHosp.length;
  };

  const [hospitaisPorFuncionario, setHospitaisPorFuncionario] = useState({});

  const carregarHospitaisPorFuncionario = async () => {
    try {
      const resultado = {};

      for (const f of profissionais) {
        const idfunc = Number(obterIdFunc(f));
        if (!idfunc) continue;

        try {
          const data = await apiFetch(`/api/v1/trabalha/funcionario/${idfunc}`);
          console.log('CONTAGEM HOSPITAIS - IDFUNC', idfunc, data);
          resultado[idfunc] = Array.isArray(data) ? data.length : 0;
        } catch (err) {
          console.error(`Erro ao carregar hospitais do funcionário ${idfunc}:`, err);
          resultado[idfunc] = 0;
        }
      }

      console.log('MAPA FINAL HOSPITAIS POR FUNCIONARIO', resultado);
      setHospitaisPorFuncionario(resultado);
    } catch (err) {
      console.error('Erro ao carregar contagem de hospitais por funcionário:', err);
    }
  };

  const renderUserCenter = () => {
    if (userView === 'novo') {
      const funcSelecionado = profissionais.find(
        (p) => p.idfunc === Number(novoUtilizador.idfunc)
      );
      return (
        <section className="admin-panel-section">
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Utilizadores</span>
              <h2 className="admin-edit-header__title">{ta('btnNovoUtilizador', 'New user')}</h2>
              <p className="admin-edit-header__subtitle">{ta('descNovoUtilizador', 'Cria uma nova conta de utilizador no sistema.')}</p>
            </div>
          </div>

          <form className="admin-form" onSubmit={criarUtilizador}>
            <div className="admin-form__grid">
              <div className="admin-form__group admin-form__group--full" ref={dropdownRef}>
                <label htmlFor="search-func">{tt('lblNome', 'Nome')}</label>
                <div className="admin-dropdown">
                  <input
                    id="search-func"
                    type="text"
                    className="admin-dropdown__input"
                    placeholder={tt('pesquisarNome', 'Pesquisar nome')}
                    value={pesquisaFuncionarioNovoUser}
                    onChange={(e) => {
                      setPesquisaFuncionarioNovoUser(e.target.value);
                      setDropdownAberto(true);
                      if (!e.target.value) {
                        setNovoUtilizador((prev) => ({ ...prev, idfunc: '', username: '' }));
                      }
                    }}
                    onFocus={() => setDropdownAberto(true)}
                    autoComplete="off"
                  />
                  {funcSelecionado && (
                    <div className="admin-dropdown__selected">
                      ✓ #{funcSelecionado.idfunc} — {funcSelecionado.nome}
                    </div>
                  )}
                  {dropdownAberto && (
                    <div className="admin-dropdown__list">
                      {funcionariosPesquisaNovoUser.length === 0 ? (
                        <div className="admin-dropdown__empty">{tt('semResultados', 'Sem resultados')}</div>
                      ) : (
                        funcionariosPesquisaNovoUser.map((p) => (
                          <button
                            key={p.idfunc}
                            type="button"
                            className="admin-dropdown__item"
                            onClick={() => selecionarFuncionarioNovoUser(p)}
                          >
                            <span className="admin-dropdown__item-name">{p.nome}</span>
                            <span className="admin-dropdown__item-meta">
                              #{p.idfunc} · {p.tipo_func}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-username">{ta('lblUsername', 'Username')}</label>
                <input
                  id="user-username"
                  name="username"
                  type="text"
                  value={novoUtilizador.username}
                  onChange={handleNovoUserChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-password">{ta('lblPassword', 'Password')}</label>
                <input
                  id="user-password"
                  name="password"
                  type="password"
                  value={novoUtilizador.password}
                  onChange={handleNovoUserChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-role">{ta('lblFuncao', 'Role')}</label>
                <select
                  id="user-role"
                  name="role"
                  value={novoUtilizador.role}
                  onChange={handleNovoUserChange}
                >
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médio')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblAssociarHospitais', 'Associar hospitais')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoUtilizador.hospitais}
                  onChange={(novosIds) => setNovoUtilizador(prev => ({ ...prev, hospitais: novosIds }))}
                  pesquisa={pesquisaHospitalAssociacao}
                  onPesquisaChange={setPesquisaHospitalAssociacao}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>

            <div className="admin-actions-row">
              <button
                type="submit"
                className="admin-form__submit"
                disabled={submittingUser || !novoUtilizador.idfunc}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{submittingUser ? tt('aCarregar', 'A carregar') : ta('btnNovoUtilizador', 'New user')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setUserView('lista')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (userView === 'editar' && utilizadorEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Utilizadores</span>
              <h2 className="admin-edit-header__title">
                {utilizadorEditando.isNovo ? ta('btnNovoUtilizador', 'New user') : tt('editar', 'Editar')}
              </h2>
              <p className="admin-edit-header__subtitle">
                {utilizadorEditando.isNovo
                  ? ta('descNovoUtilizador', 'Cria uma nova conta de utilizador.')
                  : ta('descEditarUtilizador', 'Atualiza os dados do utilizador.')}
              </p>
            </div>

            <div className="admin-edit-header__badge">
              #{utilizadorEditando.idfunc} — {utilizadorEditando.nome}
            </div>
          </div>

          <form
            className="admin-form"
            onSubmit={utilizadorEditando.isNovo ? criarUtilizador : guardarUtilizadorEditado}
          >
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="edit-user-id">{ta('lblNumFuncionario', 'Employee No.')}</label>
                <input id="edit-user-id" type="text" value={utilizadorEditando.idfunc || ''} readOnly />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-nome">{ta('lblNome', 'Name')}</label>
                <input
                  id="edit-user-nome"
                  name="nome"
                  type="text"
                  value={utilizadorEditando.nome || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-username">{ta('lblUsername', 'Username')}</label>
                <input
                  id="edit-user-username"
                  name="username"
                  type="text"
                  value={utilizadorEditando.username || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-password">
                  {utilizadorEditando.isNovo
                    ? ta('lblPassword', 'Password')
                    : `${ta('lblPassword', 'Password')} (opcional)`}
                </label>
                <input
                  id="edit-user-password"
                  name="password"
                  type="password"
                  value={utilizadorEditando.password || ''}
                  onChange={handleEditarUserChange}
                  required={!!utilizadorEditando.isNovo}
                  placeholder={
                    utilizadorEditando.isNovo
                      ? ta('lblPassword', 'Password')
                      : ta('placeholderPasswordOpcional', 'Deixa vazio para manter a password atual')
                  }
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-role">{ta('lblFuncao', 'Role')}</label>
                <select
                  id="edit-user-role"
                  name="role"
                  value={utilizadorEditando.role || ROLES.ADMIN}
                  onChange={handleEditarUserChange}
                >
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médio')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-sexo">{ta('lblSexo', 'Gender')}</label>
                <select
                  id="edit-user-sexo"
                  name="sexo"
                  value={utilizadorEditando.sexo || 'M'}
                  onChange={handleEditarUserChange}
                >
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblGerirHospitaisAssociados', 'Gerir hospitais associados')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={utilizadorEditando.hospitais}
                  onChange={(novosIds) => setUtilizadorEditando(prev => ({ ...prev, hospitais: novosIds }))}
                  pesquisa={pesquisaHospitalAssociacao}
                  onPesquisaChange={setPesquisaHospitalAssociacao}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>


            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('guardar', 'Guardar')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setUtilizadorEditando(null);
                  setUserView('lista');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-edit-header">
          <div className="admin-edit-header__title-wrap">
            <span className="admin-edit-header__eyebrow">Utilizadores</span>
            <h2 className="admin-edit-header__title">{ta('menuUtilizadores', 'Users')}</h2>
            <p className="admin-edit-header__subtitle">{ta('descUtilizadores', 'Manage access accounts, pending accounts and blocked users.')}</p>
          </div>
        </div>

        <div aria-live="polite">
          {erroUtilizadores && <p className="admin-form__error">{erroUtilizadores}</p>}
          {erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}
        </div>

        <button type="button" className="admin-primary-big-button" onClick={abrirNovoUtilizador}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span>{ta('btnNovoUtilizador', 'New user')}</span>
        </button>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-user-username">{ta('lblUsername', 'Username')}</label>
            <input
              id="filter-user-username"
              type="text"
              value={filtroUserUsername}
              onChange={(e) => setFiltroUserUsername(e.target.value)}
            />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input
              id="filter-user-nome"
              type="text"
              value={filtroUserNome}
              onChange={(e) => setFiltroUserNome(e.target.value)}
            />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-num">{tt('pesquisarNumero', 'Pesquisar número')}</label>
            <input
              id="filter-user-num"
              type="text"
              value={filtroUserNumero}
              onChange={(e) => setFiltroUserNumero(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-card__header">
            <h3>{ta('tblUtilizadoresComConta', 'Users with account')}</h3>
            <span>{utilizadoresComContaFiltrados.length}</span>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{ta('lblNumFuncionario', 'Employee No.')}</th>
                  <th>{ta('lblNome', 'Name')}</th>
                  <th>{ta('lblUsername', 'Username')}</th>
                  <th>{ta('lblFuncao', 'Role')}</th>
                  <th>{ta('lblAcoes', 'Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingUtilizadores || loadingProfissionais ? (
                  <tr>
                    <td colSpan="5">{textos.geral.aCarregar}</td>
                  </tr>
                ) : utilizadoresComContaFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5">{textos.geral.semResultados}</td>
                  </tr>
                ) : (
                  utilizadoresComContaFiltrados.map((u, index) => {
                    const prof = profissionais.find(
                      (p) =>
                        Number(p?.idfunc ?? p?.id_func ?? p?.IdFunc) ===
                        Number(u?.idfunc ?? u?.id_func ?? u?.IdFunc)
                    );
                    const nome = obterNome(prof || u);
                    const funcao = obterFuncaoTraduzida(prof || u, textos);

                    return (
                      <tr key={`user-${u?.idfunc ?? u?.id_func ?? u?.username ?? index}`}>
                        <td>{u?.idfunc ?? '—'}</td>
                        <td>{nome}</td>
                        <td>{u?.username ?? '—'}</td>
                        <td>{funcao}</td>
                        <td style={{ display: 'flex', gap: '0.6rem' }}>
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => abrirEditarUtilizador(u)}
                          >
                            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.854.146a.5.5 0 0 0-.708 0L10.5 1.793 14.207 5.5l1.646-1.647a.5.5 0 0 0 0-.708l-3-3zM13.5 6.207 9.793 2.5 3 9.293V13h3.707L13.5 6.207z" />
                            </svg>
                            <span>{textos.geral.editar}</span>
                          </button>
                          <button
                            type="button"
                            className="admin-secondary-button admin-button--danger"
                            onClick={() => bloquearUtilizador(u)}
                          >
                            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{textos.admin.btnBloquear}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header">
            <h3>{ta('tblUtilizadoresBloqueados', 'Blocked users')}</h3>
            <span>{utilizadoresBloqueadosFiltrados.length}</span>
          </div>
          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{ta('lblNumFuncionario', 'Employee No.')}</th>
                  <th>{ta('lblNome', 'Name')}</th>
                  <th>{ta('lblUsername', 'Username')}</th>
                  <th>{ta('lblFuncao', 'Role')}</th>
                  <th>{ta('lblAcoes', 'Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingUtilizadores ? (
                  <tr>
                    <td colSpan="5">{tt('aCarregar', 'A carregar')}</td>
                  </tr>
                ) : utilizadoresBloqueadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5">{ta('semBloqueados', 'No blocked users.')}</td>
                  </tr>
                ) : (
                  utilizadoresBloqueadosFiltrados.map((u) => {
                    const prof = profissionais.find(
                      (p) =>
                        Number(p?.idfunc ?? p?.id_func ?? p?.IdFunc) ===
                        Number(u?.idfunc ?? u?.id_func ?? u?.IdFunc)
                    );
                    return (
                      <tr key={u.idfunc || u.username}>
                        <td>{u.idfunc}</td>
                        <td>{prof?.nome || '—'}</td>
                        <td>{u.username}</td>
                        <td>{u.role || prof?.tipofunc || '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-button--success admin-secondary-button"
                            onClick={() => desbloquearUtilizador(u)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                            </svg>
                            <span>{ta('btnDesbloquear', 'Desbloquear')}</span>
                          </button>
                        </td>
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


  const renderEmployeeCenter = () => {
    if (employeeView === 'novo') {
      return (
        <section className="admin-panel-section">
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Funcionários</span>
              <h2 className="admin-edit-header__title">{ta('btnNovoFuncionario', 'New employee')}</h2>
              <p className="admin-edit-header__subtitle">{ta('descNovoFuncionario', 'Cria um novo registo de funcionário no sistema.')}</p>
            </div>
          </div>

          <form className="admin-form" onSubmit={criarFuncionario}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="func-nome">{ta('lblNome', 'Name')}</label>
                <input
                  id="func-nome"
                  name="nome"
                  type="text"
                  value={novoProfissional.nome || ''}
                  onChange={handleNovoProfChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="func-role">{ta('lblFuncao', 'Role')}</label>
                <select
                  id="func-role"
                  name="tipo_func"
                  value={novoProfissional.tipo_func || ''}
                  onChange={handleNovoProfChange}
                >
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médio')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="func-sexo">{ta('lblSexo', 'Gender')}</label>
                <select
                  id="func-sexo"
                  name="sexo"
                  value={novoProfissional.sexo || 'M'}
                  onChange={handleNovoProfChange}
                >
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblAssociarHospitais', 'Associar hospitais')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoProfissional.hospitais || []}
                  onChange={(novosIds) =>
                    setNovoProfissional((prev) => ({ ...prev, hospitais: novosIds }))
                  }
                  pesquisa={pesquisaHospitalAssociacao}
                  onPesquisaChange={setPesquisaHospitalAssociacao}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
              {erroFunc && <p className="admin-form__error">{erroFunc}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingFunc}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{submittingFunc ? tt('aCarregar', 'A carregar') : tt('guardar', 'Guardar')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setEmployeeView('lista')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (employeeView === 'editar' && funcionarioEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Funcionários</span>
              <h2 className="admin-edit-header__title">{tt('editar', 'Editar')}</h2>
              <p className="admin-edit-header__subtitle">{ta('descEditarFuncionario', 'Atualiza os dados profissionais e os hospitais associados.')}</p>
            </div>

            <div className="admin-edit-header__badge">
              #{funcionarioEditando?.idfunc ?? '—'} — {funcionarioEditando?.nome}
            </div>
          </div>

          <form className="admin-form" onSubmit={guardarFuncionarioEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="edit-func-id">{ta('lblNumFuncionario', 'Employee No.')}</label>
                <input
                  id="edit-func-id"
                  type="text"
                  value={funcionarioEditando.idfunc || ''}
                  readOnly
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-func-nome">{ta('lblNome', 'Name')}</label>
                <input
                  id="edit-func-nome"
                  name="nome"
                  type="text"
                  value={funcionarioEditando.nome || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-func-role">{ta('lblFuncao', 'Role')}</label>
                <select
                  id="edit-func-role"
                  name="tipofunc"
                  value={funcionarioEditando.tipofunc || ''}
                  onChange={handleEditarFuncChange}
                >
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médio')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-func-sexo">{ta('lblSexo', 'Gender')}</label>
                <select
                  id="edit-func-sexo"
                  name="sexo"
                  value={funcionarioEditando.sexo || 'M'}
                  onChange={handleEditarFuncChange}
                >
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-func-email">{ta('lblEmail', 'Email')}</label>
                <input
                  id="edit-func-email"
                  name="email"
                  type="email"
                  value={funcionarioEditando.email || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-func-telefone">{ta('lblContacto', 'Contact')}</label>
                <input
                  id="edit-func-telefone"
                  name="telefone"
                  type="text"
                  value={funcionarioEditando.telefone || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label htmlFor="edit-func-biografia">{ta('lblBiografia', 'Biography')}</label>
                <textarea
                  id="edit-func-biografia"
                  name="biografia"
                  className="admin-form__textarea"
                  value={funcionarioEditando.biografia || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblGerirHospitaisAssociados', 'Gerir hospitais associados')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={funcionarioEditando.hospitais || []}
                  onChange={(novosIds) =>
                    setFuncionarioEditando((prev) => ({ ...prev, hospitais: novosIds }))
                  }
                  pesquisa={pesquisaHospitalAssociacao}
                  onPesquisaChange={setPesquisaHospitalAssociacao}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
              {erroFunc && <p className="admin-form__error">{erroFunc}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('guardar', 'Guardar')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setFuncionarioEditando(null);
                  setEmployeeView('lista');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-edit-header">
          <div className="admin-edit-header__title-wrap">
            <span className="admin-edit-header__eyebrow">Funcionários</span>
            <h2 className="admin-edit-header__title">{ta('menuFuncionarios', 'Employees')}</h2>
            <p className="admin-edit-header__subtitle">{ta('descFuncionarios', 'Manage employees, create new records and assign hospitals.')}</p>
          </div>
        </div>

        <div aria-live="polite">{erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}</div>

        <button type="button" className="admin-primary-big-button" onClick={abrirNovoFuncionario}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          <span>{ta('btnNovoFuncionario', 'New employee')}</span>
        </button>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-func-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input
              id="filter-func-nome"
              type="text"
              value={filtroFuncNome}
              onChange={(e) => setFiltroFuncNome(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="filter-func-num">{tt('pesquisarNumero', 'Pesquisar número')}</label>
            <input
              id="filter-func-num"
              type="text"
              value={filtroFuncNumero}
              onChange={(e) => setFiltroFuncNumero(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="filter-func-tipo">{ta('lblFuncao', 'Role')}</label>
            <select
              id="filter-func-tipo"
              value={filtroFuncTipo}
              onChange={(e) => setFiltroFuncTipo(e.target.value)}
            >
              <option value="">{ta('todasFuncoes', 'Todas as funções')}</option>
              <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
              <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médio')}</option>
              <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
              <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
            </select>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>{ta('menuFuncionarios', 'Employees')}</h3>
            <span>{funcionariosFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{textos.admin.lblNumFuncionario}</th>
                  <th>{textos.admin.lblNome}</th>
                  <th>{textos.admin.lblFuncao}</th>
                  <th>{textos.admin.lblHospitais}</th>
                  <th>{ta('ações', 'Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingProfissionais ? (
                  <tr>
                    <td colSpan="5">{textos.geral.aCarregar}</td>
                  </tr>
                ) : funcionariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5">{textos.geral.semResultados}</td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map((f, index) => {
                    const numero = obterNumFunc(f);
                    const nome = obterNome(f);
                    const funcao = obterFuncaoTraduzida(f, textos);
                    const hospitaisCount = getHospitaisCount(f);

                    return (
                      <tr key={`func-${obterIdFunc(f) || index}`}>
                        <td>{numero}</td>
                        <td>{nome}</td>
                        <td>{funcao}</td>
                        <td>
                          <span className={`hospitais-badge count-${hospitaisCount}`}>
                            {hospitaisCount}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => abrirEditarFuncionario(f)}
                          >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.854.146a.5.5 0 0 0-.708 0L10.5 1.793 14.207 5.5l1.646-1.647a.5.5 0 0 0 0-.708l-3-3zM13.5 6.207 9.793 2.5 3 9.293V13h3.707L13.5 6.207z" />
                            </svg>
                            <span>{textos.geral.editar}</span>
                          </button>
                        </td>
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

  const removerHospital = async (hospitalId) => {
    const confirmar = window.confirm(
      'Tem a certeza que deseja remover este hospital?'
    );

    if (!confirmar) return;

    try {
      const response = await fetch(
        `http://localhost:3001/hospitais/${hospitalId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao remover hospital');
      }

      setHospitais((prevHospitais) =>
        prevHospitais.filter(
          (hospital) => hospital.idhosp !== hospitalId
        )
      );

      alert('Hospital removido com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao remover hospital.');
    }
  };


  const renderHospitalCenter = () => {
    if (hospitalView === 'novo') {
      return (
        <section className={`admin-panel-section ${employeeView === 'editar' ? 'is-editing' : ''}`}>
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Hospitais</span>
              <h2 className="admin-edit-header__title">{ta('btnNovoHospital', 'New hospital')}</h2>
              <p className="admin-edit-header__subtitle">{ta('descNovoHospital', 'Cria um novo registo de hospital no sistema.')}</p>
            </div>
          </div>

          <form className="admin-form" onSubmit={criarHospital}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="hosp-nome">{ta('lblNome', 'Name')}</label>
                <input
                  id="hosp-nome"
                  name="nome"
                  type="text"
                  value={novoHospital.nome}
                  onChange={handleNovoHospitalChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="hosp-loc">{ta('lblLocalizacao', 'Location')}</label>
                <input
                  id="hosp-loc"
                  name="localidade"
                  type="text"
                  value={novoHospital.localidade}
                  onChange={handleNovoHospitalChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="hosp-email">{ta('lblEmail', 'Email')}</label>
                <input
                  id="hosp-email"
                  name="email"
                  type="email"
                  value={novoHospital.email}
                  onChange={handleNovoHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="hosp-contacto">{ta('lblContacto', 'Contact')}</label>
                <input
                  id="hosp-contacto"
                  name="contacto"
                  type="text"
                  value={novoHospital.contacto}
                  onChange={handleNovoHospitalChange}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
              {erroHospital && <p className="admin-form__error">{erroHospital}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingHospital}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('guardar', 'Guardar')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setHospitalView('lista')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (hospitalView === 'editar' && hospitalEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-edit-header">
            <div className="admin-edit-header__title-wrap">
              <span className="admin-edit-header__eyebrow">Hospitais</span>
              <h2 className="admin-edit-header__title">{tt('editar', 'Editar')}</h2>
              <p className="admin-edit-header__subtitle">{ta('descEditarHospital', 'Atualiza os dados do hospital.')}</p>
            </div>

            <div className="admin-edit-header__badge">
              {hospitalEditando.nome}
            </div>
          </div>

          <form className="admin-form" onSubmit={guardarHospitalEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="ehosp-nome">{ta('lblNome', 'Name')}</label>
                <input
                  id="ehosp-nome"
                  name="nome"
                  type="text"
                  value={hospitalEditando.nome || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="ehosp-loc">{ta('lblLocalizacao', 'Location')}</label>
                <input
                  id="ehosp-loc"
                  name="localidade"
                  type="text"
                  value={hospitalEditando.localidade || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="ehosp-email">{ta('lblEmail', 'Email')}</label>
                <input
                  id="ehosp-email"
                  name="email"
                  type="email"
                  value={hospitalEditando.email || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="ehosp-contacto">{ta('lblContacto', 'Contact')}</label>
                <input
                  id="ehosp-contacto"
                  name="contacto"
                  type="text"
                  value={hospitalEditando.contacto || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
              {erroHospital && <p className="admin-form__error">{erroHospital}</p>}
            </div>

            <div className="admin-actions-row">
              <button
                type="submit"
                className="admin-form__submit"
                disabled={submittingHospital}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('guardar', 'Guardar')}</span>
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setHospitalEditando(null);
                  setHospitalView('lista');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{tt('cancelar', 'Cancelar')}</span>
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-edit-header">
          <div className="admin-edit-header__title-wrap">
            <span className="admin-edit-header__eyebrow">Hospitais</span>
            <h2 className="admin-edit-header__title">{ta('menuHospitais', 'Hospitals')}</h2>
            <p className="admin-edit-header__subtitle">{ta('descHospitais', 'List of existing hospitals and editing in the central panel.')}</p>
          </div>
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoHospital}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>{ta('btnNovoHospital', 'New hospital')}</span>
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-hosp-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input
              id="filter-hosp-nome"
              type="text"
              value={filtroHospitalNome}
              onChange={(e) => setFiltroHospitalNome(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label htmlFor="filter-hosp-loc">{ta('lblLocalizacao', 'Location')}</label>
            <input
              id="filter-hosp-loc"
              type="text"
              value={filtroHospitalLocalidade}
              onChange={(e) => setFiltroHospitalLocalidade(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>{ta('menuHospitais', 'Hospitals')}</h3>
            <span>{hospitaisFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{ta('lblNome', 'Name')}</th>
                  <th>{ta('lblLocalizacao', 'Location')}</th>
                  <th>{ta('lblEmail', 'Email')}</th>
                  <th>{ta('lblContacto', 'Contact')}</th>
                  <th>{tt('lblAções', 'Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingHospitais ? (
                  <tr>
                    <td colSpan="5">{tt('aCarregar', 'A carregar')}</td>
                  </tr>
                ) : hospitaisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5">{tt('semResultados', 'Sem resultados')}</td>
                  </tr>
                ) : (
                  hospitaisFiltrados.map((h) => (
                    <tr key={h.idhosp}>
                      <td>{h.nome || '—'}</td>
                      <td>{h.localidade || '—'}</td>
                      <td>{h.email || '—'}</td>
                      <td>{h.contacto || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => abrirEditarHospital(h)}
                          >
                            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M12.854.146a.5.5 0 0 0-.708 0L10.5 1.793 14.207 5.5l1.646-1.647a.5.5 0 0 0 0-.708l-3-3zM13.5 6.207 9.793 2.5 3 9.293V13h3.707L13.5 6.207z" />
                            </svg>
                            <span>{textos.geral.editar}</span>
                          </button>

                          <button
                            type="button"
                            className="admin-secondary-button admin-button--danger"
                            onClick={() => removerHospital(h.idhosp)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path
                                d="M3 6h18M8 6V4h8v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6h10z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Remover</span>
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
  };
  const renderReportsCenter = () => (
    <section className="admin-panel-section">
      <div className="admin-edit-header">
        <div className="admin-edit-headertitle-wrap">
          <span className="admin-edit-headereyebrow">Relatórios</span>
          <h2 className="admin-edit-headertitle">{ta('menuRelatorios', 'Reports')}</h2>
          <p className="admin-edit-headersubtitle">{ta('descRelatorios', 'View logs, statistics and export data.')}</p>
        </div>
      </div>

      <div className="admin-reports-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-card__label">{ta('lblTotalUtilizadores', 'Total Users')}</div>
          <div className="admin-stat-card__value">{utilizadoresComContaFiltrados.length}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__label">{ta('lblTotalFuncionarios', 'Total Employees')}</div>
          <div className="admin-stat-card__value">{funcionariosFiltrados.length}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__label">{ta('lblTotalHospitais', 'Total Hospitals')}</div>
          <div className="admin-stat-card__value">{hospitaisFiltrados.length}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__label">{ta('lblTotalLogs', 'Total Logs')}</div>
          <div className="admin-stat-card__value">{logsFiltrados.length}</div>
        </div>
      </div>

      {erroLogs && <p className="admin-form__error">{erroLogs}</p>}

      <div className="admin-filters">
        <div className="admin-form__group">
          <label>{ta('lblPesquisarLogs', 'Pesquisar (Ação, Detalhe, Utilizador)')}</label>
          <input
            type="text"
            value={filtroLogTermo}
            onChange={(e) => setFiltroLogTermo(e.target.value)}
            placeholder={ta('placeholderPesquisarLogs', 'Escreve aqui...')}
          />
        </div>

        <div className="admin-form__group">
          <label>{ta('lblData', 'Data')}</label>
          <input
            type="date"
            value={filtroLogData}
            onChange={(e) => setFiltroLogData(e.target.value)}
          />
        </div>

        <div className="admin-form__group">
          <label>{ta('lblTipoAcao', 'Tipo de ação')}</label>
          <select value={tipoAcao} onChange={(e) => setTipoAcao(e.target.value)}>
            <option value="">{ta('todasAcoes', 'Todas')}</option>
            <option value="login">Login</option>
            <option value="criar-utilizador">{ta('criarUtilizador', 'Criar utilizador')}</option>
            <option value="editar-utilizad
            or">{ta('editarUtilizador', 'Editar utilizador')}</option>
            <option value="criar-hospital">{ta('criarHospital', 'Criar hospital')}</option>
            <option value="editar-hospital">{ta('editarHospital', 'Editar hospital')}</option>
          </select>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--bottom">
        <div className="admin-table-card__header">
          <h3>{ta('tblLogs', 'Activity Logs')}</h3>
          <span>{logsFiltrados.length}</span>
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button
            type="button"
            className="admin-primary-big-button"
            onClick={() => exportarRelatorioExcel(logsFiltrados)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{ta('btnExportarDados', 'Export data')}</span>
          </button>
        </div>

        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{ta('colData', 'Date')}</th>
                <th>{ta('lblUtilizador', 'Utilizador')}</th>
                <th>{ta('colAcao', 'Action')}</th>
                <th>{ta('colDetalhe', 'Detail')}</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr className="is-loading">
                  <td colSpan="4">{tt('aCarregar', 'A carregar')}</td>
                </tr>
              ) : logsFiltrados.length === 0 ? (
                <tr className="is-empty">
                  <td colSpan="4">{ta('semHistorico', 'No history.')}</td>
                </tr>
              ) : (
                logsFiltrados.map((item) => (
                  <tr key={item.idlog || item.id}>
                    <td>
                      {item.criado_em
                        ? new Date(item.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB')
                        : item.data || '—'}
                    </td>
                    <td>{item.username || '—'}</td>
                    <td>{item.acao || '—'}</td>
                    <td>{item.detalhe || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  const renderCenter = () => {
    if (mainMenu === 'utilizadores') return renderUserCenter();
    if (mainMenu === 'funcionarios') return renderEmployeeCenter();
    if (mainMenu === 'hospitais') return renderHospitalCenter();
    if (mainMenu === 'relatorios') return renderReportsCenter();
    return null;
  };

  return (
    <div className="admin-page-wrapper">
      <main className={`admin-layout ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <aside className="admin-sidebar" aria-label="Navegação lateral do Administrador">
          <button
            className="admin-sidebar__toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-expanded={!isSidebarCollapsed}
            aria-label={ta('toggleMenu', 'Expandir ou recolher menu')}
            type="button"
          >
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="admin-sidebar__brand">
            <img src={logo} alt="SIAGUH" className="admin-sidebar__logo" />
          </div>

          <div className="admin-sidebar__divider" />

          <button
            type="button"
            className="admin-sidebar__profile"
            onClick={() => navigate('/perfil')}
            title={ta('irParaPerfil', 'Ir para o perfil')}
          >
            {fotoUtilizador ? (
              <img src={fotoUtilizador} alt={funcionarioAutenticadoNome} className="admin-sidebar__profile-avatar" />
            ) : (
              <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">
                {obterIniciais(funcionarioAutenticadoNome)}
              </div>
            )}
            <span className="admin-sidebar__profile-name">{funcionarioAutenticadoNome}</span>
          </button>

          <div className="admin-sidebar__divider" />

          <nav className="admin-sidebar__nav" role="navigation">
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'utilizadores' ? 'is-active' : ''}`}
              onClick={() => {
                resetMensagens();
                setMainMenu('utilizadores');
                setUserView('lista');
              }}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="link-text">{ta('menuUtilizadores', 'Users')}</span>
            </button>

            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'funcionarios' ? 'is-active' : ''}`}
              onClick={() => {
                resetMensagens();
                setMainMenu('funcionarios');
                setEmployeeView('lista');
              }}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="link-text">{ta('menuFuncionarios', 'Employees')}</span>
            </button>

            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'hospitais' ? 'is-active' : ''}`}
              onClick={() => {
                resetMensagens();
                setMainMenu('hospitais');
                setHospitalView('lista');
              }}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="link-text">{ta('menuHospitais', 'Hospitals')}</span>
            </button>

            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'relatorios' ? 'is-active' : ''}`}
              onClick={() => {
                resetMensagens();
                setMainMenu('relatorios');
              }}
            >
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="link-text">{ta('menuRelatorios', 'Reports')}</span>
            </button>
          </nav>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__lang-switcher">
              <button type="button" onClick={() => mudarIdioma('pt')} className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`}>PT</button>
              <span>/</span>
              <button type="button" onClick={() => mudarIdioma('en')} className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`}>EN</button>
            </div>

            <button type="button" className="admin-logout-button" onClick={fazerLogout}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="link-text">{ta('botaoSair', 'Logout')}</span>
            </button>
          </div>
        </aside>

        <div className="admin-content-wrapper">
          <div className="admin-content-inner">
            <div className="admin-page-breadcrumbs">
              {breadcrumbsLinks.map((item, index) => (
                <button
                  key={`${item.name}-${index}`}
                  type="button"
                  className={`admin-page-breadcrumbs__item ${index === breadcrumbsLinks.length - 1 ? 'is-current' : ''}`}
                  onClick={() => item.path && navigate(item.path)}
                >
                  {index > 0 && <span className="admin-page-breadcrumbs__separator">/</span>}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <div className="admin-content__body">{renderCenter()}</div>
          </div>

          <FooterLayout />
        </div>
      </main>
    </div>
  );
}