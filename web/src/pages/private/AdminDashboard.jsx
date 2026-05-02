import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/logo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';

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
  const [filtroFuncHospital, setFiltroFuncHospital] = useState('');

  const [filtroHospitalNome, setFiltroHospitalNome] = useState('');
  const [filtroHospitalLocalidade, setFiltroHospitalLocalidade] = useState('');

  const [novoUtilizador, setNovoUtilizador] = useState({
    idfunc: '',
    username: '',
    password: '',
    role: 'admin',
  });

  const [novoProfissional, setNovoProfissional] = useState({
    nome: '',
    tipofunc: 'admin',
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

  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState('Painel de Administração');

  useEffect(() => {
    carregarTudo();
    iniciarHistoricoBase();
  }, []);

  useEffect(() => {
    resolverUtilizadorAutenticado();
  }, [profissionais, utilizadores]);

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

  const iniciarHistoricoBase = () => {
    setHistorico([
      {
        id: 1,
        acao: 'Sistema iniciado',
        detalhe: 'O painel de administração foi carregado.',
        data: new Date().toLocaleString('pt-PT'),
      },
    ]);
  };

  const adicionarHistorico = (acao, detalhe) => {
    setHistorico((prev) => [
      {
        id: Date.now() + Math.random(),
        acao,
        detalhe,
        data: new Date().toLocaleString('pt-PT'),
      },
      ...prev,
    ]);
  };

  const resetMensagens = () => {
    setMensagemUser('');
    setErroUser('');
    setMensagemFunc('');
    setErroFunc('');
    setMensagemHospital('');
    setErroHospital('');
  };

  const resolverUtilizadorAutenticado = () => {
  try {
    const rawUser = sessionStorage.getItem('user');
    const userObj = rawUser ? JSON.parse(rawUser) : null;

    if (userObj?.nome) {
      setFuncionarioAutenticadoNome(userObj.nome);
      return;
    }

    if (userObj?.username) {
      setFuncionarioAutenticadoNome(userObj.username);
      return;
    }

    setFuncionarioAutenticadoNome('Utilizador autenticado');
  } catch {
    setFuncionarioAutenticadoNome('Utilizador autenticado');
  }
};

  const carregarTudo = async () => {
    await Promise.all([
      carregarProfissionais(),
      carregarUtilizadores(),
      carregarHospitais(),
      carregarLogs(),
    ]);
  };

  const carregarProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      setErroProfissionais('');
      const data = await apiFetch('/api/profissionais/');
      setProfissionais(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroProfissionais(err.message || 'Erro ao carregar profissionais.');
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
      setUtilizadores(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroUtilizadores(err.message || 'Erro ao carregar utilizadores.');
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
      const hospitaisAdaptados = Array.isArray(data) ? data.map(mapHospitalFromApi) : [];
      setHospitais(hospitaisAdaptados);
    } catch (err) {
      setErroHospitais(err.message || 'Erro ao carregar hospitais.');
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
      setErroLogs(err.message || 'Erro ao carregar logs.');
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const idsComConta = useMemo(
    () =>
      new Set(
        utilizadores
          .map((u) => u.idfunc)
          .filter((id) => id !== null && id !== undefined)
      ),
    [utilizadores]
  );

  const utilizadoresComConta = utilizadores.filter((u) => u.bloqueado !== true);
  const utilizadoresBloqueados = utilizadores.filter((u) => u.bloqueado === true);
  const funcionariosSemConta = profissionais.filter((p) => !idsComConta.has(p.idfunc));

  const utilizadoresComContaFiltrados = utilizadoresComConta.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return (
      normalizar(u.username).includes(normalizar(filtroUserUsername)) &&
      normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) &&
      String(u.idfunc || '').includes(filtroUserNumero)
    );
  });

  const funcionariosSemContaFiltrados = funcionariosSemConta.filter((p) => {
    return (
      normalizar(p.nome).includes(normalizar(filtroUserNome)) &&
      String(p.idfunc || '').includes(filtroUserNumero)
    );
  });

  const utilizadoresBloqueadosFiltrados = utilizadoresBloqueados.filter((u) => {
    const prof = profissionais.find((p) => p.idfunc === u.idfunc);
    return (
      normalizar(u.username).includes(normalizar(filtroUserUsername)) &&
      normalizar(prof?.nome || '').includes(normalizar(filtroUserNome)) &&
      String(u.idfunc || '').includes(filtroUserNumero)
    );
  });

  const funcionariosFiltrados = profissionais.filter((p) => {
    const hospitalFuncionario =
      hospitais.find(
        (h) =>
          Number(h.idhosp) === Number(p.id_hosp) ||
          Number(h.idhosp) === Number(p.idhosp) ||
          Number(h.idhosp) === Number(p.hospital_id)
      ) || null;

    const nomeHospital = hospitalFuncionario?.nome || '';

    return (
      normalizar(p.nome).includes(normalizar(filtroFuncNome)) &&
      String(p.idfunc || '').includes(filtroFuncNumero) &&
      (filtroFuncTipo === '' || normalizar(p.tipofunc) === normalizar(filtroFuncTipo)) &&
      normalizar(nomeHospital).includes(normalizar(filtroFuncHospital))
    );
  });

  const funcionariosPesquisaNovoUser = funcionariosSemConta.filter((p) => {
    return (
      normalizar(p.nome).includes(normalizar(pesquisaFuncionarioNovoUser)) ||
      String(p.idfunc).includes(pesquisaFuncionarioNovoUser)
    );
  });

  const hospitaisFiltrados = hospitais.filter((h) => {
    return (
      normalizar(h.nome).includes(normalizar(filtroHospitalNome)) &&
      normalizar(h.localidade || '').includes(normalizar(filtroHospitalLocalidade))
    );
  });

  const abrirNovoUtilizador = () => {
    resetMensagens();
    setNovoUtilizador({
      idfunc: '',
      username: '',
      password: '',
      role: 'admin',
    });
    setPesquisaFuncionarioNovoUser('');
    setDropdownAberto(false);
    setUtilizadorEditando(null);
    setUserView('novo');
  };

  const abrirEditarUtilizador = (utilizador) => {
    const prof = profissionais.find((p) => p.idfunc === utilizador.idfunc);
    resetMensagens();
    setUtilizadorEditando({
      ...utilizador,
      nome: prof?.nome || '',
      tipofunc: prof?.tipofunc || '',
      sexo: prof?.sexo || '',
      password: '',
    });
    setUserView('editar');
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
      role: funcionario.tipofunc || 'admin',
      isNovo: true,
    });
    setUserView('editar');
  };

  const abrirNovoFuncionario = () => {
    resetMensagens();
    setNovoProfissional({
      nome: '',
      tipofunc: 'admin',
      sexo: 'M',
      id_hosp: '',
    });
    setFuncionarioEditando(null);
    setEmployeeView('novo');
  };

  const abrirEditarFuncionario = (funcionario) => {
    resetMensagens();
    setFuncionarioEditando({
      ...funcionario,
      id_hosp:
        funcionario.id_hosp ??
        funcionario.idhosp ??
        funcionario.hospital_id ??
        '',
    });
    setEmployeeView('editar');
  };

  const abrirNovoHospital = () => {
    resetMensagens();
    setNovoHospital({
      nome: '',
      email: '',
      localidade: '',
      contacto: '',
    });
    setHospitalEditando(null);
    setHospitalView('novo');
  };

  const abrirEditarHospital = (hospital) => {
    resetMensagens();
    setHospitalEditando({
      idhosp: hospital.idhosp || hospital.id_hosp || '',
      nome: hospital.nome || '',
      localidade: hospital.localidade || hospital.localizacao || '',
      email: hospital.email || '',
      contacto: hospital.contacto || hospital.telefone || '',
    });
    setHospitalView('editar');
  };

  const handleNovoUserChange = (e) => {
    const { name, value } = e.target;
    setNovoUtilizador((prev) => ({ ...prev, [name]: value }));
  };

  const handleNovoProfChange = (e) => {
    const { name, value } = e.target;
    setNovoProfissional((prev) => ({ ...prev, [name]: value }));
  };

  const handleNovoHospitalChange = (e) => {
    const { name, value } = e.target;
    setNovoHospital((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditarUserChange = (e) => {
    const { name, value } = e.target;
    setUtilizadorEditando((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditarFuncChange = (e) => {
    const { name, value } = e.target;
    setFuncionarioEditando((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditarHospitalChange = (e) => {
    const { name, value } = e.target;
    setHospitalEditando((prev) => ({ ...prev, [name]: value }));
  };

  const selecionarFuncionarioNovoUser = (funcionario) => {
    setNovoUtilizador((prev) => ({
      ...prev,
      idfunc: funcionario.idfunc,
      username: gerarUsername(funcionario.nome),
      role: funcionario.tipofunc || 'admin',
    }));
    setPesquisaFuncionarioNovoUser(funcionario.nome);
    setDropdownAberto(false);
  };

  const criarUtilizador = async (e) => {
    e.preventDefault();
    setMensagemUser('');
    setErroUser('');

    try {
      setSubmittingUser(true);

      const payload = {
        ...novoUtilizador,
        idfunc: Number(novoUtilizador.idfunc),
      };

      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMensagemUser(`Utilizador ${data.username || novoUtilizador.username} criado com sucesso.`);
      adicionarHistorico(
        'Criar utilizador',
        `Foi criado o utilizador ${data.username || novoUtilizador.username}.`
      );

      setNovoUtilizador({ idfunc: '', username: '', password: '', role: 'admin' });
      setPesquisaFuncionarioNovoUser('');
      await carregarUtilizadores();
      setUserView('lista');
    } catch (err) {
      setErroUser(err.message || 'Erro ao criar utilizador.');
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

      const payload = {
        ...novoProfissional,
        id_hosp: novoProfissional.id_hosp ? Number(novoProfissional.id_hosp) : null,
        idhosp: novoProfissional.id_hosp ? Number(novoProfissional.id_hosp) : null,
      };

      const data = await apiFetch('/api/profissionais/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMensagemFunc('Funcionário criado com sucesso.');
      adicionarHistorico(
        'Criar funcionário',
        `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`
      );

      setNovoProfissional({ nome: '', tipofunc: 'admin', sexo: 'M', id_hosp: '' });
      await carregarProfissionais();
      setEmployeeView('lista');
    } catch (err) {
      setErroFunc(err.message || 'Erro ao criar funcionário.');
    } finally {
      setSubmittingFunc(false);
    }
  };

  const criarHospital = async (e) => {
    e.preventDefault();
    setMensagemHospital('');
    setErroHospital('');

    if (!novoHospital.nome.trim()) {
      setErroHospital('O nome do hospital é obrigatório.');
      return;
    }

    if (!novoHospital.localidade.trim()) {
      setErroHospital('A localização do hospital é obrigatória.');
      return;
    }

    try {
      setSubmittingHospital(true);

      const payload = {
        nome: novoHospital.nome.trim(),
        localizacao: novoHospital.localidade.trim(),
        email: novoHospital.email.trim() || null,
        telefone: novoHospital.contacto.trim() || null,
      };

      await apiFetch('/api/hospitais/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setMensagemHospital(`Hospital ${novoHospital.nome} criado com sucesso.`);
      adicionarHistorico('Criar hospital', `Foi criado o hospital ${novoHospital.nome}.`);

      setNovoHospital({ nome: '', email: '', localidade: '', contacto: '' });
      await carregarHospitais();
      setHospitalView('lista');
    } catch (err) {
      setErroHospital(err.message || 'Erro ao criar hospital.');
    } finally {
      setSubmittingHospital(false);
    }
  };

  const guardarUtilizadorEditado = async (e) => {
    e.preventDefault();
    setMensagemUser('');
    setErroUser('Edição de utilizador preparada, mas depende do endpoint PUT/PATCH no backend.');
  };

  const guardarFuncionarioEditado = async (e) => {
    e.preventDefault();
    setMensagemFunc('');
    setErroFunc('');

    try {
      setSubmittingFunc(true);

      const idFuncionario = funcionarioEditando.idfunc;

      const payload = {
        ...funcionarioEditando,
        id_hosp: funcionarioEditando.id_hosp ? Number(funcionarioEditando.id_hosp) : null,
        idhosp: funcionarioEditando.id_hosp ? Number(funcionarioEditando.id_hosp) : null,
      };

      await apiFetch(`/api/profissionais/${idFuncionario}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMensagemFunc('Funcionário atualizado com sucesso.');
      adicionarHistorico(
        'Editar funcionário',
        `Foram atualizados os dados do funcionário ${funcionarioEditando.nome}.`
      );

      await carregarProfissionais();
      setFuncionarioEditando(null);
      setEmployeeView('lista');
    } catch (err) {
      setErroFunc(err.message || 'Erro ao editar funcionário.');
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

      const idHospital = hospitalEditando.idhosp || hospitalEditando.id_hosp;

      const payload = {
        nome: hospitalEditando.nome,
        localizacao: hospitalEditando.localidade,
        email: hospitalEditando.email || null,
        telefone: hospitalEditando.contacto || null,
      };

      await apiFetch(`/api/hospitais/${idHospital}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMensagemHospital('Hospital atualizado com sucesso.');
      adicionarHistorico(
        'Editar hospital',
        `Foram atualizados os dados do hospital ${hospitalEditando.nome}.`
      );

      await carregarHospitais();
      setHospitalEditando(null);
      setHospitalView('lista');
    } catch (err) {
      setErroHospital(err.message || 'Erro ao atualizar hospital.');
    } finally {
      setSubmittingHospital(false);
    }
  };

  const getHospitalNomeFuncionario = (funcionario) => {
    const idHosp =
      funcionario?.id_hosp ??
      funcionario?.idhosp ??
      funcionario?.hospital_id ??
      funcionario?.idHospital ??
      null;

    if (!idHosp) return '—';

    const hospital = hospitais.find((h) => Number(h.idhosp) === Number(idHosp));
    return hospital?.nome || '—';
  };

  const renderUserCenter = () => {
    if (userView === 'novo') {
      const funcSelecionado = profissionais.find(
        (p) => p.idfunc === Number(novoUtilizador.idfunc)
      );

      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Novo utilizador</h2>
            <p>Seleciona um funcionário sem conta e cria o acesso ao sistema.</p>
          </div>

          <form className="admin-form" onSubmit={criarUtilizador}>
            <div className="admin-form__grid">
              <div
                className="admin-form__group"
                style={{ gridColumn: '1 / -1' }}
                ref={dropdownRef}
              >
                <label>Funcionário</label>
                <div className="admin-dropdown">
                  <input
                    type="text"
                    className="admin-dropdown__input"
                    placeholder="Pesquisar funcionário por nome ou número..."
                    value={pesquisaFuncionarioNovoUser}
                    onChange={(e) => {
                      setPesquisaFuncionarioNovoUser(e.target.value);
                      setDropdownAberto(true);
                      if (!e.target.value) {
                        setNovoUtilizador((prev) => ({
                          ...prev,
                          idfunc: '',
                          username: '',
                        }));
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
                        <div className="admin-dropdown__empty">Nenhum funcionário encontrado.</div>
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
                              #{p.idfunc} · {p.tipofunc}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-form__group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  value={novoUtilizador.username}
                  onChange={handleNovoUserChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={novoUtilizador.password}
                  onChange={handleNovoUserChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label>Role</label>
                <select name="role" value={novoUtilizador.role} onChange={handleNovoUserChange}>
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="rececionista">Rececionista</option>
                </select>
              </div>
            </div>

            {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
            {erroUser && <p className="admin-form__error">{erroUser}</p>}

            <div className="admin-actions-row">
              <button
                type="submit"
                className="admin-form__submit"
                disabled={submittingUser || !novoUtilizador.idfunc}
              >
                {submittingUser ? 'A criar...' : 'Criar utilizador'}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setUserView('lista')}
              >
                Cancelar
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
            <h2>{utilizadorEditando.isNovo ? 'Criar utilizador' : 'Editar utilizador'}</h2>
            <p>
              Funcionário #{utilizadorEditando.idfunc} — {utilizadorEditando.nome}
            </p>
          </div>

          <form className="admin-form" onSubmit={guardarUtilizadorEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>Nº funcionário</label>
                <input type="text" value={utilizadorEditando.idfunc || ''} readOnly />
              </div>

              <div className="admin-form__group">
                <label>Nome</label>
                <input
                  name="nome"
                  type="text"
                  value={utilizadorEditando.nome || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Função</label>
                <input
                  name="tipofunc"
                  type="text"
                  value={utilizadorEditando.tipofunc || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Sexo</label>
                <input
                  name="sexo"
                  type="text"
                  value={utilizadorEditando.sexo || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  value={utilizadorEditando.username || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Password</label>
                <input
                  name="password"
                  type="password"
                  value={utilizadorEditando.password || ''}
                  onChange={handleEditarUserChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Role</label>
                <select
                  name="role"
                  value={utilizadorEditando.role || 'admin'}
                  onChange={handleEditarUserChange}
                >
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="rececionista">Rececionista</option>
                </select>
              </div>
            </div>

            {mensagemUser && <p className="admin-form__success">{mensagemUser}</p>}
            {erroUser && <p className="admin-form__error">{erroUser}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">
                Guardar alterações
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setUtilizadorEditando(null);
                  setUserView('lista');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>Utilizadores</h2>
          <p>Gerir contas de acesso, contas por criar e utilizadores bloqueados.</p>
        </div>

        {erroUtilizadores && <p className="admin-form__error">{erroUtilizadores}</p>}
        {erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoUtilizador}>
            Novo utilizador
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label>Pesquisar por username</label>
            <input
              type="text"
              value={filtroUserUsername}
              onChange={(e) => setFiltroUserUsername(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label>Pesquisar por nome</label>
            <input
              type="text"
              value={filtroUserNome}
              onChange={(e) => setFiltroUserNome(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label>Pesquisar por número</label>
            <input
              type="text"
              value={filtroUserNumero}
              onChange={(e) => setFiltroUserNumero(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-users-grid-top">
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>Utilizadores com conta</h3>
              <span>{utilizadoresComContaFiltrados.length}</span>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Nome</th>
                    <th>Username</th>
                    <th>Função</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUtilizadores || loadingProfissionais ? (
                    <tr>
                      <td colSpan="5">A carregar...</td>
                    </tr>
                  ) : utilizadoresComContaFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="5">Sem resultados.</td>
                    </tr>
                  ) : (
                    utilizadoresComContaFiltrados.map((u) => {
                      const prof = profissionais.find((p) => p.idfunc === u.idfunc);
                      return (
                        <tr key={u.idfunc || u.username}>
                          <td>{u.idfunc}</td>
                          <td>{prof?.nome || '—'}</td>
                          <td>{u.username}</td>
                          <td>{u.role || prof?.tipofunc || '—'}</td>
                          <td>
                            <button
                              type="button"
                              className="admin-secondary-button"
                              onClick={() => abrirEditarUtilizador(u)}
                            >
                              Editar
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

          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>Funcionários sem utilizador</h3>
              <span>{funcionariosSemContaFiltrados.length}</span>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Nome</th>
                    <th>Função</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingProfissionais ? (
                    <tr>
                      <td colSpan="4">A carregar...</td>
                    </tr>
                  ) : funcionariosSemContaFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4">Sem resultados.</td>
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
                            Criar utilizador
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

        <div className="admin-table-card admin-table-card--bottom">
          <div className="admin-table-card__header">
            <h3>Utilizadores bloqueados</h3>
            <span>{utilizadoresBloqueadosFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Username</th>
                  <th>Função</th>
                </tr>
              </thead>
              <tbody>
                {loadingUtilizadores ? (
                  <tr>
                    <td colSpan="4">A carregar...</td>
                  </tr>
                ) : utilizadoresBloqueadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="4">Sem utilizadores bloqueados.</td>
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
          <div className="admin-panel-section__header">
            <h2>Novo funcionário</h2>
            <p>Adicionar um novo profissional ao sistema e associá-lo a um hospital.</p>
          </div>

          <form className="admin-form" onSubmit={criarFuncionario}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>Nome</label>
                <input
                  name="nome"
                  type="text"
                  value={novoProfissional.nome}
                  onChange={handleNovoProfChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label>Função</label>
                <select
                  name="tipofunc"
                  value={novoProfissional.tipofunc}
                  onChange={handleNovoProfChange}
                >
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="rececionista">Rececionista</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label>Sexo</label>
                <select
                  name="sexo"
                  value={novoProfissional.sexo}
                  onChange={handleNovoProfChange}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label>Hospital</label>
                <select
                  name="id_hosp"
                  value={novoProfissional.id_hosp}
                  onChange={handleNovoProfChange}
                >
                  <option value="">Sem hospital</option>
                  {hospitais.map((hospital) => (
                    <option key={hospital.idhosp} value={hospital.idhosp}>
                      {hospital.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
            {erroFunc && <p className="admin-form__error">{erroFunc}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingFunc}>
                {submittingFunc ? 'A criar...' : 'Criar funcionário'}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setEmployeeView('lista')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (employeeView === 'editar' && funcionarioEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Editar funcionário</h2>
            <p>Editar dados do funcionário e o hospital associado.</p>
          </div>

          <form className="admin-form" onSubmit={guardarFuncionarioEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>Nº</label>
                <input type="text" value={funcionarioEditando.idfunc || ''} readOnly />
              </div>

              <div className="admin-form__group">
                <label>Nome</label>
                <input
                  name="nome"
                  type="text"
                  value={funcionarioEditando.nome || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Função</label>
                <input
                  name="tipofunc"
                  type="text"
                  value={funcionarioEditando.tipofunc || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Sexo</label>
                <input
                  name="sexo"
                  type="text"
                  value={funcionarioEditando.sexo || ''}
                  onChange={handleEditarFuncChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Hospital</label>
                <select
                  name="id_hosp"
                  value={funcionarioEditando.id_hosp || ''}
                  onChange={handleEditarFuncChange}
                >
                  <option value="">Sem hospital</option>
                  {hospitais.map((hospital) => (
                    <option key={hospital.idhosp} value={hospital.idhosp}>
                      {hospital.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
            {erroFunc && <p className="admin-form__error">{erroFunc}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingFunc}>
                {submittingFunc ? 'A guardar...' : 'Guardar alterações'}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setFuncionarioEditando(null);
                  setEmployeeView('lista');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>Funcionários</h2>
          <p>Gerir funcionários existentes, criar novos registos e associar hospitais.</p>
        </div>

        {erroProfissionais && <p className="admin-form__error">{erroProfissionais}</p>}
        {erroHospitais && <p className="admin-form__error">{erroHospitais}</p>}

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoFuncionario}>
            Novo funcionário
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label>Pesquisar por nome</label>
            <input
              type="text"
              value={filtroFuncNome}
              onChange={(e) => setFiltroFuncNome(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label>Pesquisar por número</label>
            <input
              type="text"
              value={filtroFuncNumero}
              onChange={(e) => setFiltroFuncNumero(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label>Filtrar por função</label>
            <select value={filtroFuncTipo} onChange={(e) => setFiltroFuncTipo(e.target.value)}>
              <option value="">Todos</option>
              <option value="admin">Admin</option>
              <option value="medico">Médico</option>
              <option value="enfermeiro">Enfermeiro</option>
              <option value="rececionista">Rececionista</option>
            </select>
          </div>

          <div className="admin-form__group">
            <label>Filtrar por hospital</label>
            <input
              type="text"
              value={filtroFuncHospital}
              onChange={(e) => setFiltroFuncHospital(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>Lista de funcionários</h3>
            <span>{funcionariosFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Função</th>
                  <th>Sexo</th>
                  <th>Hospital</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingProfissionais ? (
                  <tr>
                    <td colSpan="6">A carregar...</td>
                  </tr>
                ) : funcionariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6">Sem resultados.</td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map((f) => (
                    <tr key={f.idfunc}>
                      <td>{f.idfunc}</td>
                      <td>{f.nome}</td>
                      <td>{f.tipofunc}</td>
                      <td>{f.sexo}</td>
                      <td>{getHospitalNomeFuncionario(f)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() => abrirEditarFuncionario(f)}
                        >
                          Editar
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
          <div className="admin-panel-section__header">
            <h2>Novo hospital</h2>
            <p>Adicionar um novo hospital ao sistema.</p>
          </div>

          <form className="admin-form" onSubmit={criarHospital}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>Nome</label>
                <input
                  name="nome"
                  type="text"
                  value={novoHospital.nome}
                  onChange={handleNovoHospitalChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={novoHospital.email}
                  onChange={handleNovoHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Localização</label>
                <input
                  name="localidade"
                  type="text"
                  value={novoHospital.localidade}
                  onChange={handleNovoHospitalChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label>Contacto</label>
                <input
                  name="contacto"
                  type="text"
                  value={novoHospital.contacto}
                  onChange={handleNovoHospitalChange}
                />
              </div>
            </div>

            {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
            {erroHospital && <p className="admin-form__error">{erroHospital}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingHospital}>
                {submittingHospital ? 'A criar...' : 'Criar hospital'}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => setHospitalView('lista')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      );
    }

    if (hospitalView === 'editar' && hospitalEditando) {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Editar hospital</h2>
            <p>Editar informação do hospital no painel central.</p>
          </div>

          <form className="admin-form" onSubmit={guardarHospitalEditado}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label>ID hospital</label>
                <input type="text" value={hospitalEditando.idhosp || ''} readOnly />
              </div>

              <div className="admin-form__group">
                <label>Nome</label>
                <input
                  name="nome"
                  type="text"
                  value={hospitalEditando.nome || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={hospitalEditando.email || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Localização</label>
                <input
                  name="localidade"
                  type="text"
                  value={hospitalEditando.localidade || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>

              <div className="admin-form__group">
                <label>Contacto</label>
                <input
                  name="contacto"
                  type="text"
                  value={hospitalEditando.contacto || ''}
                  onChange={handleEditarHospitalChange}
                />
              </div>
            </div>

            {mensagemHospital && <p className="admin-form__success">{mensagemHospital}</p>}
            {erroHospital && <p className="admin-form__error">{erroHospital}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit" disabled={submittingHospital}>
                {submittingHospital ? 'A guardar...' : 'Guardar alterações'}
              </button>
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setHospitalEditando(null);
                  setHospitalView('lista');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      );
    }

    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>Hospitais</h2>
          <p>Lista dos hospitais existentes e edição no painel central.</p>
        </div>

        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-primary-big-button" onClick={abrirNovoHospital}>
            Novo hospital
          </button>
        </div>

        <div className="admin-filters">
          <div className="admin-form__group">
            <label>Pesquisar por nome</label>
            <input
              type="text"
              value={filtroHospitalNome}
              onChange={(e) => setFiltroHospitalNome(e.target.value)}
            />
          </div>

          <div className="admin-form__group">
            <label>Pesquisar por localização</label>
            <input
              type="text"
              value={filtroHospitalLocalidade}
              onChange={(e) => setFiltroHospitalLocalidade(e.target.value)}
            />
          </div>
        </div>

        {erroHospitais && <p className="admin-form__error">{erroHospitais}</p>}

        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>Lista de hospitais</h3>
            <span>{hospitaisFiltrados.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--employees">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Localização</th>
                  <th>Contacto</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loadingHospitais ? (
                  <tr>
                    <td colSpan="6">A carregar...</td>
                  </tr>
                ) : hospitaisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6">Sem resultados.</td>
                  </tr>
                ) : (
                  hospitaisFiltrados.map((h) => (
                    <tr key={h.idhosp || h.nome}>
                      <td>{h.idhosp || '—'}</td>
                      <td>{h.nome || '—'}</td>
                      <td>{h.email || '—'}</td>
                      <td>{h.localidade || '—'}</td>
                      <td>{h.contacto || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-secondary-button"
                          onClick={() => abrirEditarHospital(h)}
                        >
                          Editar
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

  const renderReportsCenter = () => {
    return (
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>Relatórios</h2>
          <p>Resumo geral e histórico do que foi feito no painel.</p>
        </div>

        {erroLogs && <p className="admin-form__error">{erroLogs}</p>}

        <div className="admin-report-grid">
          <div className="admin-report-card">
            <h3>Utilizadores</h3>
            <p>Total com conta</p>
            <strong>{utilizadoresComConta.length}</strong>
          </div>

          <div className="admin-report-card">
            <h3>Funcionários</h3>
            <p>Total registado</p>
            <strong>{profissionais.length}</strong>
          </div>

          <div className="admin-report-card">
            <h3>Hospitais</h3>
            <p>Total existente</p>
            <strong>{hospitais.length}</strong>
          </div>

          <div className="admin-report-card">
            <h3>Sem utilizador</h3>
            <p>Funcionários sem acesso</p>
            <strong>{funcionariosSemConta.length}</strong>
          </div>
        </div>

        <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
          <div className="admin-table-card__header">
            <h3>Histórico</h3>
            <span>{logs.length}</span>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={carregarLogs}
            >
              {loadingLogs ? 'A atualizar...' : 'Atualizar'}
            </button>
          </div>

          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Utilizador</th>
                  <th>Ação</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {loadingLogs ? (
                  <tr>
                    <td colSpan="4">A carregar...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="4">Sem histórico.</td>
                  </tr>
                ) : (
                  logs.map((item) => (
                    <tr key={item.idlog}>
                      <td>{item.criado_em ? new Date(item.criado_em).toLocaleString('pt-PT') : '—'}</td>
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
  };

  const renderCenter = () => {
    if (mainMenu === 'utilizadores') return renderUserCenter();
    if (mainMenu === 'funcionarios') return renderEmployeeCenter();
    if (mainMenu === 'hospitais') return renderHospitalCenter();
    if (mainMenu === 'relatorios') return renderReportsCenter();
    return null;
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src={logo} alt="Logótipo SIAGUH" className="admin-sidebar__logo" />
          <div>
            <strong>SIAGUH</strong>
            <span>{funcionarioAutenticadoNome}</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'utilizadores' ? 'is-active' : ''}`}
            onClick={() => {
              resetMensagens();
              setMainMenu('utilizadores');
              setUserView('lista');
            }}
          >
            Utilizadores
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
            Funcionários
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
            Hospitais
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'relatorios' ? 'is-active' : ''}`}
            onClick={() => {
              resetMensagens();
              setMainMenu('relatorios');
            }}
          >
            Relatórios
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <button type="button" className="admin-logout-button" onClick={() => navigate('/')}>
            Sair
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <div className="admin-content__top">
          <h1>Painel do Administrador</h1>
          <p>
            {mainMenu === 'utilizadores' && 'Gestão de contas de acesso.'}
            {mainMenu === 'funcionarios' && 'Gestão de funcionários.'}
            {mainMenu === 'hospitais' && 'Gestão dos hospitais existentes.'}
            {mainMenu === 'relatorios' && 'Resumo e histórico de atividade.'}
          </p>
        </div>

        <div className="admin-content__body">{renderCenter()}</div>
      </section>
    </main>
  );
}