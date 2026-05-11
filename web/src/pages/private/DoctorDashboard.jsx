import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/admin.css';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { STORAGE_KEYS } from '../../constants/roles';
import '../../styles/doctor-dashboard.css';

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
    return user?.nome || user?.username || 'Médico';
  } catch {
    return 'Médico';
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

const parseNumero = (valor) => {
  if (typeof valor === 'number') return valor;
  const match = String(valor || '').match(/\d+/);
  return match ? Number(match[0]) : null;
};

const prioridadePeso = (cor) => {
  const mapa = { vermelho: 1, laranja: 2, amarelo: 3, verde: 4, azul: 5 };
  return mapa[normalizar(cor)] || 99;
};

const mapEpisodio = (ep) => ({
  ...ep,
  id: Number(ep?.id_epurgencia ?? ep?.idepisodio ?? ep?.id ?? 0),
  idutente: Number(ep?.id_utente ?? ep?.idutente ?? ep?.utente_id ?? ep?.idut ?? 0) || null,
  nome_utente: ep?.nome_utente ?? ep?.nomeutente ?? ep?.utente_nome ?? ep?.utente?.nome ?? '',
  cor_triagem: ep?.cor_triagem ?? ep?.cor ?? ep?.prioridade ?? '',
  tempo_espera: ep?.tempo_espera ?? ep?.tempoespera ?? ep?.espera ?? '',
  datahoraentr: ep?.datahoraentr ?? ep?.datahora ?? ep?.criado_em ?? ep?.created_at ?? '',
  estado: ep?.estado ?? ep?.status ?? '',
  atendido: Boolean(ep?.atendido ?? (normalizar(ep?.estado) === 'atendido')),
  alta: Boolean(ep?.alta ?? (normalizar(ep?.estado) === 'alta')),
  internamento: Boolean(
    ep?.internamento ??
    normalizar(ep?.estado).includes('intern')
  ),
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

const construirAlertasFallback = (utente) => {
  const alertas = [];
  if (utente?.alergias) {
    alertas.push({ descricao: `Alergias registadas: ${utente.alergias}` });
  }
  if (!utente?.alergias) {
    alertas.push({ descricao: 'Sem alertas clínicos adicionais registados.' });
  }
  return alertas;
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('visao');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCor, setFiltroCor] = useState('');
  const [funcionarioAutenticadoNome, setFuncionarioAutenticadoNome] = useState('Médico');

  const [prescricaoForm, setPrescricaoForm] = useState({
    medicamento: '',
    posologia: '',
    observacoes: '',
  });

  const [decisaoForm, setDecisaoForm] = useState({
    tipo: 'alta',
    motivo: '',
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
        { url: '/api/triagens' },
        { url: '/api/triagens/' },
      ]);

      const lista = toArray(data)
        .map(mapEpisodio)
        .filter((ep) => ep.id > 0)
        .sort((a, b) => {
          const diffPeso = prioridadePeso(a.cor_triagem) - prioridadePeso(b.cor_triagem);
          if (diffPeso !== 0) return diffPeso;
          return (parseNumero(b.tempo_espera) || 0) - (parseNumero(a.tempo_espera) || 0);
        });

      setEpisodios(lista);
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar os episódios triados.');
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarDetalhe = async (episodio) => {
    setEpisodioSelecionado(episodio);
    setMensagem('');
    setErro('');
    setMainMenu('detalhe');

    try {
      setLoadingDetalhe(true);

      let utenteAtual = null;
      if (episodio?.idutente) {
        try {
          const dataUtente = await apiTry([
            { url: `/api/utentes/${episodio.idutente}` },
            { url: `/api/utentes/${episodio.idutente}/` },
            { url: `/api/utente/${episodio.idutente}` },
          ]);
          utenteAtual = mapUtente(dataUtente);
          setUtente(utenteAtual);
        } catch {
          utenteAtual = {
            nome: episodio.nome_utente || '—',
            alergias: '',
          };
          setUtente(utenteAtual);
        }

        try {
          const dataAlertas = await apiTry([
            { url: `/api/alertas/utente/${episodio.idutente}` },
            { url: `/api/alertas/${episodio.idutente}` },
          ]);
          const listaAlertas = toArray(dataAlertas);
          setAlertas(listaAlertas.length ? listaAlertas : construirAlertasFallback(utenteAtual));
        } catch {
          setAlertas(construirAlertasFallback(utenteAtual));
        }
      } else {
        const fallback = { nome: episodio.nome_utente || '—', alergias: '' };
        setUtente(fallback);
        setAlertas(construirAlertasFallback(fallback));
      }
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar o detalhe clínico.');
      setUtente(null);
      setAlertas([]);
    } finally {
      setLoadingDetalhe(false);
    }
  };

  const guardarPrescricao = async (e) => {
    e.preventDefault();
    if (!episodioSelecionado?.id) {
      setErro('Seleciona um episódio antes de prescrever.');
      return;
    }

    try {
      setErro('');
      setMensagem('');
      await apiTry([
        {
          url: '/api/prescricoes',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_epurgencia: episodioSelecionado.id,
              medicamento: prescricaoForm.medicamento,
              posologia: prescricaoForm.posologia,
              observacoes: prescricaoForm.observacoes,
            }),
          },
        },
        {
          url: '/api/prescricao',
          options: {
            method: 'POST',
            body: JSON.stringify({
              id_epurgencia: episodioSelecionado.id,
              medicamento: prescricaoForm.medicamento,
              posologia: prescricaoForm.posologia,
              observacoes: prescricaoForm.observacoes,
            }),
          },
        },
      ]);

      setMensagem('Prescrição registada com sucesso.');
      setPrescricaoForm({ medicamento: '', posologia: '', observacoes: '' });
    } catch (err) {
      setErro(err.message || 'Não foi possível registar a prescrição.');
    }
  };

  const guardarDecisao = async (e) => {
    e.preventDefault();
    if (!episodioSelecionado?.id) {
      setErro('Seleciona um episódio antes de registar a decisão final.');
      return;
    }

    try {
      setErro('');
      setMensagem('');

      if (decisaoForm.tipo === 'internamento') {
        await apiTry([
          {
            url: '/api/internamentos',
            options: {
              method: 'POST',
              body: JSON.stringify({
                id_epurgencia: episodioSelecionado.id,
                motivo: decisaoForm.motivo,
                observacoes: decisaoForm.observacoes,
              }),
            },
          },
          {
            url: '/api/internamento',
            options: {
              method: 'POST',
              body: JSON.stringify({
                id_epurgencia: episodioSelecionado.id,
                motivo: decisaoForm.motivo,
                observacoes: decisaoForm.observacoes,
              }),
            },
          },
        ]);

        setMensagem('Internamento registado com sucesso.');
      } else {
        await apiTry([
          {
            url: `/api/episodios/${episodioSelecionado.id}/alta`,
            options: {
              method: 'POST',
              body: JSON.stringify({
                motivo: decisaoForm.motivo,
                observacoes: decisaoForm.observacoes,
              }),
            },
          },
          {
            url: `/api/episodios/${episodioSelecionado.id}`,
            options: {
              method: 'PUT',
              body: JSON.stringify({
                estado: 'ALTA',
                motivo_alta: decisaoForm.motivo,
                observacoes: decisaoForm.observacoes,
              }),
            },
          },
        ]);

        setMensagem('Alta registada com sucesso.');
      }

      setDecisaoForm({ tipo: 'alta', motivo: '', observacoes: '' });
      await carregarEpisodios();
    } catch (err) {
      setErro(err.message || 'Não foi possível guardar a decisão final.');
    }
  };

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) => {
      const matchNome = normalizar(ep.nome_utente).includes(normalizar(filtroNome));
      const matchCor = !filtroCor || normalizar(ep.cor_triagem) === normalizar(filtroCor);
      return matchNome && matchCor;
    });
  }, [episodios, filtroNome, filtroCor]);

  const temposPorCor = useMemo(() => {
    const cores = ['Vermelho', 'Amarelo', 'Verde'];
    return cores.map((cor) => {
      const lista = episodios.filter((ep) => normalizar(ep.cor_triagem) === normalizar(cor));
      const numeros = lista.map((ep) => parseNumero(ep.tempo_espera)).filter((n) => n !== null);
      const media = numeros.length
        ? `${Math.round(numeros.reduce((a, b) => a + b, 0) / numeros.length)} min`
        : '—';
      return { cor, media };
    });
  }, [episodios]);

  const renderVisaoGeral = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Dashboard Médico</h2>
        <p>Prioridade, detalhe clínico completo, prescrição e decisão final.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span>Episódios triados</span>
          <strong>{episodios.length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Em espera</span>
          <strong>{episodios.filter((ep) => !ep.atendido).length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Altas hoje</span>
          <strong>{episodios.filter((ep) => ep.alta).length}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Internamentos</span>
          <strong>{episodios.filter((ep) => ep.internamento).length}</strong>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
        <div className="admin-table-card__header">
          <h3>Tempos médios por cor</h3>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cor</th>
                <th>Tempo médio</th>
              </tr>
            </thead>
            <tbody>
              {temposPorCor.map((item) => (
                <tr key={item.cor}>
                  <td>{item.cor}</td>
                  <td>{item.media}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
        <div className="admin-table-card__header">
          <h3>Fila resumida por prioridade</h3>
          <span>{episodiosFiltrados.length}</span>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utente</th>
                <th>Cor</th>
                <th>Espera</th>
                <th>Ação</th>
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
                episodiosFiltrados.slice(0, 8).map((ep) => (
                  <tr key={ep.id}>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{ep.cor_triagem || '—'}</td>
                    <td>{ep.tempo_espera || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => carregarDetalhe(ep)}
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

  const renderListaEpisodios = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Episódios triados</h2>
        <p>Fila clínica pronta para observação médica.</p>
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
          <label>Cor da triagem</label>
          <select value={filtroCor} onChange={(e) => setFiltroCor(e.target.value)}>
            <option value="">Todas</option>
            <option value="Vermelho">Vermelho</option>
            <option value="Laranja">Laranja</option>
            <option value="Amarelo">Amarelo</option>
            <option value="Verde">Verde</option>
            <option value="Azul">Azul</option>
          </select>
        </div>
        <div className="admin-toolbar admin-toolbar--left">
          <button type="button" className="admin-secondary-button" onClick={carregarEpisodios}>
            Atualizar lista
          </button>
        </div>
      </div>

      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>Lista completa</h3>
          <span>{episodiosFiltrados.length}</span>
        </div>
        <div className="admin-table-scroll admin-table-scroll--wide">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Episódio</th>
                <th>Utente</th>
                <th>Gravidade</th>
                <th>Espera</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">{textos.geral.aCarregar}</td>
                </tr>
              ) : episodiosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5">{textos.geral.semResultados}</td>
                </tr>
              ) : (
                episodiosFiltrados.map((ep) => (
                  <tr key={ep.id}>
                    <td>{ep.id || '—'}</td>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{ep.cor_triagem || '—'}</td>
                    <td>{ep.tempo_espera || '—'}</td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => carregarDetalhe(ep)}
                      >
                        Detalhe
                      </button>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => {
                          setEpisodioSelecionado(ep);
                          setMainMenu('prescricao');
                        }}
                      >
                        Prescrever
                      </button>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => {
                          setEpisodioSelecionado(ep);
                          setMainMenu('decisao');
                        }}
                      >
                        Decidir
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

  const renderDetalhe = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Detalhe completo do episódio</h2>
        <p>Consulta clínica completa do caso selecionado.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Seleciona um episódio triado.</div>
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
              <span>Cor</span>
              <strong>{episodioSelecionado.cor_triagem || '—'}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Espera</span>
              <strong>{episodioSelecionado.tempo_espera || '—'}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Entrada</span>
              <strong>{formatarDataHora(episodioSelecionado.datahoraentr)}</strong>
            </div>
          </div>

          <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
            <div className="admin-table-card__header">
              <h3>Ficha do utente</h3>
            </div>
            <div style={{ padding: '1rem', display: 'grid', gap: '0.5rem' }}>
              <div><strong>Nome:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}</div>
              <div><strong>NIF:</strong> {utente?.nif || '—'}</div>
              <div><strong>Sexo:</strong> {utente?.sexo || '—'}</div>
              <div><strong>Data nascimento:</strong> {utente?.data_nascimento || '—'}</div>
              <div><strong>Telefone:</strong> {utente?.telefone || '—'}</div>
              <div><strong>Email:</strong> {utente?.email || '—'}</div>
              <div><strong>Morada:</strong> {utente?.morada || '—'}</div>
            </div>
          </div>

          <div className="admin-table-card admin-table-card--bottom" style={{ marginTop: '1.25rem' }}>
            <div className="admin-table-card__header">
              <h3>Alertas</h3>
            </div>
            <div style={{ padding: '1rem' }}>
              {alertas.length === 0 ? (
                <div>Sem alertas registados.</div>
              ) : (
                <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                  {alertas.map((a, i) => (
                    <li key={`${a.descricao || a.mensagem}-${i}`}>
                      {a.descricao || a.mensagem || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );

  const renderPrescricao = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Prescrição</h2>
        <p>Registo de medicação e orientações clínicas.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Seleciona primeiro um episódio.</div>
        </div>
      ) : (
        <form className="admin-form" onSubmit={guardarPrescricao}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>Utente</label>
              <input value={episodioSelecionado.nome_utente || '—'} readOnly />
            </div>
            <div className="admin-form__group">
              <label>Medicamento</label>
              <input
                name="medicamento"
                value={prescricaoForm.medicamento}
                onChange={(e) => setPrescricaoForm((prev) => ({ ...prev, medicamento: e.target.value }))}
                required
              />
            </div>
            <div className="admin-form__group">
              <label>Posologia</label>
              <input
                name="posologia"
                value={prescricaoForm.posologia}
                onChange={(e) => setPrescricaoForm((prev) => ({ ...prev, posologia: e.target.value }))}
                required
              />
            </div>
            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>Observações</label>
              <textarea
                rows="5"
                value={prescricaoForm.observacoes}
                onChange={(e) => setPrescricaoForm((prev) => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="submit" className="admin-form__submit">
              Guardar prescrição
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setMainMenu('detalhe')}
            >
              {textos.geral.cancelar}
            </button>
          </div>
        </form>
      )}
    </section>
  );

  const renderDecisao = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>Alta ou internamento</h2>
        <p>Decisão clínica final do episódio.</p>
      </div>

      {!episodioSelecionado ? (
        <div className="admin-table-card admin-table-card--full">
          <div style={{ padding: '1rem' }}>Seleciona primeiro um episódio.</div>
        </div>
      ) : (
        <form className="admin-form" onSubmit={guardarDecisao}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>Utente</label>
              <input value={episodioSelecionado.nome_utente || '—'} readOnly />
            </div>

            <div className="admin-form__group">
              <label>Decisão</label>
              <select
                value={decisaoForm.tipo}
                onChange={(e) => setDecisaoForm((prev) => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="alta">Alta</option>
                <option value="internamento">Internamento</option>
              </select>
            </div>

            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>Motivo</label>
              <input
                value={decisaoForm.motivo}
                onChange={(e) => setDecisaoForm((prev) => ({ ...prev, motivo: e.target.value }))}
                required
              />
            </div>

            <div className="admin-form__group" style={{ gridColumn: '1 / -1' }}>
              <label>Observações</label>
              <textarea
                rows="5"
                value={decisaoForm.observacoes}
                onChange={(e) => setDecisaoForm((prev) => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-actions-row">
            <button type="submit" className="admin-form__submit">
              Guardar decisão
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setMainMenu('detalhe')}
            >
              {textos.geral.cancelar}
            </button>
          </div>
        </form>
      )}
    </section>
  );

  const renderCenter = () => {
    if (mainMenu === 'visao') return renderVisaoGeral();
    if (mainMenu === 'episodios') return renderListaEpisodios();
    if (mainMenu === 'detalhe') return renderDetalhe();
    if (mainMenu === 'prescricao') return renderPrescricao();
    if (mainMenu === 'decisao') return renderDecisao();
    return null;
  };

  return (
    // DoctorDashboard.jsx
    <div className="admin-page-wrapper doctor-dashboard">
      <main className={`admin-layout ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
        <aside className="admin-sidebar" aria-label="Navegação lateral do Médico">
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
              className={`admin-sidebar__link ${mainMenu === 'visao' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('visao')}
            >
              <span className="link-text">Visão geral</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'episodios' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('episodios')}
            >
              <span className="link-text">Episódios</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'detalhe' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('detalhe')}
            >
              <span className="link-text">Detalhe clínico</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'prescricao' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('prescricao')}
            >
              <span className="link-text">Prescrição</span>
            </button>
            <button
              type="button"
              className={`admin-sidebar__link ${mainMenu === 'decisao' ? 'is-active' : ''}`}
              onClick={() => setMainMenu('decisao')}
            >
              <span className="link-text">Alta / Internamento</span>
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