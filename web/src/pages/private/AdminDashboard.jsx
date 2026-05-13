/**
 * @file AdminDashboard.jsx
 * @description Painel central de gestão para os administradores do sistema SIAGUH.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLES, STORAGE_KEYS } from '../../constants/roles';

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

  let raw = entidade.hospitais || entidade.hospital_id || entidade.id_hosp || entidade.idhosp;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }

  if (Array.isArray(raw)) {
    ids = raw.map((h) =>
      typeof h === 'object' && h !== null ? (h.idhosp ?? h.id_hosp ?? h.id ?? h.idHospital) : h
    );
  } else {
    if (entidade.id_hosp) ids.push(entidade.id_hosp);
    if (entidade.idhosp) ids.push(entidade.idhosp);
    if (entidade.hospital_id) ids.push(entidade.hospital_id);
    if (entidade.idHospital) ids.push(entidade.idHospital);
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
  idhosp: Number(hospital?.idhosp ?? hospital?.id_hosp ?? hospital?.id ?? 0),
  nome: hospital?.nome ?? '',
  email: hospital?.email ?? '',
  localidade: hospital?.localizacao ?? hospital?.localidade ?? '',
  contacto: hospital?.telefone ?? hospital?.contacto ?? '',
});

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
  textosAdmin = {},
}) => {
  const idsSelecionados = (valoresSelecionados || [])
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id));

  const disponiveis = hospitaisDisponiveisTotais.filter(
    (h) => !idsSelecionados.includes(Number(h?.idhosp))
  );

  const selecionados = hospitaisDisponiveisTotais.filter(
    (h) => idsSelecionados.includes(Number(h?.idhosp))
  );

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

  const t = (key, fallback) => textosAdmin?.[key] ?? fallback;

  return (
    <div className="selector-hospitais">
      <div className="selector-hospitais-coluna">
        <h4 className="selector-hospitais-titulo">{t('hospitaisDisponiveis', 'Hospitais disponíveis')}</h4>
        <div className="selector-hospitais-lista">
          {disponiveis.length === 0 ? (
            <p className="selector-hospitais-vazio">{t('semHospitaisDisponiveis', 'Sem hospitais disponíveis.')}</p>
          ) : (
            disponiveis.map((h) => (
              <div key={h.idhosp} className="selector-hospitais-item">
                <div className="selector-hospitais-info">
                  <span className="selector-hospitais-nome">{h.nome || '—'}</span>
                  <span className="selector-hospitais-meta">{h.localidade || t('semLocalizacao', 'Sem localização')}</span>
                </div>
                <button
                  type="button"
                  className="selector-hospitais-acao selector-hospitais-acao--add"
                  onClick={() => adicionarHospital(h.idhosp)}
                >
                  {t('adicionar', 'Adicionar')}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="selector-hospitais-coluna">
        <h4 className="selector-hospitais-titulo">{t('hospitaisSelecionados', 'Hospitais selecionados')}</h4>
        <div className="selector-hospitais-lista">
          {selecionados.length === 0 ? (
            <p className="selector-hospitais-vazio">{t('nenhumHospitalSelecionado', 'Nenhum hospital selecionado.')}</p>
          ) : (
            selecionados.map((h) => (
              <div key={h.idhosp} className="selector-hospitais-item">
                <div className="selector-hospitais-info">
                  <span className="selector-hospitais-nome">{h.nome || '—'}</span>
                  <span className="selector-hospitais-meta">{h.localidade || t('semLocalizacao', 'Sem localização')}</span>
                </div>
                <button
                  type="button"
                  className="selector-hospitais-acao selector-hospitais-acao--remove"
                  onClick={() => removerHospital(h.idhosp)}
                >
                  {t('remover', 'Remover')}
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

  const [novoUtilizador, setNovoUtilizador] = useState({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] });
  const [novoProfissional, setNovoProfissional] = useState({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', hospitais: [] });
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
      const data = await apiFetch('/api/profissionais/');
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
      const data = await apiFetch('/api/utilizadores/');
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
      const data = await apiFetch('/api/hospitais/');
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
      const data = await apiFetch('/api/logs/');
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
    () => new Set(utilizadores.map((u) => u.idfunc).filter((id) => id !== null && id !== undefined)),
    [utilizadores]
  );
  const utilizadoresComConta = utilizadores.filter((u) => u.bloqueado !== true);
  const utilizadoresBloqueados = utilizadores.filter((u) => u.bloqueado === true);
  const funcionariosSemConta = profissionais.filter((p) => !idsComConta.has(p.idfunc));

  const utilizadoresComContaFiltrados = utilizadoresComConta.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return normalizar(u.username).includes(normalizar(filtroUserUsername))
      && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome))
      && String(u.idfunc || '').includes(filtroUserNumero);
  });

  const funcionariosSemContaFiltrados = funcionariosSemConta.filter((p) =>
    normalizar(p.nome).includes(normalizar(filtroUserNome)) && String(p.idfunc || '').includes(filtroUserNumero)
  );

  const utilizadoresBloqueadosFiltrados = utilizadoresBloqueados.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return normalizar(u.username).includes(normalizar(filtroUserUsername))
      && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome))
      && String(u.idfunc || '').includes(filtroUserNumero);
  });

  const funcionariosFiltrados = profissionais.filter((p) =>
    normalizar(p.nome).includes(normalizar(filtroFuncNome))
    && String(p.idfunc || '').includes(filtroFuncNumero)
    && (filtroFuncTipo === '' || normalizar(p.tipofunc) === normalizar(filtroFuncTipo))
  );

  const funcionariosPesquisaNovoUser = funcionariosSemConta.filter((p) =>
    normalizar(p.nome).includes(normalizar(pesquisaFuncionarioNovoUser)) || String(p.idfunc).includes(pesquisaFuncionarioNovoUser)
  );

  const hospitaisFiltrados = hospitais.filter((h) =>
    normalizar(h.nome).includes(normalizar(filtroHospitalNome))
    && normalizar(h.localidade || '').includes(normalizar(filtroHospitalLocalidade))
  );

  const logsFiltrados = logs.filter((log) => {
    const termo = normalizar(filtroLogTermo);
    const matchTermo =
      termo === '' ||
      normalizar(log.acao || '').includes(termo) ||
      normalizar(log.detalhe || '').includes(termo) ||
      normalizar(log.username || '').includes(termo);
    let matchData = true;
    if (filtroLogData) matchData = (log.criado_em ? new Date(log.criado_em).toISOString().split('T')[0] : '') === filtroLogData;
    return matchTermo && matchData;
  });

  const selecionarFuncionarioNovoUser = (funcionario) => {
    setNovoUtilizador((prev) => ({
      ...prev,
      idfunc: funcionario.idfunc,
      username: gerarUsername(funcionario.nome),
      role: funcionario.tipofunc || ROLES.ADMIN,
      hospitais: extrairHospitais(funcionario),
    }));
    setPesquisaFuncionarioNovoUser(funcionario.nome);
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

    const idfunc = Number(utilizador?.idfunc);
    if (!idfunc || Number.isNaN(idfunc)) {
      setErroUser('ID do utilizador inválido.');
      return;
    }

    try {
      const [utilizadorData, hospitaisData] = await Promise.all([
        apiFetch(`/api/utilizadores/${idfunc}`),
        apiFetch(`/api/trabalha/funcionario/${idfunc}`),
      ]);

      const hospitaisIds = Array.isArray(hospitaisData)
        ? hospitaisData
          .map((item) => Number(item?.idhosp ?? item?.idHosp ?? item?.id))
          .filter((id) => !Number.isNaN(id) && id > 0)
        : [];

      const profissional = profissionais.find((p) => Number(p.idfunc) === idfunc);

      setUtilizadorEditando({
        idfunc,
        username: utilizadorData?.username ?? utilizador.username ?? '',
        password: '',
        role: utilizadorData?.role ?? profissional?.tipofunc ?? ROLES.ADMIN,
        nome: profissional?.nome ?? utilizador.nome ?? '',
        sexo: profissional?.sexo ?? 'M',
        bloqueado: utilizadorData?.bloqueado ?? utilizador.bloqueado ?? false,
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
      idfunc: funcionario.idfunc,
      nome: funcionario.nome,
      tipofunc: funcionario.tipofunc,
      sexo: funcionario.sexo,
      username: gerarUsername(funcionario.nome),
      password: '',
      role: funcionario.tipofunc || ROLES.ADMIN,
      hospitais: extrairHospitais(funcionario),
      isNovo: true,
    });
    setUserView('editar');
  };

  const abrirNovoFuncionario = () => {
    resetMensagens();
    setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', hospitais: [] });
    setFuncionarioEditando(null);
    setEmployeeView('novo');
  };

  const abrirEditarFuncionario = async (funcionario) => {
    resetMensagens();
    setFuncionarioEditando({ ...funcionario, hospitais: [] });
    setEmployeeView('editar');
    try {
      setLoadingProfissionais(true);
      const hospitaisData = await apiFetch(`/api/trabalha/funcionario/${funcionario.idfunc}`);
      const idsHospitais = Array.isArray(hospitaisData)
        ? hospitaisData.map((h) => Number(h.idhosp || h.idHosp || h.id)).filter((id) => !Number.isNaN(id) && id > 0)
        : [];
      setFuncionarioEditando((prev) => ({ ...prev, hospitais: idsHospitais }));
    } catch (err) {
      setErroFunc('Aviso: Não foi possível carregar os hospitais atuais deste funcionário.');
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
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
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

  const criarFuncionario = async (e) => {
    e.preventDefault();
    setMensagemFunc('');
    setErroFunc('');
    try {
      setSubmittingFunc(true);
      const payload = { nome: novoProfissional.nome, tipofunc: novoProfissional.tipofunc, sexo: novoProfissional.sexo };
      const data = await apiFetch('/api/profissionais/', { method: 'POST', body: JSON.stringify(payload) });
      for (const idhosp of novoProfissional.hospitais || []) {
        await apiFetch('/api/trabalha/', {
          method: 'POST',
          body: JSON.stringify({ idfunc: data.idfunc, idhosp: Number(idhosp) }),
        });
      }
      setMensagemFunc(ta('sucessoCriarFunc', 'Employee created successfully.'));
      adicionarHistorico('Criar funcionário', `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`);
      setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', hospitais: [] });
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
      await apiFetch('/api/hospitais/', { method: 'POST', body: JSON.stringify(payload) });
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
      const idfunc = utilizadorEditando.idfunc;
      const payloadUser = {
        username: utilizadorEditando.username,
        hospitais: (utilizadorEditando.hospitais || []).map(Number),
        bloqueado: utilizadorEditando.bloqueado ?? null,
      };
      if (utilizadorEditando.password?.trim()) payloadUser.password = utilizadorEditando.password.trim();

      await apiFetch(`/api/utilizadores/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify(payloadUser),
      });

      await apiFetch(`/api/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: utilizadorEditando.nome,
          tipofunc: utilizadorEditando.role,
          sexo: utilizadorEditando.sexo,
        }),
      });

      setMensagemUser(ta('sucessoEditarUser', 'User updated successfully.'));
      adicionarHistorico('Editar utilizador', `Foram atualizados os dados de ${utilizadorEditando.username}.`);
      await carregarUtilizadores();
      await carregarProfissionais();
      setUtilizadorEditando(null);
      setUserView('lista');
    } catch (err) {
      setErroUser(err.message);
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
      const idfunc = funcionarioEditando.idfunc;

      await apiFetch(`/api/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: funcionarioEditando.nome,
          tipofunc: funcionarioEditando.tipofunc,
          sexo: funcionarioEditando.sexo,
        }),
      });

      let hospitaisAntigos = [];
      try {
        const resAntigos = await apiFetch(`/api/trabalha/funcionario/${idfunc}`);
        if (Array.isArray(resAntigos)) {
          hospitaisAntigos = resAntigos.map((h) => Number(h.idhosp || h.idHosp || h.id)).filter((id) => !Number.isNaN(id));
        }
      } catch {
        hospitaisAntigos = [];
      }

      const hospitaisSelecionados = (funcionarioEditando.hospitais || []).map(Number);
      const adicionar = hospitaisSelecionados.filter((h) => !hospitaisAntigos.includes(h));
      const remover = hospitaisAntigos.filter((h) => !hospitaisSelecionados.includes(h));

      for (const idhosp of adicionar) {
        await apiFetch('/api/trabalha/', {
          method: 'POST',
          body: JSON.stringify({ idfunc, idhosp }),
        });
      }

      for (const idhosp of remover) {
        await apiFetch(`/api/trabalha/${idfunc}/${idhosp}`, {
          method: 'DELETE',
        });
      }

      setMensagemFunc(ta('sucessoEditarFunc', 'Employee updated successfully.'));
      adicionarHistorico('Editar funcionário', `Foram atualizados os dados do funcionário ${funcionarioEditando.nome}.`);
      await carregarProfissionais();
      setFuncionarioEditando(null);
      setEmployeeView('lista');
    } catch (err) {
      setErroFunc(err.message);
    } finally {
      setSubmittingFunc(false);
    }
  };

  const criarUtilizadorAPartirFuncionario = async (e) => {
    e.preventDefault();
    setMensagemUser('');
    setErroUser('');
    try {
      setSubmittingUser(true);
      const payload = {
        idfunc: Number(utilizadorEditando.idfunc),
        username: utilizadorEditando.username,
        password: utilizadorEditando.password,
        role: utilizadorEditando.role,
      };
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMensagemUser(ta('sucessoCriarUser', 'User created successfully.'));
      adicionarHistorico('Criar utilizador', `Foi criado o utilizador ${data.username}.`);
      await carregarUtilizadores();
      setUtilizadorEditando(null);
      setUserView('lista');
    } catch (err) {
      setErroUser(err.message);
    } finally {
      setSubmittingUser(false);
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
      await apiFetch(`/api/hospitais/${hospitalEditando.idhosp || hospitalEditando.id_hosp}`, {
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
      await apiFetch(`/api/utilizadores/${utilizador.idfunc}`, {
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
      await apiFetch(`/api/utilizadores/${utilizador.idfunc}`, {
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

  const renderUserCenter = () => {
    if (userView === 'novo') {
      const funcSelecionado = profissionais.find((p) => p.idfunc === Number(novoUtilizador.idfunc));
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{ta('btnNovoUtilizador', 'New user')}</h2></div>
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
                      if (!e.target.value) setNovoUtilizador((prev) => ({ ...prev, idfunc: '', username: '' }));
                    }}
                    onFocus={() => setDropdownAberto(true)}
                    autoComplete="off"
                  />
                  {funcSelecionado && <div className="admin-dropdown__selected">✓ #{funcSelecionado.idfunc} — {funcSelecionado.nome}</div>}
                  {dropdownAberto && (
                    <div className="admin-dropdown__list">
                      {funcionariosPesquisaNovoUser.length === 0 ? (
                        <div className="admin-dropdown__empty">{tt('semResultados', 'Sem resultados')}</div>
                      ) : (
                        funcionariosPesquisaNovoUser.map((p) => (
                          <button key={p.idfunc} type="button" className="admin-dropdown__item" onClick={() => selecionarFuncionarioNovoUser(p)}>
                            <span className="admin-dropdown__item-name">{p.nome}</span>
                            <span className="admin-dropdown__item-meta">#{p.idfunc} · {p.tipofunc}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-username">{ta('lblUsername', 'Username')}</label>
                <input id="user-username" name="username" type="text" value={novoUtilizador.username} onChange={handleNovoUserChange} required />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-password">{ta('lblPassword', 'Password')}</label>
                <input id="user-password" name="password" type="password" value={novoUtilizador.password} onChange={handleNovoUserChange} required />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-role">{ta('lblFuncao', 'Role')}</label>
                <select id="user-role" name="role" value={novoUtilizador.role} onChange={handleNovoUserChange}>
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médico')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblAssociarHospitais', 'Associar hospitais')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoUtilizador.hospitais}
                  onChange={(novosIds) => setNovoUtilizador((prev) => ({ ...prev, hospitais: novosIds }))}
                  textosAdmin={ta}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingUser || !novoUtilizador.idfunc}>
                {submittingUser ? tt('aCarregar', 'A carregar') : ta('btnNovoUtilizador', 'New user')}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => setUserView('lista')}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (userView === 'editar' && utilizadorEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{utilizadorEditando.isNovo ? ta('btnNovoUtilizador', 'New user') : tt('editar', 'Editar')}</h2>
            <p>#{utilizadorEditando.idfunc} — {utilizadorEditando.nome}</p>
          </div>

          <form className="admin-form" onSubmit={utilizadorEditando.isNovo ? criarUtilizadorAPartirFuncionario : guardarUtilizadorEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="edit-user-id">{ta('lblNumFuncionario', 'Employee No.')}</label>
                <input id="edit-user-id" type="text" value={utilizadorEditando.idfunc || ''} readOnly />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-nome">{ta('lblNome', 'Name')}</label>
                <input id="edit-user-nome" name="nome" type="text" value={utilizadorEditando.nome || ''} onChange={handleEditarUserChange} />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-username">{ta('lblUsername', 'Username')}</label>
                <input id="edit-user-username" name="username" type="text" value={utilizadorEditando.username || ''} onChange={handleEditarUserChange} />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-password">
                  {utilizadorEditando.isNovo ? ta('lblPassword', 'Password') : `${ta('lblPassword', 'Password')} (opcional)`}
                </label>
                <input
                  id="edit-user-password"
                  name="password"
                  type="password"
                  value={utilizadorEditando.password || ''}
                  onChange={handleEditarUserChange}
                  required={!!utilizadorEditando.isNovo}
                  placeholder={utilizadorEditando.isNovo ? ta('lblPassword', 'Password') : ta('placeholderPasswordOpcional', 'Deixa vazio para manter a password atual')}
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-role">{ta('lblFuncao', 'Role')}</label>
                <select id="edit-user-role" name="role" value={utilizadorEditando.role || ROLES.ADMIN} onChange={handleEditarUserChange}>
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médico')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="edit-user-sexo">{ta('lblSexo', 'Gender')}</label>
                <select id="edit-user-sexo" name="sexo" value={utilizadorEditando.sexo || 'M'} onChange={handleEditarUserChange}>
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblGerirHospitaisAssociados', 'Gerir hospitais associados')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={utilizadorEditando.hospitais}
                  onChange={(novosIds) => setUtilizadorEditando((prev) => ({ ...prev, hospitais: novosIds }))}
                  textosAdmin={ta}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">{tt('guardar', 'Guardar')}</button>
              <button type="button" className="admin-secondary-button" onClick={() => { setUtilizadorEditando(null); setUserView('lista'); }}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{ta('menuUtilizadores', 'Users')}</h2>
          <p>{ta('descUtilizadores', 'Manage access accounts, pending accounts and blocked users.')}</p>
        </div>

        <div aria-live="polite">
          {erroUtilizadores && <p className="admin-form__error">{erroUtilizadores}</p>}
          {erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoUtilizador}>
            {ta('btnNovoUtilizador', 'New user')}
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-user-username">{ta('lblUsername', 'Username')}</label>
            <input id="filter-user-username" type="text" value={filtroUserUsername} onChange={(e) => setFiltroUserUsername(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input id="filter-user-nome" type="text" value={filtroUserNome} onChange={(e) => setFiltroUserNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-num">{tt('pesquisarNumero', 'Pesquisar número')}</label>
            <input id="filter-user-num" type="text" value={filtroUserNumero} onChange={(e) => setFiltroUserNumero(e.target.value)} />
          </div>
        </div>

        <div className="admin-users-grid-top">
          <div className="admin-table-card">
            <div className="admin-table-card__header"><h3>{ta('tblUtilizadoresComConta', 'Users with account')}</h3><span>{utilizadoresComContaFiltrados.length}</span></div>
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
                    <tr><td colSpan="5">{tt('aCarregar', 'A carregar')}</td></tr>
                  ) : utilizadoresComContaFiltrados.length === 0 ? (
                    <tr><td colSpan="5">{tt('semResultados', 'Sem resultados')}</td></tr>
                  ) : (
                    utilizadoresComContaFiltrados.map((u) => {
                      const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                      return (
                        <tr key={u.idfunc || u.username}>
                          <td>{u.idfunc}</td>
                          <td>{prof?.nome || '—'}</td>
                          <td>{u.username}</td>
                          <td>{u.role || prof?.tipofunc || '—'}</td>
                          <td className="admin-table__actions">
                            <button type="button" className="admin-secondary-button" onClick={() => abrirEditarUtilizador(u)}>{tt('editar', 'Editar')}</button>
                            <button type="button" className="admin-button--danger admin-secondary-button" onClick={() => bloquearUtilizador(u)}>{ta('btnBloquear', 'Bloquear')}</button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-table-card">
            <div className="admin-table-card__header"><h3>{ta('tblFuncionariosSemConta', 'Employees without user account')}</h3><span>{funcionariosSemContaFiltrados.length}</span></div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{ta('lblNumFuncionario', 'Employee No.')}</th>
                    <th>{ta('lblNome', 'Name')}</th>
                    <th>{ta('lblFuncao', 'Role')}</th>
                    <th>{ta('lblAcoes', 'Ações')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProfissionais ? (
                    <tr><td colSpan="4">{tt('aCarregar', 'A carregar')}</td></tr>
                  ) : funcionariosSemContaFiltrados.length === 0 ? (
                    <tr><td colSpan="4">{tt('semResultados', 'Sem resultados')}</td></tr>
                  ) : (
                    funcionariosSemContaFiltrados.map((p) => (
                      <tr key={p.idfunc}>
                        <td>{p.idfunc}</td>
                        <td>{p.nome}</td>
                        <td>{p.tipofunc}</td>
                        <td><button type="button" className="admin-secondary-button" onClick={() => abrirCriarAPartirFuncionario(p)}>{ta('btnNovoUtilizador', 'New user')}</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header"><h3>{ta('tblUtilizadoresBloqueados', 'Blocked users')}</h3><span>{utilizadoresBloqueadosFiltrados.length}</span></div>
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
                  <tr><td colSpan="5">{tt('aCarregar', 'A carregar')}</td></tr>
                ) : utilizadoresBloqueadosFiltrados.length === 0 ? (
                  <tr><td colSpan="5">{ta('semBloqueados', 'No blocked users.')}</td></tr>
                ) : (
                  utilizadoresBloqueadosFiltrados.map((u) => {
                    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                    return (
                      <tr key={u.idfunc || u.username}>
                        <td>{u.idfunc}</td>
                        <td>{prof?.nome || '—'}</td>
                        <td>{u.username}</td>
                        <td>{u.role || prof?.tipofunc || '—'}</td>
                        <td>
                          <button type="button" className="admin-button--success admin-secondary-button" onClick={() => desbloquearUtilizador(u)}>
                            {ta('btnDesbloquear', 'Desbloquear')}
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
          <div className="admin-panel-section__header"><h2>{ta('btnNovoFuncionario', 'New employee')}</h2></div>
          <form className="admin-form" onSubmit={criarFuncionario}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="func-nome">{ta('lblNome', 'Name')}</label>
                <input id="func-nome" name="nome" type="text" value={novoProfissional.nome} onChange={handleNovoProfChange} required />
              </div>
              <div className="admin-form__group">
                <label htmlFor="func-role">{ta('lblFuncao', 'Role')}</label>
                <select id="func-role" name="tipofunc" value={novoProfissional.tipofunc} onChange={handleNovoProfChange}>
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médico')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label htmlFor="func-sexo">{ta('lblSexo', 'Gender')}</label>
                <select id="func-sexo" name="sexo" value={novoProfissional.sexo} onChange={handleNovoProfChange}>
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblAssociarHospitais', 'Associar hospitais')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoProfissional.hospitais}
                  onChange={(novosIds) => setNovoProfissional((prev) => ({ ...prev, hospitais: novosIds }))}
                  textosAdmin={ta}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
              {erroFunc && <p className="admin-form__error">{erroFunc}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingFunc}>
                {submittingFunc ? tt('aCarregar', 'A carregar') : tt('guardar', 'Guardar')}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => setEmployeeView('lista')}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (employeeView === 'editar' && funcionarioEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{tt('editar', 'Editar')}</h2></div>
          <form className="admin-form" onSubmit={guardarFuncionarioEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="efunc-nome">{ta('lblNome', 'Name')}</label>
                <input id="efunc-nome" name="nome" type="text" value={funcionarioEditando.nome || ''} onChange={handleEditarFuncChange} />
              </div>

              <div className="admin-form__group">
                <label htmlFor="efunc-role">{ta('lblFuncao', 'Role')}</label>
                <select id="efunc-role" name="tipofunc" value={funcionarioEditando.tipofunc || ROLES.ADMIN} onChange={handleEditarFuncChange}>
                  <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
                  <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médico')}</option>
                  <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
                  <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="efunc-sexo">{ta('lblSexo', 'Gender')}</label>
                <select id="efunc-sexo" name="sexo" value={funcionarioEditando.sexo || 'M'} onChange={handleEditarFuncChange}>
                  <option value="M">{ta('sexoMasculino', 'Masculino')}</option>
                  <option value="F">{ta('sexoFeminino', 'Feminino')}</option>
                </select>
              </div>

              <div className="admin-form__group admin-form__group--full">
                <label>{ta('lblGerirHospitaisAssociados', 'Gerir hospitais associados')}</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={funcionarioEditando.hospitais}
                  onChange={(novosIds) => setFuncionarioEditando((prev) => ({ ...prev, hospitais: novosIds }))}
                  textosAdmin={ta}
                />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
              {erroFunc && <p className="admin-form__error">{erroFunc}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingFunc}>
                {tt('guardar', 'Guardar')}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => { setFuncionarioEditando(null); setEmployeeView('lista'); }}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{ta('menuFuncionarios', 'Employees')}</h2>
          <p>{ta('descFuncionarios', 'Manage employees, create new records and assign hospitals.')}</p>
        </div>

        <div aria-live="polite">{erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}</div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoFuncionario}>
            {ta('btnNovoFuncionario', 'New employee')}
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-func-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input id="filter-func-nome" type="text" value={filtroFuncNome} onChange={(e) => setFiltroFuncNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-func-num">{tt('pesquisarNumero', 'Pesquisar número')}</label>
            <input id="filter-func-num" type="text" value={filtroFuncNumero} onChange={(e) => setFiltroFuncNumero(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-func-tipo">{ta('lblFuncao', 'Role')}</label>
            <select id="filter-func-tipo" value={filtroFuncTipo} onChange={(e) => setFiltroFuncTipo(e.target.value)}>
              <option value="">{ta('todasFuncoes', 'Todas as funções')}</option>
              <option value={ROLES.ADMIN}>{ta('roleAdmin', 'Admin')}</option>
              <option value={ROLES.MEDICO}>{ta('roleMedico', 'Médico')}</option>
              <option value={ROLES.ENFERMEIRO}>{ta('roleEnfermeiro', 'Enfermeiro')}</option>
              <option value={ROLES.RECECIONISTA}>{ta('roleRececionista', 'Rececionista')}</option>
            </select>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header"><h3>{ta('menuFuncionarios', 'Employees')}</h3><span>{funcionariosFiltrados.length}</span></div>
          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{ta('lblNumFuncionario', 'Employee No.')}</th>
                  <th>{ta('lblNome', 'Name')}</th>
                  <th>{ta('lblFuncao', 'Role')}</th>
                  <th>{ta('lblHospitais', 'Hospitals')}</th>
                  <th>{ta('lblAcoes', 'Ações')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingProfissionais ? (
                  <tr><td colSpan="5">{tt('aCarregar', 'A carregar')}</td></tr>
                ) : funcionariosFiltrados.length === 0 ? (
                  <tr><td colSpan="5">{tt('semResultados', 'Sem resultados')}</td></tr>
                ) : (
                  funcionariosFiltrados.map((f) => (
                    <tr key={f.idfunc}>
                      <td>{f.idfunc}</td>
                      <td>{f.nome}</td>
                      <td>{f.tipofunc}</td>
                      <td>{getHospitalNomeFuncionario(f)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() => u?.idfunc ? abrirEditarUtilizador(u) : setErroUser('Utilizador inválido.')}
                        >
                          {tt('editar', 'Editar')}
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
  };

  const renderHospitalCenter = () => {
    if (hospitalView === 'novo') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{ta('btnNovoHospital', 'New hospital')}</h2></div>
          <form className="admin-form" onSubmit={criarHospital}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="hosp-nome">{ta('lblNome', 'Name')}</label>
                <input id="hosp-nome" name="nome" type="text" value={novoHospital.nome} onChange={handleNovoHospitalChange} required />
              </div>
              <div className="admin-form__group">
                <label htmlFor="hosp-loc">{ta('lblLocalizacao', 'Location')}</label>
                <input id="hosp-loc" name="localidade" type="text" value={novoHospital.localidade} onChange={handleNovoHospitalChange} required />
              </div>
              <div className="admin-form__group">
                <label htmlFor="hosp-email">{ta('lblEmail', 'Email')}</label>
                <input id="hosp-email" name="email" type="email" value={novoHospital.email} onChange={handleNovoHospitalChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="hosp-contacto">{ta('lblContacto', 'Contact')}</label>
                <input id="hosp-contacto" name="contacto" type="text" value={novoHospital.contacto} onChange={handleNovoHospitalChange} />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
              {erroHospital && <p className="admin-form__error">{erroHospital}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingHospital}>
                {tt('guardar', 'Guardar')}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => setHospitalView('lista')}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (hospitalView === 'editar' && hospitalEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{tt('editar', 'Editar')}</h2></div>
          <form className="admin-form" onSubmit={guardarHospitalEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="ehosp-nome">{ta('lblNome', 'Name')}</label>
                <input id="ehosp-nome" name="nome" type="text" value={hospitalEditando.nome || ''} onChange={handleEditarHospitalChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="ehosp-loc">{ta('lblLocalizacao', 'Location')}</label>
                <input id="ehosp-loc" name="localidade" type="text" value={hospitalEditando.localidade || ''} onChange={handleEditarHospitalChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="ehosp-email">{ta('lblEmail', 'Email')}</label>
                <input id="ehosp-email" name="email" type="email" value={hospitalEditando.email || ''} onChange={handleEditarHospitalChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="ehosp-contacto">{ta('lblContacto', 'Contact')}</label>
                <input id="ehosp-contacto" name="contacto" type="text" value={hospitalEditando.contacto || ''} onChange={handleEditarHospitalChange} />
              </div>
            </div>

            <div aria-live="polite">
              {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
              {erroHospital && <p className="admin-form__error">{erroHospital}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingHospital}>
                {tt('guardar', 'Guardar')}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => { setHospitalEditando(null); setHospitalView('lista'); }}>
                {tt('cancelar', 'Cancelar')}
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{ta('menuHospitais', 'Hospitals')}</h2>
          <p>{ta('descHospitais', 'List of existing hospitals and editing in the central panel.')}</p>
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoHospital}>
            {ta('btnNovoHospital', 'New hospital')}
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-hosp-nome">{tt('pesquisarNome', 'Pesquisar nome')}</label>
            <input id="filter-hosp-nome" type="text" value={filtroHospitalNome} onChange={(e) => setFiltroHospitalNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-hosp-loc">{ta('lblLocalizacao', 'Location')}</label>
            <input id="filter-hosp-loc" type="text" value={filtroHospitalLocalidade} onChange={(e) => setFiltroHospitalLocalidade(e.target.value)} />
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
                  <th>{tt('editar', 'Editar')}</th>
                </tr>
              </thead>
              <tbody>
                {loadingHospitais ? (
                  <tr><td colSpan="5">{tt('aCarregar', 'A carregar')}</td></tr>
                ) : hospitaisFiltrados.length === 0 ? (
                  <tr><td colSpan="5">{tt('semResultados', 'Sem resultados')}</td></tr>
                ) : (
                  hospitaisFiltrados.map((h) => (
                    <tr key={h.idhosp}>
                      <td>{h.nome || '—'}</td>
                      <td>{h.localidade || '—'}</td>
                      <td>{h.email || '—'}</td>
                      <td>{h.contacto || '—'}</td>
                      <td>
                        <button type="button" className="admin-secondary-button" onClick={() => abrirEditarHospital(h)}>
                          {tt('editar', 'Editar')}
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
  };

  const renderReportsCenter = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{ta('menuRelatorios', 'Reports')}</h2>
        <p>{ta('descRelatorios', 'Activity summary and history.')}</p>
      </div>

      <div aria-live="polite">{erroLogs && <p className="admin-form__error">{erroLogs}</p>}</div>

      <div className="admin-report-grid">
        <div className="admin-report-card">
          <h3>{ta('menuUtilizadores', 'Users')}</h3>
          <p>{ta('relTotalComConta', 'Total with account')}</p>
          <strong>{utilizadoresComConta.length}</strong>
        </div>
        <div className="admin-report-card">
          <h3>{ta('menuFuncionarios', 'Employees')}</h3>
          <p>{ta('relTotalRegistado', 'Total registered')}</p>
          <strong>{profissionais.length}</strong>
        </div>
      </div>

      <div className="admin-filters" style={{ marginTop: '1.5rem' }}>
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
          <input type="date" value={filtroLogData} onChange={(e) => setFiltroLogData(e.target.value)} />
        </div>
      </div>

      <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
        <div className="admin-table-card__header">
          <h3>{ta('menuRelatorios', 'Reports')}</h3>
          <span>{logsFiltrados.length}</span>
          <div className="admin-header-actions">
            <button type="button" className="admin-secondary-button" onClick={carregarLogs}>{ta('btnAtualizar', '↻ Refresh')}</button>
            <button type="button" className="admin-primary-big-button" onClick={exportarRelatorioSeguro}>{ta('btnExportarDados', 'Exportar dados')}</button>
          </div>
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
                <tr><td colSpan="4">{tt('aCarregar', 'A carregar')}</td></tr>
              ) : logsFiltrados.length === 0 ? (
                <tr><td colSpan="4">{ta('semHistorico', 'No history.')}</td></tr>
              ) : (
                logsFiltrados.map((item) => (
                  <tr key={item.idlog || item.id}>
                    <td>{item.criado_em ? new Date(item.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') : item.data || '—'}</td>
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

        <section className="admin-content-wrapper">
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
        </section>
      </main>
    </div>
  );
}