import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  const [loadingProfissionais, setLoadingProfissionais] = useState(false);
  const [loadingUtilizadores, setLoadingUtilizadores] = useState(false);
  const [loadingHospitais, setLoadingHospitais] = useState(false);

  const [erroProfissionais, setErroProfissionais] = useState('');
  const [erroUtilizadores, setErroUtilizadores] = useState('');
  const [erroHospitais, setErroHospitais] = useState('');

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

  useEffect(() => {
    carregarTudo();
    iniciarHistoricoBase();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const carregarTudo = async () => {
    await Promise.all([
      carregarProfissionais(),
      carregarUtilizadores(),
      carregarHospitais(),
    ]);
  };

  const carregarProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      setErroProfissionais('');
      const res = await fetch(`${API_URL}/api/profissionais/`);
      if (!res.ok) throw new Error('Erro ao carregar funcionários.');
      const data = await res.json();
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
      const res = await fetch(`${API_URL}/api/utilizadores/`);
      if (!res.ok) throw new Error('Erro ao carregar utilizadores.');
      const data = await res.json();
      setUtilizadores(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API_URL}/api/hospitais/`);
      if (!res.ok) throw new Error('Erro ao carregar hospitais.');
      const data = await res.json();
      setHospitais(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroHospitais(err.message);
      setHospitais([]);
    } finally {
      setLoadingHospitais(false);
    }
  };

  const idsComConta = new Set(
    utilizadores
      .map((u) => u.idfunc)
      .filter((id) => id !== null && id !== undefined)
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
    return (
      normalizar(p.nome).includes(normalizar(filtroFuncNome)) &&
      String(p.idfunc || '').includes(filtroFuncNumero) &&
      (filtroFuncTipo === '' || normalizar(p.tipofunc) === normalizar(filtroFuncTipo))
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
    });
    setFuncionarioEditando(null);
    setEmployeeView('novo');
  };

  const abrirEditarFuncionario = (funcionario) => {
    resetMensagens();
    setFuncionarioEditando({ ...funcionario });
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
      ...hospital,
      email: hospital.email || '',
      localidade: hospital.localidade || '',
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

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao criar utilizador.');

      setMensagemUser(`Utilizador ${data.username || novoUtilizador.username} criado com sucesso.`);
      adicionarHistorico(
        'Criar utilizador',
        `Foi criado o utilizador ${data.username || novoUtilizador.username}.`
      );

      setNovoUtilizador({
        idfunc: '',
        username: '',
        password: '',
        role: 'admin',
      });

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

      const res = await fetch(`${API_URL}/api/profissionais/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProfissional),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao criar funcionário.');

      setMensagemFunc('Funcionário criado com sucesso.');
      adicionarHistorico(
        'Criar funcionário',
        `Foi criado o funcionário ${data.nome || novoProfissional.nome}.`
      );

      setNovoProfissional({
        nome: '',
        tipofunc: 'admin',
        sexo: 'M',
      });

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

    try {
      setSubmittingHospital(true);

      const res = await fetch(`${API_URL}/api/hospitais/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoHospital),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao criar hospital.');

      setMensagemHospital(`Hospital ${data.nome || novoHospital.nome} criado com sucesso.`);
      adicionarHistorico(
        'Criar hospital',
        `Foi criado o hospital ${data.nome || novoHospital.nome}.`
      );

      setNovoHospital({
        nome: '',
        email: '',
        localidade: '',
        contacto: '',
      });

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
    setErroUser('Edição de utilizador preparada, mas depende do endpoint PUT/PATCH no backend.');
  };

  const guardarFuncionarioEditado = async (e) => {
    e.preventDefault();
    setMensagemFunc('');
    setErroFunc('Edição de funcionário preparada, mas depende do endpoint PUT no backend.');
  };

  const guardarHospitalEditado = async (e) => {
    e.preventDefault();
    setMensagemHospital('');
    setErroHospital('');

    try {
      setSubmittingHospital(true);

      const idHospital = hospitalEditando.id_hosp || hospitalEditando.idhosp;

      const payload = {
        nome: hospitalEditando.nome,
        email: hospitalEditando.email,
        localidade: hospitalEditando.localidade,
        contacto: hospitalEditando.contacto,
      };

      const res = await fetch(`${API_URL}/api/hospitais/${idHospital}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao editar hospital.');

      setMensagemHospital('Hospital atualizado com sucesso.');
      adicionarHistorico(
        'Editar hospital',
        `Foram atualizados os dados do hospital ${data.nome || hospitalEditando.nome}.`
      );

      await carregarHospitais();
      setHospitalEditando(null);
      setHospitalView('lista');
    } catch (err) {
      setErroHospital(err.message);
    } finally {
      setSubmittingHospital(false);
    }
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
                  {utilizadoresComContaFiltrados.length === 0 ? (
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
                  {funcionariosSemContaFiltrados.length === 0 ? (
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
                {utilizadoresBloqueadosFiltrados.length === 0 ? (
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
            <p>Adicionar um novo profissional ao sistema.</p>
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
            <p>Formulário preparado para edição quando o endpoint existir.</p>
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
            </div>

            {mensagemFunc && <p className="admin-form__success">{mensagemFunc}</p>}
            {erroFunc && <p className="admin-form__error">{erroFunc}</p>}

            <div className="admin-actions-row">
              <button type="submit" className="admin-form__submit">
                Guardar alterações
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
          <p>Gerir funcionários existentes e criar novos registos.</p>
        </div>

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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5">Sem resultados.</td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map((f) => (
                    <tr key={f.idfunc}>
                      <td>{f.idfunc}</td>
                      <td>{f.nome}</td>
                      <td>{f.tipofunc}</td>
                      <td>{f.sexo}</td>
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
                <input
                  type="text"
                  value={hospitalEditando.id_hosp || hospitalEditando.idhosp || ''}
                  readOnly
                />
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
                {hospitaisFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6">Sem resultados.</td>
                  </tr>
                ) : (
                  hospitaisFiltrados.map((h) => (
                    <tr key={h.id_hosp || h.idhosp || h.nome}>
                      <td>{h.id_hosp || h.idhosp || '—'}</td>
                      <td>{h.nome || '—'}</td>
                      <td>{h.email || '—'}</td>
                      <td>{h.localidade || '—'}</td>
                      <td>{h.contacto || h.telefone || '—'}</td>
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
            <span>{historico.length}</span>
          </div>

          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ação</th>
                  <th>Detalhe</th>
                </tr>
              </thead>
              <tbody>
                {historico.length === 0 ? (
                  <tr>
                    <td colSpan="3">Sem histórico.</td>
                  </tr>
                ) : (
                  historico.map((item) => (
                    <tr key={item.id}>
                      <td>{item.data}</td>
                      <td>{item.acao}</td>
                      <td>{item.detalhe}</td>
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
          <img src={logo} alt="Logótipo SIGUI" className="admin-sidebar__logo" />
          <div>
            <strong>SIGUI</strong>
            <span>Painel de Administração</span>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'utilizadores' ? 'is-active' : ''}`}
            onClick={() => {
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
              setMainMenu('hospitais');
              setHospitalView('lista');
            }}
          >
            Hospitais
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${mainMenu === 'relatorios' ? 'is-active' : ''}`}
            onClick={() => setMainMenu('relatorios')}
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