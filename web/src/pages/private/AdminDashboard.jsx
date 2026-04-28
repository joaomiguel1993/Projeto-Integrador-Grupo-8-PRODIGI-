import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/logo.png';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('criar-funcionario');

  const [profissionais, setProfissionais] = useState([]);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);
  const [erroProfissionais, setErroProfissionais] = useState('');

  const [novoProfissional, setNovoProfissional] = useState({
    nome: '',
    tipofunc: 'admin',
    sexo: 'M',
  });

  const [novoUtilizador, setNovoUtilizador] = useState({
    username: '',
    password: '',
    role: 'admin',
    idfunc: '',
  });

  const [mensagemProfissional, setMensagemProfissional] = useState('');
  const [erroProfissional, setErroProfissional] = useState('');

  const [mensagemUtilizador, setMensagemUtilizador] = useState('');
  const [erroUtilizador, setErroUtilizador] = useState('');

  const [submittingProfissional, setSubmittingProfissional] = useState(false);
  const [submittingUtilizador, setSubmittingUtilizador] = useState(false);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroNumero, setFiltroNumero] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const carregarProfissionais = async () => {
    try {
      setLoadingProfissionais(true);
      setErroProfissionais('');

      const response = await fetch('http://localhost:8000/api/profissionais/');

      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais.');
      }

      const data = await response.json();
      setProfissionais(Array.isArray(data) ? data : []);
    } catch (err) {
      setErroProfissionais(err.message || 'Erro ao carregar profissionais.');
      setProfissionais([]);
    } finally {
      setLoadingProfissionais(false);
    }
  };

  useEffect(() => {
    carregarProfissionais();
  }, []);

  const handleProfissionalChange = (e) => {
    const { name, value } = e.target;
    setNovoProfissional((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUtilizadorChange = (e) => {
    const { name, value } = e.target;
    setNovoUtilizador((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const criarProfissional = async (e) => {
    e.preventDefault();
    setMensagemProfissional('');
    setErroProfissional('');

    try {
      setSubmittingProfissional(true);

      const response = await fetch('http://localhost:8000/api/profissionais/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoProfissional),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao criar funcionário.');
      }

      setMensagemProfissional(`Funcionário criado com sucesso. ID: ${data.idfunc}`);
      setNovoProfissional({
        nome: '',
        tipofunc: 'admin',
        sexo: 'M',
      });

      await carregarProfissionais();
      setActiveSection('ver-funcionarios');
    } catch (err) {
      setErroProfissional(err.message || 'Erro ao criar funcionário.');
    } finally {
      setSubmittingProfissional(false);
    }
  };

  const criarUtilizador = async (e) => {
    e.preventDefault();
    setMensagemUtilizador('');
    setErroUtilizador('');

    try {
      setSubmittingUtilizador(true);

      const payload = {
        ...novoUtilizador,
        idfunc: Number(novoUtilizador.idfunc),
      };

      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erro ao criar utilizador.');
      }

      setMensagemUtilizador(`Utilizador ${data.username} criado com sucesso.`);
      setNovoUtilizador({
        username: '',
        password: '',
        role: 'admin',
        idfunc: '',
      });
    } catch (err) {
      setErroUtilizador(err.message || 'Erro ao criar utilizador.');
    } finally {
      setSubmittingUtilizador(false);
    }
  };

  const profissionaisFiltrados = profissionais.filter((profissional) => {
    const nome = profissional.nome?.toLowerCase() || '';
    const tipo = profissional.tipofunc?.toLowerCase() || '';
    const id = String(profissional.idfunc || '');

    const matchNome = nome.includes(filtroNome.toLowerCase());
    const matchNumero = id.includes(filtroNumero);
    const matchTipo = filtroTipo === '' || tipo === filtroTipo.toLowerCase();

    return matchNome && matchNumero && matchTipo;
  });

  const renderContent = () => {
    if (activeSection === 'criar-funcionario') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Criar funcionário</h2>
            <p>Adiciona um novo profissional ao sistema.</p>
          </div>

          <form className="admin-form" onSubmit={criarProfissional}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={novoProfissional.nome}
                  onChange={handleProfissionalChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="tipofunc">Tipo</label>
                <select
                  id="tipofunc"
                  name="tipofunc"
                  value={novoProfissional.tipofunc}
                  onChange={handleProfissionalChange}
                >
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="rececionista">Rececionista</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={novoProfissional.sexo}
                  onChange={handleProfissionalChange}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>

            {mensagemProfissional && (
              <p className="admin-form__success">{mensagemProfissional}</p>
            )}

            {erroProfissional && (
              <p className="admin-form__error">{erroProfissional}</p>
            )}

            <button
              type="submit"
              className="admin-form__submit"
              disabled={submittingProfissional}
            >
              {submittingProfissional ? 'A criar...' : 'Criar funcionário'}
            </button>
          </form>
        </section>
      );
    }

    if (activeSection === 'criar-utilizador') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Criar utilizador</h2>
            <p>Cria uma conta de acesso associada a um funcionário.</p>
          </div>

          <form className="admin-form" onSubmit={criarUtilizador}>
            <div className="admin-form__grid">
              <div className="admin-form__group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={novoUtilizador.username}
                  onChange={handleUtilizadorChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={novoUtilizador.password}
                  onChange={handleUtilizadorChange}
                  required
                />
              </div>

              <div className="admin-form__group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={novoUtilizador.role}
                  onChange={handleUtilizadorChange}
                >
                  <option value="admin">Admin</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="rececionista">Rececionista</option>
                </select>
              </div>

              <div className="admin-form__group">
                <label htmlFor="idfunc">ID do funcionário</label>
                <input
                  id="idfunc"
                  name="idfunc"
                  type="number"
                  value={novoUtilizador.idfunc}
                  onChange={handleUtilizadorChange}
                  required
                />
              </div>
            </div>

            {mensagemUtilizador && (
              <p className="admin-form__success">{mensagemUtilizador}</p>
            )}

            {erroUtilizador && (
              <p className="admin-form__error">{erroUtilizador}</p>
            )}

            <button
              type="submit"
              className="admin-form__submit"
              disabled={submittingUtilizador}
            >
              {submittingUtilizador ? 'A criar...' : 'Criar utilizador'}
            </button>
          </form>
        </section>
      );
    }

    if (activeSection === 'ver-funcionarios') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Ver funcionários</h2>
            <p>Consulta e pesquisa os profissionais registados no sistema.</p>
          </div>

          <div className="admin-filters">
            <div className="admin-form__group">
              <label htmlFor="filtroNome">Pesquisar por nome</label>
              <input
                id="filtroNome"
                type="text"
                placeholder="Ex.: João"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>

            <div className="admin-form__group">
              <label htmlFor="filtroNumero">Pesquisar por número</label>
              <input
                id="filtroNumero"
                type="text"
                placeholder="Ex.: 12"
                value={filtroNumero}
                onChange={(e) => setFiltroNumero(e.target.value)}
              />
            </div>

            <div className="admin-form__group">
              <label htmlFor="filtroTipo">Filtrar por tipo</label>
              <select
                id="filtroTipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="medico">Médico</option>
                <option value="enfermeiro">Enfermeiro</option>
                <option value="rececionista">Rececionista</option>
              </select>
            </div>
          </div>

          <div className="admin-actions-row">
            <button
              type="button"
              className="admin-secondary-button"
              onClick={carregarProfissionais}
            >
              Atualizar lista
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => {
                setFiltroNome('');
                setFiltroNumero('');
                setFiltroTipo('');
              }}
            >
              Limpar filtros
            </button>
          </div>

          {loadingProfissionais ? (
            <p className="admin-muted-text">A carregar funcionários...</p>
          ) : erroProfissionais ? (
            <p className="admin-form__error">{erroProfissionais}</p>
          ) : profissionais.length === 0 ? (
            <p className="admin-muted-text">Ainda não existem funcionários.</p>
          ) : profissionaisFiltrados.length === 0 ? (
            <p className="admin-muted-text">
              Não foram encontrados funcionários com esses filtros.
            </p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Sexo</th>
                  </tr>
                </thead>
                <tbody>
                  {profissionaisFiltrados.map((profissional) => (
                    <tr key={profissional.idfunc}>
                      <td>{profissional.idfunc}</td>
                      <td>{profissional.nome}</td>
                      <td>{profissional.tipofunc}</td>
                      <td>{profissional.sexo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      );
    }

    if (activeSection === 'relatorios') {
      return (
        <section className="admin-panel-section">
          <div className="admin-panel-section__header">
            <h2>Relatórios</h2>
            <p>Área reservada para relatórios, estatísticas e indicadores.</p>
          </div>

          <div className="admin-placeholder-card">
            <p>
              Esta secção pode depois mostrar relatórios de profissionais,
              triagens, internamentos, tempos de espera e atividade hospitalar.
            </p>
          </div>
        </section>
      );
    }

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
            className={`admin-sidebar__link ${activeSection === 'criar-funcionario' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('criar-funcionario')}
          >
            Criar funcionário
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeSection === 'criar-utilizador' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('criar-utilizador')}
          >
            Criar utilizador
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeSection === 'ver-funcionarios' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('ver-funcionarios')}
          >
            Ver funcionários
          </button>

          <button
            type="button"
            className={`admin-sidebar__link ${activeSection === 'relatorios' ? 'is-active' : ''}`}
            onClick={() => setActiveSection('relatorios')}
          >
            Relatórios
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <button
            type="button"
            className="admin-logout-button"
            onClick={() => navigate('/')}
          >
            Sair
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <div className="admin-content__top">
          <h1>Painel do Administrador</h1>
          <p>Seleciona uma opção no menu lateral para gerir o sistema.</p>
        </div>

        <div className="admin-content__body">
          {renderContent()}
        </div>
      </section>
    </main>
  );
}