/**
 * @file AdminDashboard.jsx
 * @description Painel central de gestão para os administradores do sistema SIAGUH.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/logo100fundo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { ROLES } from '../../constants/roles';

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================
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

// Extrator super-robusto para ler qualquer formato que a API devolva e devolver Array de NUMBERS
const extrairHospitais = (entidade) => {
  if (!entidade) return [];
  let ids = [];

  let raw = entidade.hospitais || entidade.hospital_id || entidade.id_hosp || entidade.idhosp;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { /* ignorar erro de parse */ }
  }

  if (Array.isArray(raw)) {
    ids = raw.map(h => typeof h === 'object' && h !== null ? (h.idhosp ?? h.id_hosp ?? h.id ?? h.idHospital) : h);
  } else {
    if (entidade.id_hosp) ids.push(entidade.id_hosp);
    if (entidade.idhosp) ids.push(entidade.idhosp);
    if (entidade.hospital_id) ids.push(entidade.hospital_id);
    if (entidade.idHospital) ids.push(entidade.idHospital);
  }

  // Converter todos para número e remover null/undefined/0
  return [...new Set(ids.filter(val => val !== null && val !== undefined && val !== '').map(Number).filter(val => !isNaN(val) && val > 0))];
};

const mapHospitalFromApi = (hospital) => ({
  ...hospital,
  idhosp: Number(hospital?.idhosp ?? hospital?.id_hosp ?? hospital?.id ?? 0),
  nome: hospital?.nome ?? '',
  email: hospital?.email ?? '',
  localidade: hospital?.localizacao ?? hospital?.localidade ?? '',
  contacto: hospital?.telefone ?? hospital?.contacto ?? '',
});

// ==========================================
// COMPONENTE: LISTA DE TRANSFERÊNCIA (UI)
// ==========================================
const SelectorHospitais = ({ hospitaisDisponiveisTotais, valoresSelecionados, onChange }) => {
  const idsSelecionados = (valoresSelecionados || []).map(Number);
  const disponiveis = hospitaisDisponiveisTotais.filter(h => !idsSelecionados.includes(Number(h.idhosp)));
  const selecionados = hospitaisDisponiveisTotais.filter(h => idsSelecionados.includes(Number(h.idhosp)));

  return (
    <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem', flexWrap: 'wrap' }}>

      {/* Lado Esquerdo: Disponíveis */}
      <div style={{ flex: '1 1 250px', border: '1px solid #ccc', borderRadius: '6px', padding: '0.8rem', background: '#fff' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #eee', paddingBottom: '0.4rem' }}>
          Hospitais Disponíveis ({disponiveis.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.2rem' }}>
          {disponiveis.length === 0 && <div style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>Nenhum hospital disponível.</div>}
          {disponiveis.map(h => (
            <button key={h.idhosp} type="button" onClick={() => onChange([...idsSelecionados, Number(h.idhosp)])}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #eee', background: '#f9f9f9', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}>
              <span style={{ textAlign: 'left' }}>{h.nome}</span>
              <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1' }}>&rarr;</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lado Direito: Selecionados */}
      <div style={{ flex: '1 1 250px', border: '2px solid #3eb489', borderRadius: '6px', padding: '0.8rem', background: '#f0fbf7' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#27ae60', fontSize: '0.9rem', borderBottom: '1px solid #c8e6c9', paddingBottom: '0.4rem' }}>
          Hospitais Atribuídos ({selecionados.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.2rem' }}>
          {selecionados.length === 0 && <div style={{ fontSize: '0.85rem', color: '#27ae60', fontStyle: 'italic' }}>Nenhum hospital atribuído.</div>}
          {selecionados.map(h => (
            <button key={h.idhosp} type="button" onClick={() => onChange(idsSelecionados.filter(id => id !== Number(h.idhosp)))}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '1px solid #b2e2cd', background: '#d5f5e3', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }}>
              <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1' }}>&larr;</span>
              <span style={{ textAlign: 'right', color: '#1e8449', fontWeight: 'bold' }}>{h.nome}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};


// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { textos, idioma, mudarIdioma } = useLanguage();

  // Estados da Interface
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('utilizadores');
  const [userView, setUserView] = useState('lista');
  const [employeeView, setEmployeeView] = useState('lista');
  const [hospitalView, setHospitalView] = useState('lista');

  // Estados de Dados
  const [profissionais, setProfissionais] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [hospitais, setHospitais] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [logs, setLogs] = useState([]);

  // Estados de Loading
  const [loadingProfissionais, setLoadingProfissionais] = useState(false);
  const [loadingUtilizadores, setLoadingUtilizadores] = useState(false);
  const [loadingHospitais, setLoadingHospitais] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Estados de Erro
  const [erroProfissionais, setErroProfissionais] = useState('');
  const [erroUtilizadores, setErroUtilizadores] = useState('');
  const [erroHospitais, setErroHospitais] = useState('');
  const [erroLogs, setErroLogs] = useState('');

  // Estados de Filtro e Pesquisa
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

  // Estados de Criação/Edição
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

  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState(textos.admin.tituloPainel);

  const breadcrumbsLinks = [
    { name: textos.geral.inicio, path: '/' },
    { name: textos.admin.tituloPainel, path: '/admin' },
  ];

  useEffect(() => { carregarTudo(); iniciarHistoricoBase(); }, []);
  useEffect(() => { resolverUtilizadorAutenticado(); }, [profissionais, utilizadores, textos.admin.tituloPainel]);
  useEffect(() => {
    const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownAberto(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => { if (mainMenu === 'relatorios') carregarLogs(); }, [mainMenu]);

  const iniciarHistoricoBase = () => { setHistorico([{ id: 1, acao: 'Sistema iniciado', detalhe: 'O painel de administração foi carregado.', data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') }]); };
  const adicionarHistorico = (acao, detalhe) => { setHistorico((prev) => [{ id: Date.now() + Math.random(), acao, detalhe, data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') }, ...prev]); };

  const resetMensagens = () => {
    setMensagemUser(''); setErroUser('');
    setMensagemFunc(''); setErroFunc('');
    setMensagemHospital(''); setErroHospital('');
  };

  const resolverUtilizadorAutenticado = () => {
    try {
      const rawUser = sessionStorage.getItem('user');
      const userObj = rawUser ? JSON.parse(rawUser) : null;
      if (userObj?.nome) return setFuncionarioAutenticadoNome(userObj.nome);
      if (userObj?.username) return setFuncionarioAutenticadoNome(userObj.username);
      setFuncionarioAutenticadoNome(textos.admin.tituloPainel);
    } catch {
      setFuncionarioAutenticadoNome(textos.admin.tituloPainel);
    }
  };

  const carregarTudo = async () => { await Promise.all([carregarProfissionais(), carregarUtilizadores(), carregarHospitais(), carregarLogs()]); };
  const carregarProfissionais = async () => { try { setLoadingProfissionais(true); setErroProfissionais(''); const data = await apiFetch('/api/profissionais/'); setProfissionais(Array.isArray(data) ? data : []); } catch (err) { setErroProfissionais(err.message); setProfissionais([]); } finally { setLoadingProfissionais(false); } };
  const carregarUtilizadores = async () => { try { setLoadingUtilizadores(true); setErroUtilizadores(''); const data = await apiFetch('/api/utilizadores/'); setUtilizadores(Array.isArray(data) ? data : []); } catch (err) { setErroUtilizadores(err.message); setUtilizadores([]); } finally { setLoadingUtilizadores(false); } };
  const carregarHospitais = async () => { try { setLoadingHospitais(true); setErroHospitais(''); const data = await apiFetch('/api/api/hospitais/'); setHospitais(Array.isArray(data) ? data.map(mapHospitalFromApi) : []); } catch (err) { setErroHospitais(err.message); setHospitais([]); } finally { setLoadingHospitais(false); } };
  const carregarLogs = async () => { try { setLoadingLogs(true); setErroLogs(''); const data = await apiFetch('/api/logs/'); setLogs(Array.isArray(data) ? data : []); } catch (err) { setErroLogs(err.message); setLogs([]); } finally { setLoadingLogs(false); } };

  // Filtros
  const idsComConta = useMemo(() => new Set(utilizadores.map((u) => u.idfunc).filter((id) => id !== null && id !== undefined)), [utilizadores]);
  const utilizadoresComConta = utilizadores.filter((u) => u.bloqueado !== true);
  const utilizadoresBloqueados = utilizadores.filter((u) => u.bloqueado === true);
  const funcionariosSemConta = profissionais.filter((p) => !idsComConta.has(p.idfunc));

  const utilizadoresComContaFiltrados = utilizadoresComConta.filter((u) => { const prof = profissionais.find((p) => p.idfunc === u.idfunc); return normalizar(u.username).includes(normalizar(filtroUserUsername)) && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) && String(u.idfunc || '').includes(filtroUserNumero); });
  const funcionariosSemContaFiltrados = funcionariosSemConta.filter((p) => normalizar(p.nome).includes(normalizar(filtroUserNome)) && String(p.idfunc || '').includes(filtroUserNumero));
  const utilizadoresBloqueadosFiltrados = utilizadoresBloqueados.filter((u) => { const prof = profissionais.find((p) => p.idfunc === u.idfunc); return normalizar(u.username).includes(normalizar(filtroUserUsername)) && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) && String(u.idfunc || '').includes(filtroUserNumero); });
  const funcionariosFiltrados = profissionais.filter((p) => normalizar(p.nome).includes(normalizar(filtroFuncNome)) && String(p.idfunc || '').includes(filtroFuncNumero) && (filtroFuncTipo === '' || normalizar(p.tipofunc) === normalizar(filtroFuncTipo)));
  const funcionariosPesquisaNovoUser = funcionariosSemConta.filter((p) => normalizar(p.nome).includes(normalizar(pesquisaFuncionarioNovoUser)) || String(p.idfunc).includes(pesquisaFuncionarioNovoUser));
  const hospitaisFiltrados = hospitais.filter((h) => normalizar(h.nome).includes(normalizar(filtroHospitalNome)) && normalizar(h.localidade || '').includes(normalizar(filtroHospitalLocalidade)));
  const logsFiltrados = logs.filter(log => { const termo = normalizar(filtroLogTermo); const matchTermo = termo === '' || normalizar(log.acao || '').includes(termo) || normalizar(log.detalhe || '').includes(termo) || normalizar(log.utilizador || '').includes(termo); let matchData = true; if (filtroLogData) matchData = (log.criado_em ? new Date(log.criado_em).toISOString().split('T')[0] : '') === filtroLogData; return matchTermo && matchData; });

  // Abertura de Modos de Edição
  const abrirNovoUtilizador = () => { resetMensagens(); setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] }); setPesquisaFuncionarioNovoUser(''); setDropdownAberto(false); setUtilizadorEditando(null); setUserView('novo'); };

  const abrirEditarUtilizador = async (utilizador) => {
    resetMensagens();

    // Carrega o professor da lista em memória, se existir
    const prof = profissionais.find((p) => p.idfunc === utilizador.idfunc);

    // Mostra a UI de imediato, mas com hospitais vazios até a chamada terminar
    setUtilizadorEditando({
      ...utilizador,
      nome: prof?.nome || "",
      tipofunc: prof?.tipofunc || "",
      sexo: prof?.sexo || "",
      password: "",
      hospitais: []
    });
    setUserView("editar");

    try {
      setLoadingUtilizadores(true);
      // Aqui vamos buscar a VERDADEIRA lista de hospitais deste utilizador/funcionário!
      const hospitaisData = await apiFetch(`/api/trabalha/funcionario/${utilizador.idfunc}`);

      const idsHospitais = Array.isArray(hospitaisData)
        ? hospitaisData.map(h => Number(h.idhosp || h.idHosp || h.id))
        : [];

      // Atualiza os hospitais visíveis no Dual Listbox (Lado Direito)
      setUtilizadorEditando(prev => ({
        ...prev,
        hospitais: idsHospitais
      }));
    } catch (err) {
      setErroUser("Aviso: Não foi possível carregar os hospitais associados: " + err.message);
    } finally {
      setLoadingUtilizadores(false);
    }
  };

  const abrirCriarAPartirFuncionario = (funcionario) => { resetMensagens(); setUtilizadorEditando({ idfunc: funcionario.idfunc, nome: funcionario.nome, tipofunc: funcionario.tipofunc, sexo: funcionario.sexo, username: gerarUsername(funcionario.nome), password: '', role: funcionario.tipofunc || ROLES.ADMIN, hospitais: extrairHospitais(funcionario), isNovo: true }); setUserView('editar'); };
  const abrirNovoFuncionario = () => { resetMensagens(); setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', hospitais: [] }); setFuncionarioEditando(null); setEmployeeView('novo'); };

  const abrirEditarFuncionario = async (funcionario) => {
    resetMensagens();
    // Colocamos os dados base para a UI mostrar logo algo, assumindo hospitais vazios inicialmente
    setFuncionarioEditando({ ...funcionario, hospitais: [] });
    setEmployeeView("editar");

    try {
      setLoadingProfissionais(true);
      // Vamos buscar os hospitais REAIS deste funcionário à tabela Trabalha
      const hospitaisData = await apiFetch(`/api/trabalha/funcionario/${funcionario.idfunc}`);

      // Converte a resposta num array de IDs (números)
      const idsHospitais = Array.isArray(hospitaisData)
        ? hospitaisData.map(h => Number(h.idhosp || h.idHosp || h.id))
        : [];

      // Atualizamos o estado com a lista de IDs recebida
      setFuncionarioEditando(prev => ({
        ...prev,
        hospitais: idsHospitais
      }));
    } catch (err) {
      setErroFunc("Aviso: Não foi possível carregar os hospitais atuais deste funcionário.");
      console.error(err);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  const abrirNovoHospital = () => { resetMensagens(); setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' }); setHospitalEditando(null); setHospitalView('novo'); };
  const abrirEditarHospital = (hospital) => { resetMensagens(); setHospitalEditando(mapHospitalFromApi(hospital)); setHospitalView('editar'); };

  const handleNovoUserChange = (e) => setNovoUtilizador((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoProfChange = (e) => setNovoProfissional((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoHospitalChange = (e) => setNovoHospital((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarUserChange = (e) => setUtilizadorEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarFuncChange = (e) => setFuncionarioEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarHospitalChange = (e) => setHospitalEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selecionarFuncionarioNovoUser = (funcionario) => {
    setNovoUtilizador((prev) => ({ ...prev, idfunc: funcionario.idfunc, username: gerarUsername(funcionario.nome), role: funcionario.tipofunc || ROLES.ADMIN, hospitais: extrairHospitais(funcionario) }));
    setPesquisaFuncionarioNovoUser(funcionario.nome);
    setDropdownAberto(false);
  };

  // Funções CRUD
  const criarUtilizador = async (e) => {
    e.preventDefault(); setMensagemUser(''); setErroUser('');
    try {
      setSubmittingUser(true); const payload = { ...novoUtilizador, idfunc: Number(novoUtilizador.idfunc), hospitais: novoUtilizador.hospitais || [] };
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemUser(textos.admin.sucessoCriarUser); adicionarHistorico('Criar utilizador', `Foi criado o utilizador ${data.username || novoUtilizador.username}.`);
      setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN, hospitais: [] }); setPesquisaFuncionarioNovoUser(''); carregarUtilizadores(); setUserView('lista');
    } catch (err) { setErroUser(err.message); } finally { setSubmittingUser(false); }
  };

  const criarFuncionario = async (e) => {
    e.preventDefault(); setMensagemFunc(''); setErroFunc('');
    try {
      setSubmittingFunc(true); const payload = { ...novoProfissional, hospitais: novoProfissional.hospitais || [] };
      const data = await apiFetch('/api/profissionais/', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemFunc(textos.admin.sucessoCriarFunc); adicionarHistorico('Criar funcionário', `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`);
      setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', hospitais: [] }); carregarProfissionais(); setEmployeeView('lista');
    } catch (err) { setErroFunc(err.message); } finally { setSubmittingFunc(false); }
  };

  const criarHospital = async (e) => {
    e.preventDefault(); setMensagemHospital(''); setErroHospital('');
    if (!novoHospital.nome.trim() || !novoHospital.localidade.trim()) return setErroHospital('Campos obrigatórios em falta.');
    try {
      setSubmittingHospital(true); const payload = { nome: novoHospital.nome.trim(), localizacao: novoHospital.localidade.trim(), email: novoHospital.email.trim() || null, telefone: novoHospital.contacto.trim() || null };
      await apiFetch('/api/api/hospitais/', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemHospital(textos.admin.sucessoCriarHosp); adicionarHistorico('Criar hospital', `Foi criado o hospital ${novoHospital.nome}.`);
      setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' }); carregarHospitais(); setHospitalView('lista');
    } catch (err) { setErroHospital(err.message); } finally { setSubmittingHospital(false); }
  };

  const guardarUtilizadorEditado = async (e) => {
    e.preventDefault();
    setMensagemUser(""); setErroUser("");

    try {
      setSubmittingUser(true);
      const idfunc = utilizadorEditando.idfunc;

      // 1. Actualizar utilizador (username, hospitais, bloqueado)
      await apiFetch(`/api/utilizadores/${idfunc}`, {
        method: "PUT",
        body: JSON.stringify({
          username: utilizadorEditando.username,
          hospitais: utilizadorEditando.hospitais.map(Number),
          bloqueado: utilizadorEditando.bloqueado ?? null,
        }),
      });

      // 2. Actualizar tipofunc no funcionário
      await apiFetch(`/api/profissionais/${idfunc}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: utilizadorEditando.nome,
          tipofunc: utilizadorEditando.role,
          sexo: utilizadorEditando.sexo,
        }),
      });

      setMensagemUser("Utilizador editado com sucesso!");
      adicionarHistorico("Editar utilizador", `Foram atualizados os dados de ${utilizadorEditando.username}.`);
      await carregarUtilizadores();
      await carregarProfissionais();
      setUtilizadorEditando(null);
      setUserView("lista");
    } catch (err) {
      setErroUser(err.message);
    } finally {
      setSubmittingUser(false);
    }
  };

  const guardarFuncionarioEditado = async (e) => {
    e.preventDefault();
    setMensagemFunc("");
    setErroFunc("");

    try {
      setSubmittingFunc(true);
      const idfunc = funcionarioEditando.idfunc;

      // 1. Atualizar dados na tabela Profissionais (nome, tipo, sexo)
      const payloadFunc = {
        nome: funcionarioEditando.nome,
        tipofunc: funcionarioEditando.tipofunc,
        sexo: funcionarioEditando.sexo
      };
      await apiFetch(`/api/profissionais/${idfunc}`, {
        method: "PUT",
        body: JSON.stringify(payloadFunc),
      });

      // 2. Obter as associações de hospitais atuais na tabela Trabalha
      let hospitaisAntigos = [];
      try {
        const resAntigos = await apiFetch(`/api/trabalha/funcionario/${idfunc}`);
        if (Array.isArray(resAntigos)) {
          hospitaisAntigos = resAntigos.map(h => Number(h.idhosp || h.idHosp || h.id));
        }
      } catch (e) {
        console.warn("Sem hospitais anteriores ou erro ao consultar.");
      }

      // 3. Descobrir a diferença entre os Antigos e os Selecionados na edição
      const hospitaisSelecionados = funcionarioEditando.hospitais.map(Number);

      const adicionar = hospitaisSelecionados.filter(h => !hospitaisAntigos.includes(h));
      const remover = hospitaisAntigos.filter(h => !hospitaisSelecionados.includes(h));

      // 4. Executar os POST (Adicionar as novas associações à tabela Trabalha)
      for (const idhosp of adicionar) {
        await apiFetch(`/api/trabalha/`, {
          method: "POST",
          body: JSON.stringify({ idfunc: idfunc, idhosp: idhosp, ativo: true })
        });
      }

      // 5. Executar os DELETE (Remover as associações retiradas na tabela Trabalha)
      for (const idhosp of remover) {
        await apiFetch(`/api/trabalha/${idfunc}/${idhosp}`, {
          method: "DELETE"
        });
      }

      setMensagemFunc(textos.admin.sucessoEditarFunc);
      adicionarHistorico("Editar funcionário", `Foram atualizados os dados do funcionário ${funcionarioEditando.nome}.`);

      await carregarProfissionais();
      setFuncionarioEditando(null);
      setEmployeeView("lista");
    } catch (err) {
      setErroFunc(err.message);
    } finally {
      setSubmittingFunc(false);
    }
  };

  const guardarHospitalEditado = async (e) => {
    e.preventDefault(); setMensagemHospital(''); setErroHospital('');
    try {
      setSubmittingHospital(true); const payload = { nome: hospitalEditando.nome, localizacao: hospitalEditando.localidade, email: hospitalEditando.email || null, telefone: hospitalEditando.contacto || null };
      await apiFetch(`/api/api/hospitais/${hospitalEditando.idhosp || hospitalEditando.id_hosp}`, { method: 'PUT', body: JSON.stringify(payload) });
      setMensagemHospital(textos.admin.sucessoEditarHosp); adicionarHistorico('Editar hospital', `Foram atualizados os dados do hospital ${hospitalEditando.nome}.`);
      carregarHospitais(); setHospitalEditando(null); setHospitalView('lista');
    } catch (err) { setErroHospital(err.message); } finally { setSubmittingHospital(false); }
  };

  const bloquearUtilizador = async (utilizador) => {
    if (!window.confirm(`Tens a certeza que pretendes bloquear "${utilizador.username}"?`)) return;
    try {
      await apiFetch(`/api/utilizadores/${utilizador.idfunc}`, { method: 'PUT', body: JSON.stringify({ username: utilizador.username, password: null, hospitais: extrairHospitais(utilizador), bloqueado: true }) });
      adicionarHistorico('Bloquear utilizador', `O utilizador ${utilizador.username} foi bloqueado.`); await carregarUtilizadores();
    } catch (err) { setErroUtilizadores(err.message); }
  };

  const desbloquearUtilizador = async (utilizador) => {
    if (!window.confirm(`Tens a certeza que pretendes desbloquear "${utilizador.username}"?`)) return;
    try {
      await apiFetch(`/api/utilizadores/${utilizador.idfunc}`, { method: 'PUT', body: JSON.stringify({ username: utilizador.username, password: null, hospitais: extrairHospitais(utilizador), bloqueado: false }) });
      adicionarHistorico('Desbloquear utilizador', `O utilizador ${utilizador.username} foi desbloqueado.`); await carregarUtilizadores();
    } catch (err) { setErroUtilizadores(err.message); }
  };

  const exportarRelatorioSeguro = () => {
    if (logsFiltrados.length === 0) return alert("Sem dados para exportar.");
    const cabecalhos = ["Data/Hora", "Utilizador", "Ação", "Detalhe"];
    const linhas = logsFiltrados.map(log => [
      log.criado_em ? new Date(log.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') : '',
      `"${(log.utilizador || '').replace(/"/g, '""')}"`,
      `"${(log.acao || '').replace(/"/g, '""')}"`,
      `"${(log.detalhe || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [cabecalhos.join(";"), ...linhas.map(l => l.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "relatorio_logs.csv";
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const getHospitalNomeFuncionario = (funcionario) => {
    const arrHosp = extrairHospitais(funcionario);
    if (arrHosp.length === 0) return '—';
    if (arrHosp.length === 1) { const hObj = hospitais.find(h => Number(h.idhosp) === arrHosp[0]); return hObj ? hObj.nome : '—'; }
    return `${arrHosp.length} Hospitais`;
  };

  // ==========================================
  // RENDERIZAÇÃO DAS VISTAS (CENTRO)
  // ==========================================

  const renderUserCenter = () => {
    if (userView === 'novo') {
      const funcSelecionado = profissionais.find((p) => p.idfunc === Number(novoUtilizador.idfunc));
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{textos.admin.btnNovoUtilizador}</h2></div>
          <form className="admin-form" onSubmit={criarUtilizador}>
            <div className="admin-form__grid">
              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }} ref={dropdownRef}>
                <label htmlFor="search-func">{textos.admin.lblNome}</label>
                <div className="admin-dropdown">
                  <input
                    id="search-func" type="text" className="admin-dropdown__input" placeholder={textos.geral.pesquisarNome}
                    value={pesquisaFuncionarioNovoUser}
                    onChange={(e) => { setPesquisaFuncionarioNovoUser(e.target.value); setDropdownAberto(true); if (!e.target.value) setNovoUtilizador(prev => ({ ...prev, idfunc: '', username: '' })); }}
                    onFocus={() => setDropdownAberto(true)} autoComplete="off"
                  />
                  {funcSelecionado && <div className="admin-dropdown__selected">✓ #{funcSelecionado.idfunc} — {funcSelecionado.nome}</div>}
                  {dropdownAberto && (
                    <div className="admin-dropdown__list">
                      {funcionariosPesquisaNovoUser.length === 0 ? (<div className="admin-dropdown__empty">{textos.geral.semResultados}</div>) : (
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
              <div className="admin-form__group"><label htmlFor="user-username">{textos.admin.lblUsername}</label><input id="user-username" name="username" type="text" value={novoUtilizador.username} onChange={handleNovoUserChange} required /></div>
              <div className="admin-form__group"><label htmlFor="user-password">{textos.admin.lblPassword}</label><input id="user-password" name="password" type="password" value={novoUtilizador.password} onChange={handleNovoUserChange} required /></div>
              <div className="admin-form__group">
                <label htmlFor="user-role">{textos.admin.lblFuncao}</label>
                <select id="user-role" name="role" value={novoUtilizador.role} onChange={handleNovoUserChange}>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MEDICO}>Médico</option>
                  <option value={ROLES.ENFERMEIRO}>Enfermeiro</option>
                  <option value={ROLES.RECECIONISTA}>Rececionista</option>
                </select>
              </div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>Associar Hospitais</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoUtilizador.hospitais}
                  onChange={(novosIds) => setNovoUtilizador(prev => ({ ...prev, hospitais: novosIds }))}
                />
              </div>

            </div>
            <div aria-live="polite">{mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}{erroUser && <p className="admin-form__error">{erroUser}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingUser || !novoUtilizador.idfunc}>{submittingUser ? textos.geral.aCarregar : textos.admin.btnNovoUtilizador}</button><button type="button" className="admin-secondary-button" onClick={() => setUserView('lista')}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    if (userView === 'editar' && utilizadorEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{utilizadorEditando.isNovo ? textos.admin.btnNovoUtilizador : textos.geral.editar}</h2><p>#{utilizadorEditando.idfunc} — {utilizadorEditando.nome}</p></div>
          <form className="admin-form" onSubmit={guardarUtilizadorEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label htmlFor="edit-user-id">{textos.admin.lblNumFuncionario}</label><input id="edit-user-id" type="text" value={utilizadorEditando.idfunc || ''} readOnly /></div>
              <div className="admin-form__group"><label htmlFor="edit-user-nome">{textos.admin.lblNome}</label><input id="edit-user-nome" name="nome" type="text" value={utilizadorEditando.nome || ''} onChange={handleEditarUserChange} /></div>
              <div className="admin-form__group"><label htmlFor="edit-user-username">{textos.admin.lblUsername}</label><input id="edit-user-username" name="username" type="text" value={utilizadorEditando.username || ''} onChange={handleEditarUserChange} /></div>
              <div className="admin-form__group">
                <label htmlFor="edit-user-role">{textos.admin.lblFuncao}</label>
                <select id="edit-user-role" name="role" value={utilizadorEditando.role || ROLES.ADMIN} onChange={handleEditarUserChange}>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MEDICO}>Médico</option>
                  <option value={ROLES.ENFERMEIRO}>Enfermeiro</option>
                  <option value={ROLES.RECECIONISTA}>Rececionista</option>
                </select>
              </div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>Gerir Hospitais Associados</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={utilizadorEditando.hospitais}
                  onChange={(novosIds) => setUtilizadorEditando(prev => ({ ...prev, hospitais: novosIds }))}
                />
              </div>

            </div>
            <div aria-live="polite">{mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}{erroUser && <p className="admin-form__error">{erroUser}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit">{textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => { setUtilizadorEditando(null); setUserView('lista'); }}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header"><h2>{textos.admin.menuUtilizadores}</h2><p>{textos.admin.descUtilizadores}</p></div>
        <div aria-live="polite">{erroUtilizadores && <p className="admin-form__error">{erroUtilizadores}</p>}{erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}</div>
        <div className="admin-toolbar admin-toolbar--left"><button type="button" className="admin-primary-big-button" onClick={abrirNovoUtilizador}>{textos.admin.btnNovoUtilizador}</button></div>
        <div className="admin-filters">
          <div className="admin-form__group"><label htmlFor="filter-user-username">{textos.admin.lblUsername}</label><input id="filter-user-username" type="text" value={filtroUserUsername} onChange={(e) => setFiltroUserUsername(e.target.value)} /></div>
          <div className="admin-form__group"><label htmlFor="filter-user-nome">{textos.geral.pesquisarNome}</label><input id="filter-user-nome" type="text" value={filtroUserNome} onChange={(e) => setFiltroUserNome(e.target.value)} /></div>
          <div className="admin-form__group"><label htmlFor="filter-user-num">{textos.geral.pesquisarNumero}</label><input id="filter-user-num" type="text" value={filtroUserNumero} onChange={(e) => setFiltroUserNumero(e.target.value)} /></div>
        </div>

        <div className="admin-users-grid-top">
          <div className="admin-table-card">
            <div className="admin-table-card__header"><h3>{textos.admin.tblUtilizadoresComConta}</h3><span>{utilizadoresComContaFiltrados.length}</span></div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblUsername}</th><th>{textos.admin.lblFuncao}</th><th>Ações</th></tr></thead>
                <tbody>
                  {loadingUtilizadores || loadingProfissionais ? (<tr><td colSpan="5">{textos.geral.aCarregar}</td></tr>) : utilizadoresComContaFiltrados.length === 0 ? (<tr><td colSpan="5">{textos.geral.semResultados}</td></tr>) : (
                    utilizadoresComContaFiltrados.map((u) => {
                      const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                      return (
                        <tr key={u.idfunc || u.username}>
                          <td>{u.idfunc}</td><td>{prof?.nome || '—'}</td><td>{u.username}</td><td>{u.role || prof?.tipofunc || '—'}</td>
                          <td style={{ display: 'flex', gap: '0.4rem' }}>
                            <button type="button" className="admin-secondary-button" onClick={() => abrirEditarUtilizador(u)}>{textos.geral.editar}</button>
                            <button type="button" className="admin-secondary-button" style={{ background: '#c0392b', color: '#fff' }} onClick={() => bloquearUtilizador(u)}>Bloquear</button>
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
            <div className="admin-table-card__header"><h3>{textos.admin.tblFuncionariosSemConta}</h3><span>{funcionariosSemContaFiltrados.length}</span></div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblFuncao}</th><th>Ações</th></tr></thead>
                <tbody>
                  {loadingProfissionais ? (<tr><td colSpan="4">{textos.geral.aCarregar}</td></tr>) : funcionariosSemContaFiltrados.length === 0 ? (<tr><td colSpan="4">{textos.geral.semResultados}</td></tr>) : (
                    funcionariosSemContaFiltrados.map((p) => (
                      <tr key={p.idfunc}>
                        <td>{p.idfunc}</td><td>{p.nome}</td><td>{p.tipofunc}</td>
                        <td><button type="button" className="admin-secondary-button" onClick={() => abrirCriarAPartirFuncionario(p)}>{textos.admin.btnNovoUtilizador}</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header"><h3>{textos.admin.tblUtilizadoresBloqueados}</h3><span>{utilizadoresBloqueadosFiltrados.length}</span></div>
          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblUsername}</th><th>{textos.admin.lblFuncao}</th><th>Ações</th></tr></thead>
              <tbody>
                {loadingUtilizadores ? (<tr><td colSpan="5">{textos.geral.aCarregar}</td></tr>) : utilizadoresBloqueadosFiltrados.length === 0 ? (<tr><td colSpan="5">{textos.admin.semBloqueados}</td></tr>) : (
                  utilizadoresBloqueadosFiltrados.map((u) => {
                    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                    return (
                      <tr key={u.idfunc || u.username}>
                        <td>{u.idfunc}</td><td>{prof?.nome || '—'}</td><td>{u.username}</td><td>{u.role || prof?.tipofunc || '—'}</td>
                        <td><button type="button" className="admin-secondary-button" style={{ background: '#27ae60', color: '#fff' }} onClick={() => desbloquearUtilizador(u)}>Desbloquear</button></td>
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
          <div className="admin-panel-section__header"><h2>{textos.admin.btnNovoFuncionario}</h2></div>
          <form className="admin-form" onSubmit={criarFuncionario}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label htmlFor="func-nome">{textos.admin.lblNome}</label><input id="func-nome" name="nome" type="text" value={novoProfissional.nome} onChange={handleNovoProfChange} required /></div>
              <div className="admin-form__group"><label htmlFor="func-role">{textos.admin.lblFuncao}</label><select id="func-role" name="tipofunc" value={novoProfissional.tipofunc} onChange={handleNovoProfChange}><option value={ROLES.ADMIN}>Admin</option><option value={ROLES.MEDICO}>Médico</option><option value={ROLES.ENFERMEIRO}>Enfermeiro</option><option value={ROLES.RECECIONISTA}>Rececionista</option></select></div>
              <div className="admin-form__group"><label htmlFor="func-sexo">{textos.admin.lblSexo}</label><select id="func-sexo" name="sexo" value={novoProfissional.sexo} onChange={handleNovoProfChange}><option value="M">Masculino</option><option value="F">Feminino</option></select></div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>Associar Hospitais</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={novoProfissional.hospitais}
                  onChange={(novosIds) => setNovoProfissional(prev => ({ ...prev, hospitais: novosIds }))}
                />
              </div>
            </div>
            <div aria-live="polite">{mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}{erroFunc && <p className="admin-form__error">{erroFunc}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingFunc}>{submittingFunc ? textos.geral.aCarregar : textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => setEmployeeView('lista')}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    if (employeeView === 'editar' && funcionarioEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{textos.geral.editar}</h2></div>
          <form className="admin-form" onSubmit={guardarFuncionarioEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label htmlFor="efunc-nome">{textos.admin.lblNome}</label><input id="efunc-nome" name="nome" type="text" value={funcionarioEditando.nome || ''} onChange={handleEditarFuncChange} /></div>

              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
                <label>Gerir Hospitais Associados</label>
                <SelectorHospitais
                  hospitaisDisponiveisTotais={hospitais}
                  valoresSelecionados={funcionarioEditando.hospitais}
                  onChange={(novosIds) => setFuncionarioEditando(prev => ({ ...prev, hospitais: novosIds }))}
                />
              </div>
            </div>
            <div aria-live="polite">{mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}{erroFunc && <p className="admin-form__error">{erroFunc}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingFunc}>{textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => { setFuncionarioEditando(null); setEmployeeView('lista'); }}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header"><h2>{textos.admin.menuFuncionarios}</h2><p>{textos.admin.descFuncionarios}</p></div>
        <div aria-live="polite">{erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}</div>
        <div className="admin-toolbar admin-toolbar--left"><button type="button" className="admin-primary-big-button" onClick={abrirNovoFuncionario}>{textos.admin.btnNovoFuncionario}</button></div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-func-nome">{textos.geral.pesquisarNome}</label>
            <input id="filter-func-nome" type="text" value={filtroFuncNome} onChange={(e) => setFiltroFuncNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-func-num">{textos.geral.pesquisarNumero}</label>
            <input id="filter-func-num" type="text" value={filtroFuncNumero} onChange={(e) => setFiltroFuncNumero(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-func-tipo">{textos.admin.lblFuncao}</label>
            <select id="filter-func-tipo" value={filtroFuncTipo} onChange={(e) => setFiltroFuncTipo(e.target.value)}>
              <option value="">Todas as Funções</option>
              <option value={ROLES.ADMIN}>Admin</option>
              <option value={ROLES.MEDICO}>Médico</option>
              <option value={ROLES.ENFERMEIRO}>Enfermeiro</option>
              <option value={ROLES.RECECIONISTA}>Rececionista</option>
            </select>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header"><h3>{textos.admin.menuFuncionarios}</h3><span>{funcionariosFiltrados.length}</span></div>
          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblFuncao}</th><th>Hospitais</th><th>{textos.geral.editar}</th></tr></thead>
              <tbody>
                {loadingProfissionais ? (<tr><td colSpan="5">{textos.geral.aCarregar}</td></tr>) : funcionariosFiltrados.length === 0 ? (<tr><td colSpan="5">{textos.geral.semResultados}</td></tr>) : (
                  funcionariosFiltrados.map((f) => (
                    <tr key={f.idfunc}><td>{f.idfunc}</td><td>{f.nome}</td><td>{f.tipofunc}</td><td>{getHospitalNomeFuncionario(f)}</td><td><button type="button" className="admin-secondary-button" onClick={() => abrirEditarFuncionario(f)}>{textos.geral.editar}</button></td></tr>
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
          <div className="admin-panel-section__header"><h2>{textos.admin.btnNovoHospital}</h2></div>
          <form className="admin-form" onSubmit={criarHospital}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label htmlFor="hosp-nome">{textos.admin.lblNome}</label><input id="hosp-nome" name="nome" type="text" value={novoHospital.nome} onChange={handleNovoHospitalChange} required /></div>
              <div className="admin-form__group"><label htmlFor="hosp-loc">{textos.admin.lblLocalizacao}</label><input id="hosp-loc" name="localidade" type="text" value={novoHospital.localidade} onChange={handleNovoHospitalChange} required /></div>
              <div className="admin-form__group"><label htmlFor="hosp-email">Email</label><input id="hosp-email" name="email" type="email" value={novoHospital.email} onChange={handleNovoHospitalChange} /></div>
              <div className="admin-form__group"><label htmlFor="hosp-contacto">Contacto</label><input id="hosp-contacto" name="contacto" type="text" value={novoHospital.contacto} onChange={handleNovoHospitalChange} /></div>
            </div>
            <div aria-live="polite">{mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}{erroHospital && <p className="admin-form__error">{erroHospital}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingHospital}>{textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => setHospitalView('lista')}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    if (hospitalView === 'editar' && hospitalEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header"><h2>{textos.geral.editar}</h2></div>
          <form className="admin-form" onSubmit={guardarHospitalEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group"><label htmlFor="ehosp-nome">{textos.admin.lblNome}</label><input id="ehosp-nome" name="nome" type="text" value={hospitalEditando.nome || ''} onChange={handleEditarHospitalChange} /></div>
              <div className="admin-form__group"><label htmlFor="ehosp-loc">{textos.admin.lblLocalizacao}</label><input id="ehosp-loc" name="localidade" type="text" value={hospitalEditando.localidade || ''} onChange={handleEditarHospitalChange} /></div>
              <div className="admin-form__group"><label htmlFor="ehosp-email">Email</label><input id="ehosp-email" name="email" type="email" value={hospitalEditando.email || ''} onChange={handleEditarHospitalChange} /></div>
              <div className="admin-form__group"><label htmlFor="ehosp-contacto">Contacto</label><input id="ehosp-contacto" name="contacto" type="text" value={hospitalEditando.contacto || ''} onChange={handleEditarHospitalChange} /></div>
            </div>
            <div aria-live="polite">{mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}{erroHospital && <p className="admin-form__error">{erroHospital}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingHospital}>{textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => { setHospitalEditando(null); setHospitalView('lista'); }}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header"><h2>{textos.admin.menuHospitais}</h2><p>{textos.admin.descHospitais}</p></div>
        <div className="admin-toolbar admin-toolbar--left"><button type="button" className="admin-primary-big-button" onClick={abrirNovoHospital}>{textos.admin.btnNovoHospital}</button></div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-hosp-nome">{textos.geral.pesquisarNome}</label>
            <input id="filter-hosp-nome" type="text" value={filtroHospitalNome} onChange={(e) => setFiltroHospitalNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-hosp-loc">{textos.admin.lblLocalizacao}</label>
            <input id="filter-hosp-loc" type="text" value={filtroHospitalLocalidade} onChange={(e) => setFiltroHospitalLocalidade(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header"><h3>{textos.admin.menuHospitais}</h3><span>{hospitaisFiltrados.length}</span></div>
          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.lblNome}</th><th>{textos.admin.lblLocalizacao}</th><th>{textos.geral.editar}</th></tr></thead>
              <tbody>
                {loadingHospitais ? (<tr><td colSpan="3">{textos.geral.aCarregar}</td></tr>) : hospitaisFiltrados.length === 0 ? (<tr><td colSpan="3">{textos.geral.semResultados}</td></tr>) : (
                  hospitaisFiltrados.map((h) => (<tr key={h.idhosp || h.nome}><td>{h.nome || '—'}</td><td>{h.localidade || '—'}</td><td><button type="button" className="admin-secondary-button" onClick={() => abrirEditarHospital(h)}>{textos.geral.editar}</button></td></tr>))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  const renderReportsCenter = () => {
    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header"><h2>{textos.admin.menuRelatorios}</h2><p>{textos.admin.descRelatorios}</p></div>
        <div aria-live="polite">{erroLogs && <p className="admin-form__error">{erroLogs}</p>}</div>
        <div className="admin-report-grid">
          <div className="admin-report-card"><h3>{textos.admin.menuUtilizadores}</h3><p>{textos.admin.relTotalComConta}</p><strong>{utilizadoresComConta.length}</strong></div>
          <div className="admin-report-card"><h3>{textos.admin.menuFuncionarios}</h3><p>{textos.admin.relTotalRegistado}</p><strong>{profissionais.length}</strong></div>
        </div>

        <div className="admin-filters" style={{ marginTop: '1.5rem' }}>
          <div className="admin-form__group">
            <label>Pesquisar (Ação, Detalhe, Utilizador)</label>
            <input type="text" value={filtroLogTermo} onChange={(e) => setFiltroLogTermo(e.target.value)} placeholder="Escreve aqui..." />
          </div>
          <div className="admin-form__group">
            <label>Data</label>
            <input type="date" value={filtroLogData} onChange={(e) => setFiltroLogData(e.target.value)} />
          </div>
        </div>

        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header">
            <h3>{textos.admin.menuRelatorios}</h3><span>{logsFiltrados.length}</span>
            <div className="admin-header-actions">
              <button type="button" className="admin-secondary-button" onClick={carregarLogs}>{textos.admin.btnAtualizar}</button>
              <button type="button" className="admin-primary-big-button" onClick={exportarRelatorioSeguro}>Exportar Dados</button>
            </div>
          </div>
          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.colData}</th><th>Utilizador</th><th>{textos.admin.colAcao}</th><th>{textos.admin.colDetalhe}</th></tr></thead>
              <tbody>
                {loadingLogs ? (<tr><td colSpan="4">{textos.geral.aCarregar}</td></tr>) : logsFiltrados.length === 0 ? (<tr><td colSpan="4">{textos.admin.semHistorico}</td></tr>) : (
                  logsFiltrados.map((item) => (
                    <tr key={item.idlog || item.id}>
                      <td>{item.criado_em ? new Date(item.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') : item.data || '—'}</td>
                      <td>{item.utilizador || '—'}</td>
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
  };

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

        <aside className="admin-sidebar" aria-label="Navegação Lateral do Administrador">
          <button className="admin-sidebar__toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} aria-expanded={!isSidebarCollapsed}>
            <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="admin-sidebar__brand"><img src={logo} alt="Logótipo SIAGUH" className="admin-sidebar__logo" /><div className="admin-sidebar__brand-text"><strong>SIAGUH</strong><span>{funcionarioAutenticadoNome}</span></div></div>

          <nav className="admin-sidebar__nav" role="navigation">
            <button type="button" className={`admin-sidebar__link ${mainMenu === 'utilizadores' ? 'is-active' : ''}`} onClick={() => { resetMensagens(); setMainMenu('utilizadores'); setUserView('lista'); }}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <span className="link-text">{textos.admin.menuUtilizadores}</span>
            </button>
            <button type="button" className={`admin-sidebar__link ${mainMenu === 'funcionarios' ? 'is-active' : ''}`} onClick={() => { resetMensagens(); setMainMenu('funcionarios'); setEmployeeView('lista'); }}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
              <span className="link-text">{textos.admin.menuFuncionarios}</span>
            </button>
            <button type="button" className={`admin-sidebar__link ${mainMenu === 'hospitais' ? 'is-active' : ''}`} onClick={() => { resetMensagens(); setMainMenu('hospitais'); setHospitalView('lista'); }}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              <span className="link-text">{textos.admin.menuHospitais}</span>
            </button>
            <button type="button" className={`admin-sidebar__link ${mainMenu === 'relatorios' ? 'is-active' : ''}`} onClick={() => { resetMensagens(); setMainMenu('relatorios'); }}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span className="link-text">{textos.admin.menuRelatorios}</span>
            </button>
          </nav>

          <div className="admin-sidebar__footer">
            <div className="admin-sidebar__lang-switcher" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button type="button" onClick={() => mudarIdioma('pt')} style={{ background: 'none', border: 'none', color: idioma === 'pt' ? '#3eb489' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>PT</button>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <button type="button" onClick={() => mudarIdioma('en')} style={{ background: 'none', border: 'none', color: idioma === 'en' ? '#3eb489' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}>EN</button>
            </div>
            <button type="button" className="admin-logout-button" onClick={() => navigate('/')}>
              <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span className="link-text">{textos.admin.botaoSair}</span>
            </button>
          </div>
        </aside>

        <section className="admin-content-wrapper">
          <div className="admin-content-inner">
            <div className="admin-breadcrumbs-container"><Breadcrumbs items={breadcrumbsLinks} /></div>
            <div className="admin-content__top">
              <h1>{textos.admin.tituloPainel}</h1>
              <p>
                {mainMenu === 'utilizadores' && textos.admin.descUtilizadores}
                {mainMenu === 'funcionarios' && textos.admin.descFuncionarios}
                {mainMenu === 'hospitais' && textos.admin.descHospitais}
                {mainMenu === 'relatorios' && textos.admin.descRelatorios}
              </p>
            </div>
            <div className="admin-content__body">{renderCenter()}</div>
          </div>
        </section>
      </main>
      <FooterLayout />
    </div>
  );
}