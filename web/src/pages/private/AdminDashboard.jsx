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
import { useLanguage } from '../../contexts/LanguageContext'; // Adicionado para internacionalização
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

const lerStorageSeguro = (chave) => {
  try {
    return localStorage.getItem(chave) || sessionStorage.getItem(chave) || '';
  } catch {
    return '';
  }
};

const parseJsonSeguro = (valor) => {
  try {
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
};

const mapHospitalFromApi = (hospital) => ({
  ...hospital,
  idhosp: hospital?.idhosp ?? hospital?.id_hosp ?? hospital?.id ?? '',
  nome: hospital?.nome ?? '',
  email: hospital?.email ?? '',
  localidade: hospital?.localizacao ?? hospital?.localidade ?? '',
  contacto: hospital?.telefone ?? hospital?.contacto ?? '',
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const { textos, idioma, mudarIdioma } = useLanguage(); // Hooks do contexto de idioma

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
  const [filtroFuncHospital, setFiltroFuncHospital] = useState('');

  const [filtroHospitalNome, setFiltroHospitalNome] = useState('');
  const [filtroHospitalLocalidade, setFiltroHospitalLocalidade] = useState('');

  // Estados de Criação/Edição
  const [novoUtilizador, setNovoUtilizador] = useState({
    idfunc: '',
    username: '',
    password: '',
    role: ROLES.ADMIN,
  });

  const [novoProfissional, setNovoProfissional] = useState({
    nome: '',
    tipofunc: ROLES.ADMIN,
    sexo: 'M',
    id_hosp: '',
  });

  const [novoHospital, setNovoHospital] = useState({
    nome: '',
    email: '',
    localidade: '',
    contacto: '',
  });

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
    { name: textos.admin.tituloPainel, path: '/admin' }
  ];

  // ==========================================
  // CICLO DE VIDA (USEEFFECTS)
  // ==========================================
  useEffect(() => {
    carregarTudo();
    iniciarHistoricoBase();
  }, []);

  useEffect(() => {
    resolverUtilizadorAutenticado();
  }, [profissionais, utilizadores, textos.admin.tituloPainel]); // Adicionado textos como dependência

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mainMenu === 'relatorios') {
      carregarLogs();
    }
  }, [mainMenu]);

  // ==========================================
  // LÓGICA E CHAMADAS À API
  // ==========================================
  const iniciarHistoricoBase = () => {
    setHistorico([
      { id: 1, acao: 'Sistema iniciado', detalhe: 'O painel de administração foi carregado.', data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') },
    ]);
  };

  const adicionarHistorico = (acao, detalhe) => {
    setHistorico((prev) => [
      { id: Date.now() + Math.random(), acao, detalhe, data: new Date().toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') },
      ...prev,
    ]);
  };

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

  const carregarTudo = async () => {
    await Promise.all([ carregarProfissionais(), carregarUtilizadores(), carregarHospitais(), carregarLogs() ]);
  };

  const carregarProfissionais = async () => {
    try { setLoadingProfissionais(true); setErroProfissionais(''); const data = await apiFetch('/api/profissionais/'); setProfissionais(Array.isArray(data) ? data : []); } 
    catch (err) { setErroProfissionais(err.message || 'Erro ao carregar profissionais.'); setProfissionais([]); } 
    finally { setLoadingProfissionais(false); }
  };

  const carregarUtilizadores = async () => {
    try { setLoadingUtilizadores(true); setErroUtilizadores(''); const data = await apiFetch('/api/utilizadores/'); setUtilizadores(Array.isArray(data) ? data : []); } 
    catch (err) { setErroUtilizadores(err.message || 'Erro ao carregar utilizadores.'); setUtilizadores([]); } 
    finally { setLoadingUtilizadores(false); }
  };

  const carregarHospitais = async () => {
    try { setLoadingHospitais(true); setErroHospitais(''); const data = await apiFetch('/api/hospitais/'); setHospitais(Array.isArray(data) ? data.map(mapHospitalFromApi) : []); } 
    catch (err) { setErroHospitais(err.message); setHospitais([]); } 
    finally { setLoadingHospitais(false); }
  };

  const carregarLogs = async () => {
    try { setLoadingLogs(true); setErroLogs(''); const data = await apiFetch('/api/logs/'); setLogs(Array.isArray(data) ? data : []); } 
    catch (err) { setErroLogs(err.message || 'Erro ao carregar logs.'); setLogs([]); } 
    finally { setLoadingLogs(false); }
  };

  // ==========================================
  // FILTROS E DADOS DERIVADOS
  // ==========================================
  const idsComConta = useMemo(() => new Set(utilizadores.map((u) => u.idfunc).filter((id) => id !== null && id !== undefined)), [utilizadores]);

  const utilizadoresComConta = utilizadores.filter((u) => u.bloqueado !== true);
  const utilizadoresBloqueados = utilizadores.filter((u) => u.bloqueado === true);
  const funcionariosSemConta = profissionais.filter((p) => !idsComConta.has(p.idfunc));

  const utilizadoresComContaFiltrados = utilizadoresComConta.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return normalizar(u.username).includes(normalizar(filtroUserUsername)) && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) && String(u.idfunc || '').includes(filtroUserNumero);
  });

  const funcionariosSemContaFiltrados = funcionariosSemConta.filter((p) => normalizar(p.nome).includes(normalizar(filtroUserNome)) && String(p.idfunc || '').includes(filtroUserNumero));

  const utilizadoresBloqueadosFiltrados = utilizadoresBloqueados.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return normalizar(u.username).includes(normalizar(filtroUserUsername)) && normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) && String(u.idfunc || '').includes(filtroUserNumero);
  });

  const funcionariosFiltrados = profissionais.filter((p) => {
    const hospitalFuncionario = hospitais.find((h) => Number(h.idhosp) === Number(p.id_hosp) || Number(h.idhosp) === Number(p.idhosp) || Number(h.idhosp) === Number(p.hospital_id)) || null;
    return normalizar(p.nome).includes(normalizar(filtroFuncNome)) && String(p.idfunc || '').includes(filtroFuncNumero) && (filtroFuncTipo === '' || normalizar(p.tipofunc) === normalizar(filtroFuncTipo)) && normalizar(hospitalFuncionario?.nome || '').includes(normalizar(filtroFuncHospital));
  });

  const funcionariosPesquisaNovoUser = funcionariosSemConta.filter((p) => normalizar(p.nome).includes(normalizar(pesquisaFuncionarioNovoUser)) || String(p.idfunc).includes(pesquisaFuncionarioNovoUser));

  const hospitaisFiltrados = hospitais.filter((h) => normalizar(h.nome).includes(normalizar(filtroHospitalNome)) && normalizar(h.localidade || '').includes(normalizar(filtroHospitalLocalidade)));

  // ==========================================
  // MANIPULAÇÃO DE VISTAS (NOVO/EDITAR)
  // ==========================================
  const abrirNovoUtilizador = () => { resetMensagens(); setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN }); setPesquisaFuncionarioNovoUser(''); setDropdownAberto(false); setUtilizadorEditando(null); setUserView('novo'); };
  const abrirEditarUtilizador = (utilizador) => { const prof = profissionais.find((p) => p.idfunc === utilizador.idfunc); resetMensagens(); setUtilizadorEditando({ ...utilizador, nome: prof?.nome || '', tipofunc: prof?.tipofunc || '', sexo: prof?.sexo || '', password: '' }); setUserView('editar'); };
  const abrirCriarAPartirFuncionario = (funcionario) => { resetMensagens(); setUtilizadorEditando({ idfunc: funcionario.idfunc, nome: funcionario.nome, tipofunc: funcionario.tipofunc, sexo: funcionario.sexo, username: gerarUsername(funcionario.nome), password: '', role: funcionario.tipofunc || ROLES.ADMIN, isNovo: true }); setUserView('editar'); };
  const abrirNovoFuncionario = () => { resetMensagens(); setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', id_hosp: '' }); setFuncionarioEditando(null); setEmployeeView('novo'); };
  const abrirEditarFuncionario = (funcionario) => { resetMensagens(); setFuncionarioEditando({ ...funcionario, id_hosp: funcionario.id_hosp ?? funcionario.idhosp ?? funcionario.hospital_id ?? '' }); setEmployeeView('editar'); };
  const abrirNovoHospital = () => { resetMensagens(); setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' }); setHospitalEditando(null); setHospitalView('novo'); };
  const abrirEditarHospital = (hospital) => { resetMensagens(); setHospitalEditando(mapHospitalFromApi(hospital)); setHospitalView('editar'); };

  const handleNovoUserChange = (e) => setNovoUtilizador((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoProfChange = (e) => setNovoProfissional((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleNovoHospitalChange = (e) => setNovoHospital((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarUserChange = (e) => setUtilizadorEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarFuncChange = (e) => setFuncionarioEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditarHospitalChange = (e) => setHospitalEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selecionarFuncionarioNovoUser = (funcionario) => {
    setNovoUtilizador((prev) => ({ ...prev, idfunc: funcionario.idfunc, username: gerarUsername(funcionario.nome), role: funcionario.tipofunc || ROLES.ADMIN }));
    setPesquisaFuncionarioNovoUser(funcionario.nome);
    setDropdownAberto(false);
  };

  // ==========================================
  // FUNÇÕES CRUD (CRIAR/EDITAR)
  // ==========================================
  const criarUtilizador = async (e) => {
    e.preventDefault(); setMensagemUser(''); setErroUser('');
    try {
      setSubmittingUser(true); const payload = { ...novoUtilizador, idfunc: Number(novoUtilizador.idfunc) };
      const data = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemUser(textos.admin.sucessoCriarUser); adicionarHistorico('Criar utilizador', `Foi criado o utilizador ${data.username || novoUtilizador.username}.`);
      setNovoUtilizador({ idfunc: '', username: '', password: '', role: ROLES.ADMIN }); setPesquisaFuncionarioNovoUser(''); carregarUtilizadores(); setUserView('lista');
    } catch (err) { setErroUser(err.message || textos.geral.erroGenerico); } finally { setSubmittingUser(false); }
  };

  const criarFuncionario = async (e) => {
    e.preventDefault(); setMensagemFunc(''); setErroFunc('');
    try {
      setSubmittingFunc(true); const payload = { ...novoProfissional, id_hosp: novoProfissional.id_hosp ? Number(novoProfissional.id_hosp) : null, idhosp: novoProfissional.id_hosp ? Number(novoProfissional.id_hosp) : null };
      const data = await apiFetch('/api/profissionais/', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemFunc(textos.admin.sucessoCriarFunc); adicionarHistorico('Criar funcionário', `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`);
      setNovoProfissional({ nome: '', tipofunc: ROLES.ADMIN, sexo: 'M', id_hosp: '' }); carregarProfissionais(); setEmployeeView('lista');
    } catch (err) { setErroFunc(err.message || textos.geral.erroGenerico); } finally { setSubmittingFunc(false); }
  };

  const criarHospital = async (e) => {
    e.preventDefault(); setMensagemHospital(''); setErroHospital('');
    if (!novoHospital.nome.trim() || !novoHospital.localidade.trim()) return setErroHospital("Campos obrigatórios em falta.");
    try {
      setSubmittingHospital(true); const payload = { nome: novoHospital.nome.trim(), localizacao: novoHospital.localidade.trim(), email: novoHospital.email.trim() || null, telefone: novoHospital.contacto.trim() || null };
      await apiFetch('/api/hospitais/', { method: 'POST', body: JSON.stringify(payload) });
      setMensagemHospital(textos.admin.sucessoCriarHosp); adicionarHistorico('Criar hospital', `Foi criado o hospital ${novoHospital.nome}.`);
      setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' }); carregarHospitais(); setHospitalView('lista');
    } catch (err) { setErroHospital(err.message || textos.geral.erroGenerico); } finally { setSubmittingHospital(false); }
  };

  const guardarUtilizadorEditado = async (e) => { e.preventDefault(); setMensagemUser(''); setErroUser('Edição de utilizador preparada, mas depende do endpoint PUT/PATCH no backend.'); };

  const guardarFuncionarioEditado = async (e) => {
    e.preventDefault(); setMensagemFunc(''); setErroFunc('');
    try {
      setSubmittingFunc(true); const payload = { ...funcionarioEditando, id_hosp: funcionarioEditando.id_hosp ? Number(funcionarioEditando.id_hosp) : null, idhosp: funcionarioEditando.id_hosp ? Number(funcionarioEditando.id_hosp) : null };
      await apiFetch(`/api/profissionais/${funcionarioEditando.idfunc}`, { method: 'PUT', body: JSON.stringify(payload) });
      setMensagemFunc(textos.admin.sucessoEditarFunc); adicionarHistorico('Editar funcionário', `Foram atualizados os dados do funcionário ${funcionarioEditando.nome}.`);
      carregarProfissionais(); setFuncionarioEditando(null); setEmployeeView('lista');
    } catch (err) { setErroFunc(err.message || textos.geral.erroGenerico); } finally { setSubmittingFunc(false); }
  };

  const guardarHospitalEditado = async (e) => {
    e.preventDefault(); setMensagemHospital(''); setErroHospital('');
    try {
      setSubmittingHospital(true); const payload = { nome: hospitalEditando.nome, localizacao: hospitalEditando.localidade, email: hospitalEditando.email || null, telefone: hospitalEditando.contacto || null };
      await apiFetch(`/api/hospitais/${hospitalEditando.idhosp || hospitalEditando.id_hosp}`, { method: 'PUT', body: JSON.stringify(payload) });
      setMensagemHospital(textos.admin.sucessoEditarHosp); adicionarHistorico('Editar hospital', `Foram atualizados os dados do hospital ${hospitalEditando.nome}.`);
      carregarHospitais(); setHospitalEditando(null); setHospitalView('lista');
    } catch (err) { setErroHospital(err.message || textos.geral.erroGenerico); } finally { setSubmittingHospital(false); }
  };

  const exportarRelatorioExcel = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/logs/export/excel', { method: 'GET' });
      if (!response.ok) throw new Error(await response.text() || `Erro HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'relatorio_logs.xlsx';
      document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url);
    } catch (err) { setErroLogs(err.message || textos.geral.erroGenerico); }
  };

  const getHospitalNomeFuncionario = (funcionario) => {
    const idHosp = funcionario?.id_hosp ?? funcionario?.idhosp ?? funcionario?.hospital_id ?? funcionario?.idHospital ?? null;
    if (!idHosp) return '—'; const hospital = hospitais.find((h) => Number(h.idhosp) === Number(idHosp)); return hospital?.nome || '—';
  };

  // ==========================================
  // RENDERIZAÇÃO DAS VISTAS (CENTRO)
  // ==========================================

  const renderUserCenter = () => {
    if (userView === 'novo') {
      const funcSelecionado = profissionais.find((p) => p.idfunc === Number(novoUtilizador.idfunc));
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>{textos.admin.btnNovoUtilizador}</h2>
          </div>
          <form className="admin-form" onSubmit={criarUtilizador}>
            <div className="admin-form__grid">
              <div className="admin-form__group" style={{ gridColumn: '1 / -1' }} ref={dropdownRef}>
                <label htmlFor="search-func">{textos.admin.lblNome}</label>
                <div className="admin-dropdown">
                  <input
                    id="search-func"
                    type="text"
                    className="admin-dropdown__input"
                    placeholder={textos.geral.pesquisarNome}
                    value={pesquisaFuncionarioNovoUser}
                    onChange={(e) => { setPesquisaFuncionarioNovoUser(e.target.value); setDropdownAberto(true); if (!e.target.value) setNovoUtilizador(prev => ({ ...prev, idfunc: '', username: '' })); }}
                    onFocus={() => setDropdownAberto(true)}
                    autoComplete="off"
                  />
                  {funcSelecionado && <div className="admin-dropdown__selected">✓ #{funcSelecionado.idfunc} — {funcSelecionado.nome}</div>}
                  {dropdownAberto && (
                    <div className="admin-dropdown__list">
                      {funcionariosPesquisaNovoUser.length === 0 ? (
                        <div className="admin-dropdown__empty">{textos.geral.semResultados}</div>
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
                <label htmlFor="user-username">{textos.admin.lblUsername}</label>
                <input id="user-username" name="username" type="text" value={novoUtilizador.username} onChange={handleNovoUserChange} required />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-password">{textos.admin.lblPassword}</label>
                <input id="user-password" name="password" type="password" value={novoUtilizador.password} onChange={handleNovoUserChange} required />
              </div>

              <div className="admin-form__group">
                <label htmlFor="user-role">{textos.admin.lblFuncao}</label>
                <select id="user-role" name="role" value={novoUtilizador.role} onChange={handleNovoUserChange}>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MEDICO}>Médico</option>
                  <option value={ROLES.ENFERMEIRO}>Enfermeiro</option>
                  <option value={ROLES.RECECIONISTA}>Rececionista</option>
                </select>
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingUser || !novoUtilizador.idfunc}>
                {submittingUser ? textos.geral.aCarregar : textos.admin.btnNovoUtilizador}
              </button>
              <button type="button" className="admin-secondary-button" onClick={() => setUserView('lista')}>
                {textos.geral.cancelar}
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
            <h2>{utilizadorEditando.isNovo ? textos.admin.btnNovoUtilizador : textos.geral.editar}</h2>
            <p>#{utilizadorEditando.idfunc} — {utilizadorEditando.nome}</p>
          </div>

          <form className="admin-form" onSubmit={guardarUtilizadorEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="edit-user-id">{textos.admin.lblNumFuncionario}</label>
                <input id="edit-user-id" type="text" value={utilizadorEditando.idfunc || ''} readOnly />
              </div>
              <div className="admin-form__group">
                <label htmlFor="edit-user-nome">{textos.admin.lblNome}</label>
                <input id="edit-user-nome" name="nome" type="text" value={utilizadorEditando.nome || ''} onChange={handleEditarUserChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="edit-user-username">{textos.admin.lblUsername}</label>
                <input id="edit-user-username" name="username" type="text" value={utilizadorEditando.username || ''} onChange={handleEditarUserChange} />
              </div>
              <div className="admin-form__group">
                <label htmlFor="edit-user-role">{textos.admin.lblFuncao}</label>
                <select id="edit-user-role" name="role" value={utilizadorEditando.role || ROLES.ADMIN} onChange={handleEditarUserChange}>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.MEDICO}>Médico</option>
                  <option value={ROLES.ENFERMEIRO}>Enfermeiro</option>
                  <option value={ROLES.RECECIONISTA}>Rececionista</option>
                </select>
              </div>
            </div>

            <div aria-live="polite">
              {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
              {erroUser && <p className="admin-form__error">{erroUser}</p>}
            </div>

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">{textos.geral.guardar}</button>
              <button type="button" className="admin-secondary-button" onClick={() => { setUtilizadorEditando(null); setUserView('lista'); }}>{textos.geral.cancelar}</button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos.admin.menuUtilizadores}</h2>
          <p>{textos.admin.descUtilizadores}</p>
        </div>

        <div aria-live="polite">
          {erroUtilizadores && <p className="admin-form__error">{erroUtilizadores}</p>}
          {erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoUtilizador}>
            {textos.admin.btnNovoUtilizador}
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label htmlFor="filter-user-username">{textos.admin.lblUsername}</label>
            <input id="filter-user-username" type="text" value={filtroUserUsername} onChange={(e) => setFiltroUserUsername(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-nome">{textos.geral.pesquisarNome}</label>
            <input id="filter-user-nome" type="text" value={filtroUserNome} onChange={(e) => setFiltroUserNome(e.target.value)} />
          </div>
          <div className="admin-form__group">
            <label htmlFor="filter-user-num">{textos.geral.pesquisarNumero}</label>
            <input id="filter-user-num" type="text" value={filtroUserNumero} onChange={(e) => setFiltroUserNumero(e.target.value)} />
          </div>
        </div>

        <div className="admin-users-grid-top">
          
          {/* TABELA 1: UTILIZADORES COM CONTA */}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>{textos.admin.tblUtilizadoresComConta}</h3>
              <span>{utilizadoresComContaFiltrados.length}</span>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblUsername}</th><th>{textos.admin.lblFuncao}</th><th>{textos.geral.editar}</th></tr></thead>
                <tbody>
                  {loadingUtilizadores || loadingProfissionais ? (<tr><td colSpan="5">{textos.geral.aCarregar}</td></tr>) : utilizadoresComContaFiltrados.length === 0 ? (<tr><td colSpan="5">{textos.geral.semResultados}</td></tr>) : (
                    utilizadoresComContaFiltrados.map((u) => {
                      const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                      return (
                        <tr key={u.idfunc || u.username}>
                          <td>{u.idfunc}</td><td>{prof?.nome || '—'}</td><td>{u.username}</td><td>{u.role || prof?.tipofunc || '—'}</td>
                          <td><button type="button" className="admin-secondary-button" onClick={() => abrirEditarUtilizador(u)}>{textos.geral.editar}</button></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABELA 2: FUNCIONÁRIOS SEM UTILIZADOR */}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>{textos.admin.tblFuncionariosSemConta}</h3>
              <span>{funcionariosSemContaFiltrados.length}</span>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{textos.admin.lblNumFuncionario}</th>
                    <th>{textos.admin.lblNome}</th>
                    <th>{textos.admin.lblFuncao}</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProfissionais ? (
                    <tr>
                      <td colSpan="4">{textos.geral.aCarregar}</td>
                    </tr>
                  ) : funcionariosSemContaFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4">{textos.geral.semResultados}</td>
                    </tr>
                  ) : (
                    funcionariosSemContaFiltrados.map((p) => (
                      <tr key={p.idfunc}>
                        <td>{p.idfunc}</td>
                        <td>{p.nome}</td>
                        <td>{p.tipofunc}</td>
                        <td>
                          <button
                            type="button"
                            className="admin-secondary-button"
                            onClick={() => abrirCriarAPartirFuncionario(p)}
                          >
                            {textos.admin.btnNovoUtilizador}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* TABELA 3: UTILIZADORES BLOQUEADOS */}
        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header">
            <h3>{textos.admin.tblUtilizadoresBloqueados}</h3>
            <span>{utilizadoresBloqueadosFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{textos.admin.lblNumFuncionario}</th>
                  <th>{textos.admin.lblNome}</th>
                  <th>{textos.admin.lblUsername}</th>
                  <th>{textos.admin.lblFuncao}</th>
                </tr>
              </thead>
              <tbody>
                {loadingUtilizadores ? (
                  <tr>
                    <td colSpan="4">{textos.geral.aCarregar}</td>
                  </tr>
                ) : utilizadoresBloqueadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4">{textos.admin.semBloqueados}</td>
                  </tr>
                ) : (
                  utilizadoresBloqueadosFiltrados.map((u) => {
                    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                    return (
                      <tr key={u.idfunc || u.username}>
                        <td>{u.idfunc}</td>
                        <td>{prof?.nome || '—'}</td>
                        <td>{u.username}</td>
                        <td>{u.role || prof?.tipofunc || '—'}</td>
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
              <div className="admin-form__group"><label htmlFor="efunc-hosp">{textos.admin.lblHospital}</label><select id="efunc-hosp" name="id_hosp" value={funcionarioEditando.id_hosp || ''} onChange={handleEditarFuncChange}><option value="">Sem hospital</option>{hospitais.map((h) => (<option key={h.idhosp} value={h.idhosp}>{h.nome}</option>))}</select></div>
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
        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header"><h3>{textos.admin.menuFuncionarios}</h3><span>{funcionariosFiltrados.length}</span></div>
          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.lblNumFuncionario}</th><th>{textos.admin.lblNome}</th><th>{textos.admin.lblFuncao}</th><th>{textos.admin.lblHospital}</th><th>{textos.geral.editar}</th></tr></thead>
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
            </div>
            <div aria-live="polite">{mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}{erroHospital && <p className="admin-form__error">{erroHospital}</p>}</div>
            <div className="admin-actions-row"><button type="submit" className="admin-form__submit" disabled={submittingHospital}>{textos.geral.guardar}</button><button type="button" className="admin-secondary-button" onClick={() => setHospitalView('lista')}>{textos.geral.cancelar}</button></div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header"><h2>{textos.admin.menuHospitais}</h2><p>{textos.admin.descHospitais}</p></div>
        <div className="admin-toolbar admin-toolbar--left"><button type="button" className="admin-primary-big-button" onClick={abrirNovoHospital}>{textos.admin.btnNovoHospital}</button></div>
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
        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header">
            <h3>{textos.admin.menuRelatorios}</h3><span>{logs.length}</span>
            <div className="admin-header-actions"><button type="button" className="admin-secondary-button" onClick={carregarLogs}>{textos.admin.btnAtualizar}</button><button type="button" className="admin-primary-big-button" onClick={exportarRelatorioExcel}>{textos.admin.btnExportarExcel}</button></div>
          </div>
          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead><tr><th>{textos.admin.colData}</th><th>{textos.admin.colAcao}</th><th>{textos.admin.colDetalhe}</th></tr></thead>
              <tbody>
                {loadingLogs ? (<tr><td colSpan="3">{textos.geral.aCarregar}</td></tr>) : logs.length === 0 ? (<tr><td colSpan="3">{textos.admin.semHistorico}</td></tr>) : (
                  logs.map((item) => (<tr key={item.idlog}><td>{item.criado_em ? new Date(item.criado_em).toLocaleString(idioma === 'pt' ? 'pt-PT' : 'en-GB') : '—'}</td><td>{item.acao || '—'}</td><td>{item.detalhe || '—'}</td></tr>))
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
              <button 
                type="button" 
                onClick={() => mudarIdioma('pt')}
                style={{ background: 'none', border: 'none', color: idioma === 'pt' ? '#3eb489' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >PT</button>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
              <button 
                type="button" 
                onClick={() => mudarIdioma('en')}
                style={{ background: 'none', border: 'none', color: idioma === 'en' ? '#3eb489' : '#fff', cursor: 'pointer', fontWeight: 'bold' }}
              >EN</button>
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