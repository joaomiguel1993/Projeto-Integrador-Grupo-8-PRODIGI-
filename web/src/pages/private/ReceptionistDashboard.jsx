import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export default function ReceptionistDashboard() {
  const navigate = useNavigate();

  const [mainMenu, setMainMenu] = useState('pesquisar');
  const [subView, setSubView] = useState('lista');

  const [utentes, setUtentes] = useState([]);
  const [episodios, setEpisodios] = useState([]);
  const [hospitalAtivo, setHospitalAtivo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [filtro, setFiltro] = useState('');
  const [utenteSelecionado, setUtenteSelecionado] = useState(null);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);

  const [novoUtente, setNovoUtente] = useState({
    nome: '',
    nif: '',
    data_nascimento: '',
    sexo: 'M',
    telefone: '',
    email: '',
    morada: '',
  });

  const [novoEpisodio, setNovoEpisodio] = useState({
    motivo: '',
    observacao: '',
  });

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = async () => {
    setLoading(true);
    setErro('');
    try {
      const [uRes, eRes, hRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/`),
        fetch(`${API_URL}/api/episodios/recents`),
        fetch(`${API_URL}/api/hospital/ativo`),
      ]);

      const uData = await uRes.json();
      const eData = await eRes.json();
      const hData = await hRes.json();

      setUtentes(Array.isArray(uData) ? uData : []);
      setEpisodios(Array.isArray(eData) ? eData : []);
      setHospitalAtivo(hData || null);
    } catch (err) {
      setErro(err.message || 'Erro ao carregar dados.');
      setUtentes([]);
      setEpisodios([]);
    } finally {
      setLoading(false);
    }
  };

  const utentesFiltrados = useMemo(() => {
    return utentes.filter((u) => {
      const texto = [u.nome, u.nif, u.numero_utente, u.telefone].join(' ');
      return normalizar(texto).includes(normalizar(filtro));
    });
  }, [utentes, filtro]);

  const selecionarUtente = (u) => {
    setUtenteSelecionado(u);
    setSubView('ficha');
    setMensagem('');
    setErro('');
  };

  const handleNovoUtenteChange = (e) => {
    const { name, value } = e.target;
    setNovoUtente((prev) => ({ ...prev, [name]: value }));
  };

  const handleNovoEpisodioChange = (e) => {
    const { name, value } = e.target;
    setNovoEpisodio((prev) => ({ ...prev, [name]: value }));
  };

  const criarUtente = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/utentes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUtente),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao criar utente.');
      setMensagem('Utente criado com sucesso.');
      setNovoUtente({ nome: '', nif: '', data_nascimento: '', sexo: 'M', telefone: '', email: '', morada: '' });
      await carregarTudo();
      setSubView('lista');
    } catch (err) {
      setErro(err.message);
    }
  };

  const darEntrada = async () => {
    if (!utenteSelecionado) return;
    setMensagem('');
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/epurgencia/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente_id: utenteSelecionado.id_utente, hospital_id: hospitalAtivo?.id_hosp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao dar entrada.');
      setMensagem('Entrada registada com sucesso.');
      await carregarTudo();
    } catch (err) {
      setErro(err.message);
    }
  };

  const abrirEpisodio = async () => {
    if (!utenteSelecionado) return;
    setMensagem('');
    setErro('');
    try {
      const res = await fetch(`${API_URL}/api/epurgencia/abrir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utente_id: utenteSelecionado.id_utente }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao abrir episódio.');
      setMensagem('Episódio aberto com sucesso.');
      await carregarTudo();
    } catch (err) {
      setErro(err.message);
    }
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <div>
            <strong>Rececionista</strong>
            <span>{hospitalAtivo?.nome || 'Hospital ativo'}</span>
          </div>
        </div>
        <nav className="admin-sidebar__nav">
          <button type="button" className={`admin-sidebar__link ${mainMenu==='pesquisar'?'is-active':''}`} onClick={() => { setMainMenu('pesquisar'); setSubView('lista'); }}>Pesquisar utente</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='criar'?'is-active':''}`} onClick={() => { setMainMenu('criar'); setSubView('novo'); }}>Criar utente</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='ficha'?'is-active':''}`} onClick={() => setMainMenu('ficha')}>Ficha base</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='entrada'?'is-active':''}`} onClick={() => setMainMenu('entrada')}>Dar entrada</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='episodio'?'is-active':''}`} onClick={() => setMainMenu('episodio')}>Abrir episódio</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='recentes'?'is-active':''}`} onClick={() => setMainMenu('recentes')}>Entradas recentes</button>
        </nav>
        <div className="admin-sidebar__footer">
          <button type="button" className="admin-logout-button" onClick={() => navigate('/')}>Sair</button>
        </div>
      </aside>
      <section className="admin-content">
        <div className="admin-content__top">
          <h1>Dashboard Rececionista</h1>
          <p>Fluxo rápido de registo, admissão e abertura de episódio.</p>
        </div>
        <div className="admin-content__body">
          {mainMenu==='pesquisar' && (
            <section className="admin-panel-section">
              <div className="admin-panel-section__header"><h2>Pesquisar utente</h2></div>
              <div className="admin-toolbar admin-toolbar--left"><button className="admin-primary-big-button" onClick={() => setSubView('novo')}>Novo utente</button></div>
              <div className="admin-form__group"><label>Pesquisa rápida</label><input value={filtro} onChange={(e)=>setFiltro(e.target.value)} placeholder="Nome, NIF, número de utente..." /></div>
              <div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Utentes</h3><span>{utentesFiltrados.length}</span></div><div className="admin-table-scroll admin-table-scroll--employees"><table className="admin-table"><thead><tr><th>Nome</th><th>NIF</th><th>Sexo</th><th>Ações</th></tr></thead><tbody>{utentesFiltrados.map((u)=><tr key={u.id_utente}><td>{u.nome}</td><td>{u.nif}</td><td>{u.sexo}</td><td><button type="button" className="admin-secondary-button" onClick={()=>selecionarUtente(u)}>Ver ficha</button></td></tr>)}</tbody></table></div></div>
            </section>
          )}
          {mainMenu==='criar' && (
            <section className="admin-panel-section">
              <div className="admin-panel-section__header"><h2>Novo utente</h2></div>
              <form className="admin-form" onSubmit={criarUtente}><div className="admin-form__grid"><div className="admin-form__group"><label>Nome</label><input name="nome" value={novoUtente.nome} onChange={handleNovoUtenteChange} required /></div><div className="admin-form__group"><label>NIF</label><input name="nif" value={novoUtente.nif} onChange={handleNovoUtenteChange} /></div><div className="admin-form__group"><label>Data nascimento</label><input name="data_nascimento" type="date" value={novoUtente.data_nascimento} onChange={handleNovoUtenteChange} /></div><div className="admin-form__group"><label>Sexo</label><select name="sexo" value={novoUtente.sexo} onChange={handleNovoUtenteChange}><option value="M">M</option><option value="F">F</option></select></div><div className="admin-form__group"><label>Telefone</label><input name="telefone" value={novoUtente.telefone} onChange={handleNovoUtenteChange} /></div><div className="admin-form__group"><label>Email</label><input name="email" value={novoUtente.email} onChange={handleNovoUtenteChange} /></div><div className="admin-form__group" style={{gridColumn:'1 / -1'}}><label>Morada</label><input name="morada" value={novoUtente.morada} onChange={handleNovoUtenteChange} /></div></div><div className="admin-actions-row"><button className="admin-form__submit" type="submit">Criar utente</button><button type="button" className="admin-secondary-button" onClick={() => setMainMenu('pesquisar')}>Cancelar</button></div></form>
            </section>
          )}
          {mainMenu==='ficha' && (
            <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Ficha base do utente</h2></div>{utenteSelecionado ? <div className="admin-table-card"><p><strong>Nome:</strong> {utenteSelecionado.nome}</p><p><strong>NIF:</strong> {utenteSelecionado.nif || '—'}</p><p><strong>Telefone:</strong> {utenteSelecionado.telefone || '—'}</p><p><strong>Email:</strong> {utenteSelecionado.email || '—'}</p><p><strong>Morada:</strong> {utenteSelecionado.morada || '—'}</p></div> : <p>Seleciona um utente na pesquisa.</p>}</section>
          )}
          {mainMenu==='entrada' && (
            <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Dar entrada no hospital</h2></div><p>{utenteSelecionado ? `Utente selecionado: ${utenteSelecionado.nome}` : 'Seleciona um utente primeiro.'}</p><div className="admin-actions-row"><button className="admin-form__submit" onClick={darEntrada} disabled={!utenteSelecionado}>Dar entrada</button></div></section>
          )}
          {mainMenu==='episodio' && (
            <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Abrir episódio de urgência</h2></div><p>{utenteSelecionado ? `Utente selecionado: ${utenteSelecionado.nome}` : 'Seleciona um utente primeiro.'}</p><div className="admin-actions-row"><button className="admin-form__submit" onClick={abrirEpisodio} disabled={!utenteSelecionado}>Abrir episódio</button></div></section>
          )}
          {mainMenu==='recentes' && (
            <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Episódios recentes</h2></div><div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Hospital ativo</h3></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Utente</th><th>Entrada</th><th>Estado</th></tr></thead><tbody>{episodios.map((ep)=><tr key={ep.id_epurgencia || ep.id}><td>{ep.nome_utente || ep.utente_nome || '—'}</td><td>{ep.datahoraentr || ep.datahora || '—'}</td><td>{ep.estado || 'Aberto'}</td></tr>)}</tbody></table></div></div></section>
          )}
          {erro && <p className="admin-form__error">{erro}</p>}
          {mensagem && <p className="admin-form__success">{mensagem}</p>}
        </div>
      </section>
    </main>
  );
}
