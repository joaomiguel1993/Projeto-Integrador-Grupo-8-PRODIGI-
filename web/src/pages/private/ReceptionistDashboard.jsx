import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';
import '../../styles/receptionist-dashboard.css';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const apiTry = async (tentativas) => {
  let ultimoErro = null;
  for (const tentativa of tentativas) {
    try {
      return await apiFetch(tentativa.url, tentativa.options || {});
    } catch (err) {
      ultimoErro = err;
    }
  }
  throw ultimoErro || new Error('Não foi possível concluir o pedido.');
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const obterNomeSessao = () => {
  try {
    const raw =
      sessionStorage.getItem(STORAGE_KEYS?.USER_DATA) ||
      sessionStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    return user?.nome || user?.username || 'Rececionista';
  } catch {
    return 'Rececionista';
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

const formatarDataHora = (valor) => {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleString('pt-PT');
};

const mapUtente = (u) => ({
  ...u,
  id: Number(u?.idutente ?? u?.id_utente ?? u?.idut ?? u?.id ?? 0),
  nome: u?.nome ?? '',
  nif: u?.nif ?? '',
  sexo: u?.sexo ?? '',
  data_nascimento: u?.data_nascimento ?? u?.datanascimento ?? '',
  telefone: u?.telefone ?? u?.telemovel ?? '',
  email: u?.email ?? '',
  morada: u?.morada ?? u?.localidade ?? '',
});

const mapEpisodio = (ep) => ({
  ...ep,
  id: Number(ep?.id_epurgencia ?? ep?.idepisodio ?? ep?.id ?? 0),
  nome_utente: ep?.nome_utente ?? ep?.utente_nome ?? ep?.nomeutente ?? ep?.utente?.nome ?? '',
  datahoraentr: ep?.datahoraentr ?? ep?.datahora ?? ep?.created_at ?? ep?.criado_em ?? '',
  estado: ep?.estado ?? ep?.status ?? 'Aberto',
});

const obterHospitalSessao = () => {
  try {
    const raw =
      sessionStorage.getItem('hospitalAtivo') ||
      sessionStorage.getItem(STORAGE_KEYS?.HOSPITAL_ATIVO || '');
    const hospital = raw ? JSON.parse(raw) : null;
    return hospital?.nome || hospital?.localizacao || 'Hospital ativo';
  } catch {
    return 'Hospital ativo';
  }
};

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { textos } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('pesquisar');
  const [utentes, setUtentes] = useState([]);
  const [episodiosRecentes, setEpisodiosRecentes] = useState([]);
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState('Rececionista');
  const [hospitalAtivoNome, setHospitalAtivoNome] = useState('Hospital ativo');

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroNif, setFiltroNif] = useState('');

  const [novoUtente, setNovoUtente] = useState({
    nome: '',
    nif: '',
    sexo: 'F',
    data_nascimento: '',
    telefone: '',
    email: '',
    morada: '',
  });

  const [entradaForm, setEntradaForm] = useState({
    observacoes: '',
  });

  const [entradaRegistada, setEntradaRegistada] = useState(null);

  const [episodioForm, setEpisodioForm] = useState({
    queixa_principal: '',
    observacoes: '',
  });

  useEffect(() => {
    setFuncionarioAutenticadoNome(obterNomeSessao());
    setHospitalAtivoNome(obterHospitalSessao());
    carregarUtentes();
    carregarEpisodiosRecentes();
  }, []);

  const fazerLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS?.USER_DATA || 'user');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const carregarUtentes = async () => {
    try {
      setLoading(true);
      setErro('');
      const data = await apiTry([
        { url: '/api/utentes' },
        { url: '/api/utentes/' },
      ]);
      setUtentes(toArray(data).map(mapUtente).filter((u) => u.id > 0));
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar os utentes.');
      setUtentes([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarEpisodiosRecentes = async () => {
    try {
      const data = await apiTry([
        { url: '/api/episodios' },
        { url: '/api/episodios/' },
      ]);
      setEpisodiosRecentes(toArray(data).map(mapEpisodio).slice(0, 10));
    } catch {
      setEpisodiosRecentes([]);
    }
  };

  const criarUtente = async (e) => {
    e.preventDefault();

    try {
      setErro('');
      setMensagem('');
      const data = await apiTry([
        {
          url: '/api/utentes',
          options: {
            method: 'POST',
            body: JSON.stringify(novoUtente),
          },
        },
        {
          url: '/api/utente',
          options: {
            method: 'POST',
            body: JSON.stringify(novoUtente),
          },
        },
      ]);

      const criado = mapUtente(data);
      setMensagem('Utente criado com sucesso.');
      setUtenteSelecionado(criado.id ? criado : null);
      setNovoUtente({
        nome: '',
        nif: '',
        sexo: 'F',
        data_nascimento: '',
        telefone: '',
        email: '',
        morada: '',
      });

      await carregarUtentes();
      setMainMenu('pesquisar');
    } catch (err) {
      setErro(err.message || 'Não foi possível criar o utente.');
    }
  };

  const darEntradaHospital = (e) => {
    e.preventDefault();

    if (!utenteSelecionado) {
      setErro('Seleciona um utente primeiro.');
      return;
    }

    setErro('');
    setMensagem('Entrada registada localmente. Já podes abrir o episódio de urgência.');
    setEntradaRegistada({
      datahora: new Date().toISOString(),
      observacoes: entradaForm.observacoes,
    });
    setMainMenu('episodio');
  };

  const abrirEpisodioUrgencia = async (e) => {
    e.preventDefault();

    if (!utenteSelecionado) {
      setErro('Seleciona um utente primeiro.');
      return;
    }

    try {
      setErro('');
      setMensagem('');

      await apiTry([
        {
          url: '/api/episodios',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_utente: utenteSelecionado.id,
              datahoraentr: entradaRegistada?.datahora || new Date().toISOString(),
              estado: 'ABERTO',
              queixa_principal: episodioForm.queixa_principal,
              observacoes: [entradaRegistada?.observacoes, episodioForm.observacoes]
                .filter(Boolean)
                .join(' | '),
            }),
          },
        },
        {
          url: '/api/episodio',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_utente: utenteSelecionado.id,
              datahoraentr: entradaRegistada?.datahora || new Date().toISOString(),
              estado: 'ABERTO',
              queixa_principal: episodioForm.queixa_principal,
              observacoes: [entradaRegistada?.observacoes, episodioForm.observacoes]
                .filter(Boolean)
                .join(' | '),
            }),
          },
        },
      ]);

      setMensagem('Episódio de urgência aberto com sucesso.');
      setEntradaForm({ observacoes: '' });
      setEntradaRegistada(null);
      setEpisodioForm({ queixa_principal: '', observacoes: '' });
      await carregarEpisodiosRecentes();
      setMainMenu('recentes');
    } catch (err) {
      setErro(err.message || 'Não foi possível abrir o episódio.');
    }
  };

  const utentesFiltrados = useMemo(() => {
    return utentes.filter((u) => {
      const matchNome = normalizar(u.nome).includes(normalizar(filtroNome));
      const matchNif = String(u.nif || '').includes(filtroNif);
      return matchNome && matchNif;
    });
  }, [utentes, filtroNome, filtroNif]);

  const renderPesquisar = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Dashboard Rececionista</h2>
        <p>Fluxo rápido de registo, admissão e abertura de episódio.</p>
      </div>

      <div className="admin-filters">
        <div className="admin-form__group">
          <label>{textos.geral.pesquisarNome}</label>
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            placeholder="Nome do utente"
          />
        </div>
        <div className="admin-form__group">
          <label>NIF</label>
          <input
            type="text"
            value={filtroNif}
            onChange={(e) => setFiltroNif(e.target.value)}
            placeholder="Pesquisar por NIF"
          />
        </div>
      </div>

      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>Utentes</h3>
          <span>{utentesFiltrados.length}</span>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>NIF</th>
                <th>Sexo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">{textos.geral.aCarregar}</td>
                </tr>
              ) : utentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4">Nenhum utente encontrado.</td>
                </tr>
              ) : (
                utentesFiltrados.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.nif || '—'}</td>
                    <td>{u.sexo || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => setUtenteSelecionado(u)}
                      >
                        Selecionar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
        <div className="admin-table-card__header">
          <h3>Ficha base do utente</h3>
        </div>
        <div style={{ padding: '1rem', display: 'grid', gap: '0.5rem' }}>
          {utenteSelecionado ? (
            <>
              <div><strong>Nome:</strong> {utenteSelecionado.nome}</div>
              <div><strong>NIF:</strong> {utenteSelecionado.nif || '—'}</div>
              <div><strong>Telefone:</strong> {utenteSelecionado.telefone || '—'}</div>
              <div><strong>Email:</strong> {utenteSelecionado.email || '—'}</div>
              <div><strong>Morada:</strong> {utenteSelecionado.morada || '—'}</div>
            </>
          ) : (
            <div>Seleciona um utente na pesquisa.</div>
          )}
        </div>
      </div>
    </section>
  );

  const renderNovoUtente = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Novo utente</h2>
        <p>Registo base para admissão rápida.</p>
      </div>

      <form className="admin-form" onSubmit={criarUtente}>
        <div className="admin-form__grid">
          <div className="admin-form__group">
            <label>Nome</label>
            <input
              value={novoUtente.nome}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div className="admin-form__group">
            <label>NIF</label>
            <input
              value={novoUtente.nif}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, nif: e.target.value }))}
            />
          </div>

          <div className="admin-form__group">
            <label>Sexo</label>
            <select
              value={novoUtente.sexo}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, sexo: e.target.value }))}
            >
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </div>

          <div className="admin-form__group">
            <label>Data nascimento</label>
            <input
              type="date"
              value={novoUtente.data_nascimento}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, data_nascimento: e.target.value }))}
            />
          </div>

          <div className="admin-form__group">
            <label>Telefone</label>
            <input
              value={novoUtente.telefone}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, telefone: e.target.value }))}
            />
          </div>

          <div className="admin-form__group">
            <label>Email</label>
            <input
              type="email"
              value={novoUtente.email}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Morada</label>
            <input
              value={novoUtente.morada}
              onChange={(e) => setNovoUtente((prev) => ({ ...prev, morada: e.target.value }))}
            />
          </div>
        </div>

        <div className="admin-actions-row">
          <button type="submit" className="admin-form__submit">
            Criar utente
          </button>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setMainMenu('pesquisar')}
          >
            {textos.geral.cancelar}
          </button>
        </div>
      </form>
    </section>
  );

  const renderEntrada = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Dar entrada no hospital</h2>
        <p>Confirmação rápida do utente antes da abertura do episódio.</p>
      </div>

      <form className="admin-form" onSubmit={darEntradaHospital}>
        <div className="admin-form__grid">
          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Utente selecionado</label>
            <input
              value={utenteSelecionado ? utenteSelecionado.nome : 'Seleciona um utente primeiro.'}
              readOnly
            />
          </div>

          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Observações de receção</label>
            <textarea
              rows="5"
              value={entradaForm.observacoes}
              onChange={(e) => setEntradaForm({ observacoes: e.target.value })}
            />
          </div>
        </div>

        <div className="admin-actions-row">
          <button type="submit" className="admin-form__submit">
            Registar entrada
          </button>
        </div>
      </form>
    </section>
  );

  const renderAbrirEpisodio = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Abrir episódio de urgência</h2>
        <p>Criação do episódio clínico após a admissão.</p>
      </div>

      <form className="admin-form" onSubmit={abrirEpisodioUrgencia}>
        <div className="admin-form__grid">
          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Utente selecionado</label>
            <input
              value={utenteSelecionado ? utenteSelecionado.nome : 'Seleciona um utente primeiro.'}
              readOnly
            />
          </div>

          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Queixa principal</label>
            <input
              value={episodioForm.queixa_principal}
              onChange={(e) =>
                setEpisodioForm((prev) => ({ ...prev, queixa_principal: e.target.value }))
              }
              required
            />
          </div>

          <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
            <label>Observações adicionais</label>
            <textarea
              rows="5"
              value={episodioForm.observacoes}
              onChange={(e) =>
                setEpisodioForm((prev) => ({ ...prev, observacoes: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="admin-actions-row">
          <button type="submit" className="admin-form__submit">
            Abrir episódio
          </button>
        </div>
      </form>
    </section>
  );

  const renderRecentes = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Episódios recentes</h2>
        <p>Consulta rápida da atividade mais recente do hospital ativo.</p>
      </div>

      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>{hospitalAtivoNome}</h3>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utente</th>
                <th>Entrada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {episodiosRecentes.length === 0 ? (
                <tr>
                  <td colSpan="3">Sem episódios recentes.</td>
                </tr>
              ) : (
                episodiosRecentes.map((ep) => (
                  <tr key={ep.id}>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{formatarDataHora(ep.datahoraentr)}</td>
                    <td>{ep.estado || 'Aberto'}</td>
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
    if (mainMenu === 'pesquisar') return renderPesquisar();
    if (mainMenu === 'novo') return renderNovoUtente();
    if (mainMenu === 'entrada') return renderEntrada();
    if (mainMenu === 'episodio') return renderAbrirEpisodio();
    if (mainMenu === 'recentes') return renderRecentes();
    return null;
  };

  return (
    // ReceptionistDashboard.jsx
    <div className="admin-page-wrapper receptionist-dashboard">
      <main className={`admin-layout ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <aside className="admin-sidebar" aria-label="Navegação lateral do Rececionista">
          <button
            className="admin-sidebar__toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-expanded={!isSidebarCollapsed}
            type="button"
          >
            ☰
          </button>

          <div className="admin-sidebar__brand">
            <img src={logo} alt="SIAGUH" className="admin-sidebar__logo" />
          </div>

          <div className="admin-sidebar__divider" />

          <button
            type="button"
            className="admin-sidebar__profile"
            onClick={() => navigate('/perfil')}
            title="Ir para o perfil"
          >
            <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">
              {obterIniciais(funcionarioAutenticadoNome)}
            </div>
            <span className="admin-sidebar__profile-name">{funcionarioAutenticadoNome}</span>
          </button>

          <div className="admin-sidebar__divider" />

          <nav className="admin-sidebar__nav">
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'pesquisar' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('pesquisar')}
            >
              <span className="link-text">Pesquisar utente</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'novo' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('novo')}
            >
              <span className="link-text">Novo utente</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'entrada' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('entrada')}
            >
              <span className="link-text">Dar entrada</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'episodio' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('episodio')}
            >
              <span className="link-text">Abrir episódio</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'recentes' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('recentes')}
            >
              <span className="link-text">Episódios recentes</span>
            </button>
          </nav>

          <div className="admin-sidebar__divider" />

          <button type="button" className="admin-sidebar__logout" onClick={fazerLogout}>
            {textos.admin?.botaoSair || 'Sair'}
          </button>
        </aside>

        <section className="admin-content">
          <div className="admin-content__body">
            {erro && <p className="admin-form__error">{erro}</p>}
            {mensagem && <p className="admin-form__success">{mensagem}</p>}
            {renderCenter()}
          </div>
        </section>
      </main>
    </div>
  );
}