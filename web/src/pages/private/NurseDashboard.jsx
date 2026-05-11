import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';
import '../../styles/nurse-dashboard.css';

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
    return user?.nome || user?.username || 'Enfermeiro';
  } catch {
    return 'Enfermeiro';
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

const mapEpisodio = (ep) => ({
  ...ep,
  id: Number(ep?.id_epurgencia ?? ep?.idepisodio ?? ep?.id ?? 0),
  idutente: Number(ep?.id_utente ?? ep?.idutente ?? ep?.utente_id ?? ep?.idut ?? 0) || null,
  nome_utente: ep?.nome_utente ?? ep?.nomeutente ?? ep?.utente_nome ?? ep?.utente?.nome ?? '',
  datahoraentr: ep?.datahoraentr ?? ep?.datahora ?? ep?.criado_em ?? ep?.created_at ?? '',
  cor_triagem: ep?.cor_triagem ?? ep?.cor ?? '',
  estado: ep?.estado ?? ep?.status ?? '',
});

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
  alergias: u?.alergias ?? u?.antecedentes ?? '',
});

export default function NurseDashboard() {
  const navigate = useNavigate();
  const { textos } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('fila');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState('Enfermeiro');

  const [triagemForm, setTriagemForm] = useState({
    sintomas: '',
    temperatura: '',
    sistolica: '',
    diastolica: '',
    frequencia_cardiaca: '',
    saturacao: '',
    cor_triagem: 'Amarelo',
    observacoes: '',
  });

  useEffect(() => {
    setFuncionarioAutenticadoNome(obterNomeSessao());
    carregarEpisodios();
  }, []);

  const fazerLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS?.USER_DATA || 'user');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  const carregarEpisodios = async () => {
    try {
      setLoading(true);
      setErro('');
      const data = await apiTry([
        { url: '/api/episodios' },
        { url: '/api/episodios/' },
      ]);

      const lista = toArray(data)
        .map(mapEpisodio)
        .filter((ep) => ep.id > 0)
        .filter((ep) => !ep.cor_triagem);

      setEpisodios(lista);
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar a fila de episódios.');
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirEpisodio = async (episodio) => {
    setEpisodioSelecionado(episodio);
    setMensagem('');
    setErro('');
    setMainMenu('ficha');

    try {
      setLoadingDetalhe(true);

      if (episodio?.idutente) {
        try {
          const dataUtente = await apiTry([
            { url: `/api/utentes/${episodio.idutente}` },
            { url: `/api/utentes/${episodio.idutente}/` },
            { url: `/api/utente/${episodio.idutente}` },
          ]);
          setUtente(mapUtente(dataUtente));
        } catch {
          setUtente({ nome: episodio.nome_utente || '—' });
        }

        try {
          const dataMedicacao = await apiTry([
            { url: `/api/medicacao-ativa/utente/${episodio.idutente}` },
            { url: `/api/medicacao_ativa/utente/${episodio.idutente}` },
            { url: `/api/medicacao-ativa/${episodio.idutente}` },
          ]);
          setMedicacaoAtiva(toArray(dataMedicacao));
        } catch {
          setMedicacaoAtiva([]);
        }
      } else {
        setUtente({ nome: episodio.nome_utente || '—' });
        setMedicacaoAtiva([]);
      }
    } catch (err) {
      setErro(err.message || 'Não foi possível abrir o episódio.');
      setUtente(null);
      setMedicacaoAtiva([]);
    } finally {
      setLoadingDetalhe(false);
    }
  };

  const guardarTriagem = async (e) => {
    e.preventDefault();

    if (!episodioSelecionado?.id) {
      setErro('Seleciona primeiro um episódio.');
      return;
    }

    try {
      setErro('');
      setMensagem('');

      await apiTry([
        {
          url: '/api/triagens',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_epurgencia: episodioSelecionado.id,
              id_utente: episodioSelecionado.idutente,
              sintomas: triagemForm.sintomas,
              temperatura: triagemForm.temperatura,
              tensao_sistolica: triagemForm.sistolica,
              tensao_diastolica: triagemForm.diastolica,
              frequencia_cardiaca: triagemForm.frequencia_cardiaca,
              saturacao: triagemForm.saturacao,
              cor_triagem: triagemForm.cor_triagem,
              observacoes: triagemForm.observacoes,
            }),
          },
        },
        {
          url: '/api/triagem',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_epurgencia: episodioSelecionado.id,
              id_utente: episodioSelecionado.idutente,
              sintomas: triagemForm.sintomas,
              temperatura: triagemForm.temperatura,
              tensao_sistolica: triagemForm.sistolica,
              tensao_diastolica: triagemForm.diastolica,
              frequencia_cardiaca: triagemForm.frequencia_cardiaca,
              saturacao: triagemForm.saturacao,
              cor_triagem: triagemForm.cor_triagem,
              observacoes: triagemForm.observacoes,
            }),
          },
        },
      ]);

      setMensagem('Triagem registada com sucesso.');
      setTriagemForm({
        sintomas: '',
        temperatura: '',
        sistolica: '',
        diastolica: '',
        frequencia_cardiaca: '',
        saturacao: '',
        cor_triagem: 'Amarelo',
        observacoes: '',
      });
      await carregarEpisodios();
      setMainMenu('fila');
    } catch (err) {
      setErro(err.message || 'Não foi possível guardar a triagem.');
    }
  };

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) =>
      normalizar(ep.nome_utente).includes(normalizar(filtroNome))
    );
  }, [episodios, filtroNome]);

  const renderFila = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Dashboard Enfermeiro</h2>
        <p>Fila de episódios, contexto clínico e triagem assistida.</p>
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
        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-secondary-button" onClick={carregarEpisodios}>
            Atualizar fila
          </button>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>Fila de episódios abertos sem triagem</h3>
          <span>{episodiosFiltrados.length}</span>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Episódio</th>
                <th>Utente</th>
                <th>Entrada</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">{textos.geral.aCarregar}</td>
                </tr>
              ) : episodiosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4">{textos.geral.semResultados}</td>
                </tr>
              ) : (
                episodiosFiltrados.map((ep) => (
                  <tr key={ep.id}>
                    <td>{ep.id || '—'}</td>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{formatarDataHora(ep.datahoraentr)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => abrirEpisodio(ep)}
                      >
                        Abrir
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

  const renderFicha = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Abrir episódio para triagem</h2>
        <p>Consulta do contexto clínico essencial antes da triagem.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Seleciona um episódio na fila.</div>
        </div>
      ) : loadingDetalhe ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>{textos.geral.aCarregar}</div>
        </div>
      ) : (
        <>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Utente</span>
              <strong>{utente?.nome || episodioSelecionado.nome_utente || '—'}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Entrada</span>
              <strong>{formatarDataHora(episodioSelecionado.datahoraentr)}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Episódio</span>
              <strong>{episodioSelecionado.id}</strong>
            </div>
          </div>

          <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
            <div className="admin-table-card__header">
              <h3>Ficha do utente</h3>
            </div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <div><strong>Nome:</strong> {utente?.nome || '—'}</div>
              <div><strong>NIF:</strong> {utente?.nif || '—'}</div>
              <div><strong>Data nascimento:</strong> {utente?.data_nascimento || '—'}</div>
              <div><strong>Sexo:</strong> {utente?.sexo || '—'}</div>
              <div><strong>Telefone:</strong> {utente?.telefone || '—'}</div>
              <div><strong>Email:</strong> {utente?.email || '—'}</div>
              <div><strong>Alergias:</strong> {utente?.alergias || '—'}</div>
            </div>
          </div>
        </>
      )}
    </section>
  );

  const renderMedicacao = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Medicação ativa</h2>
        <p>Consulta rápida da medicação atual do utente.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Abre um episódio para consultar a medicação.</div>
        </div>
      ) : (
        <div className="admin-table-card admin-table-card--full">
          <div className="admin-table-card__header">
            <h3>Lista</h3>
            <span>{medicacaoAtiva.length}</span>
          </div>
          <div className="admin-table-scroll admin-table-scroll--wide">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Posologia</th>
                  <th>Início</th>
                  <th>Fim</th>
                </tr>
              </thead>
              <tbody>
                {medicacaoAtiva.length === 0 ? (
                  <tr>
                    <td colSpan="4">{textos.geral.semResultados}</td>
                  </tr>
                ) : (
                  medicacaoAtiva.map((m, idx) => (
                    <tr key={m.id || idx}>
                      <td>{m.nome || m.medicamento || '—'}</td>
                      <td>{m.dosagem || m.posologia || '—'}</td>
                      <td>{m.datainicio || m.data_inicio || '—'}</td>
                      <td>{m.datafim || m.data_fim || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );

  const renderTriagem = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Registar triagem</h2>
        <p>Preenchimento clínico estruturado para priorização do episódio.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Seleciona primeiro um episódio.</div>
        </div>
      ) : (
        <form className="admin-form" onSubmit={guardarTriagem}>
          <div className="admin-form__grid">
            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>Sintomas</label>
              <textarea
                rows="4"
                value={triagemForm.sintomas}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, sintomas: e.target.value }))}
                required
              />
            </div>

            <div className="admin-form__group">
              <label>Temperatura</label>
              <input
                value={triagemForm.temperatura}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, temperatura: e.target.value }))}
              />
            </div>

            <div className="admin-form__group">
              <label>Tensão sistólica</label>
              <input
                value={triagemForm.sistolica}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, sistolica: e.target.value }))}
              />
            </div>

            <div className="admin-form__group">
              <label>Tensão diastólica</label>
              <input
                value={triagemForm.diastolica}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, diastolica: e.target.value }))}
              />
            </div>

            <div className="admin-form__group">
              <label>Frequência cardíaca</label>
              <input
                value={triagemForm.frequencia_cardiaca}
                onChange={(e) =>
                  setTriagemForm((prev) => ({ ...prev, frequencia_cardiaca: e.target.value }))
                }
              />
            </div>

            <div className="admin-form__group">
              <label>Saturação</label>
              <input
                value={triagemForm.saturacao}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, saturacao: e.target.value }))}
              />
            </div>

            <div className="admin-form__group">
              <label>Cor da triagem</label>
              <select
                value={triagemForm.cor_triagem}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, cor_triagem: e.target.value }))}
              >
                <option value="Vermelho">Vermelho</option>
                <option value="Laranja">Laranja</option>
                <option value="Amarelo">Amarelo</option>
                <option value="Verde">Verde</option>
                <option value="Azul">Azul</option>
              </select>
            </div>

            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>Observações</label>
              <textarea
                rows="5"
                value={triagemForm.observacoes}
                onChange={(e) => setTriagemForm((prev) => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="submit" className="admin-form__submit">
              Guardar triagem
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setMainMenu('fila')}
            >
              {textos.geral.cancelar}
            </button>
          </div>
        </form>
      )}
    </section>
  );

  const renderCenter = () => {
    if (mainMenu === 'fila') return renderFila();
    if (mainMenu === 'ficha') return renderFicha();
    if (mainMenu === 'medicacao') return renderMedicacao();
    if (mainMenu === 'triagem') return renderTriagem();
    return null;
  };

  return (
    // NurseDashboard.jsx
    <div className="admin-page-wrapper nurse-dashboard">
      <main className={`admin-layout ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <aside className="admin-sidebar" aria-label="Navegação lateral do Enfermeiro">
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
              className={`admin-sidebar__link ${mainMenu === 'fila' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('fila')}
            >
              <span className="link-text">Fila sem triagem</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'ficha' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('ficha')}
            >
              <span className="link-text">Ficha do utente</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'medicacao' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('medicacao')}
            >
              <span className="link-text">Medicação ativa</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'triagem' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('triagem')}
            >
              <span className="link-text">Registar triagem</span>
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