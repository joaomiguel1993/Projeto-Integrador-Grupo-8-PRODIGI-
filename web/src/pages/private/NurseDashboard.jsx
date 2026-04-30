import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const normalizar = (texto) => String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function NurseDashboard() {
  const navigate = useNavigate();
  const [mainMenu, setMainMenu] = useState('fila');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [triagem, setTriagem] = useState({ tensao: '', pulso: '', temperatura: '', saturacao: '', dor: '', sintomas: '', cor_sugerida: '', observacoes: '' });

  useEffect(() => { carregarFila(); }, []);

  const carregarFila = async () => {
    setLoading(true); setErro('');
    try {
      const res = await fetch(`${API_URL}/api/epurgencia/abertos-sem-triagem`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao carregar fila.');
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) { setErro(e.message); setEpisodios([]); } finally { setLoading(false); }
  };

  const episodiosFiltrados = useMemo(() => episodios.filter((ep) => normalizar([ep.nome_utente, ep.nif_utente, ep.id_epurgencia].join(' ')).includes(normalizar(filtro))), [episodios, filtro]);

  const abrirEpisodio = async (ep) => {
    setEpisodioSelecionado(ep); setMainMenu('triagem'); setErro(''); setMensagem('');
    try {
      const [uRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/${ep.id_utente}`),
        fetch(`${API_URL}/api/medicacao-ativa/${ep.id_utente}`),
      ]);
      const uData = await uRes.json();
      const mData = await mRes.json();
      setUtente(uData || null);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
    } catch (e) { setErro(e.message); }
  };

  const handleTriagemChange = (e) => { const { name, value } = e.target; setTriagem((prev) => ({ ...prev, [name]: value })); };

  const pedirSugestaoCor = async () => {
    try {
      setMensagem(''); setErro('');
      const res = await fetch(`${API_URL}/api/ia/triagem/sugerir-cor`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ utente, triagem }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro a pedir sugestão.');
      setTriagem((prev) => ({ ...prev, cor_sugerida: data.cor_sugerida || data.cor || prev.cor_sugerida }));
    } catch (e) { setErro(e.message); }
  };

  const gravarTriagem = async (e) => {
    e.preventDefault();
    try {
      setMensagem(''); setErro('');
      const res = await fetch(`${API_URL}/api/triagem/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_epurgencia: episodioSelecionado?.id_epurgencia, ...triagem }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao gravar triagem.');
      setMensagem('Triagem gravada com sucesso.');
      await carregarFila();
      setMainMenu('fila');
    } catch (e) { setErro(e.message); }
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><div><strong>Enfermeiro</strong><span>Triagem e fila</span></div></div>
        <nav className="admin-sidebar__nav">
          <button type="button" className={`admin-sidebar__link ${mainMenu==='fila'?'is-active':''}`} onClick={() => setMainMenu('fila')}>Fila sem triagem</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='triagem'?'is-active':''}`} onClick={() => setMainMenu('triagem')}>Abrir triagem</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='ficha'?'is-active':''}`} onClick={() => setMainMenu('ficha')}>Ficha do utente</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='medicacao'?'is-active':''}`} onClick={() => setMainMenu('medicacao')}>Medicação ativa</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='registo'?'is-active':''}`} onClick={() => setMainMenu('registo')}>Registar triagem</button>
        </nav>
        <div className="admin-sidebar__footer"><button type="button" className="admin-logout-button" onClick={() => navigate('/')}>Sair</button></div>
      </aside>
      <section className="admin-content">
        <div className="admin-content__top"><h1>Dashboard Enfermeiro</h1><p>Fila de episódios, contexto clínico e triagem assistida.</p></div>
        <div className="admin-content__body">
          {mainMenu==='fila' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Fila de episódios abertos sem triagem</h2></div><div className="admin-form__group"><label>Pesquisa rápida</label><input value={filtro} onChange={(e)=>setFiltro(e.target.value)} placeholder="Utente, NIF, episódio..." /></div><div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Episódios</h3><span>{episodiosFiltrados.length}</span></div><div className="admin-table-scroll admin-table-scroll--employees"><table className="admin-table"><thead><tr><th>Episódio</th><th>Utente</th><th>Entrada</th><th>Ações</th></tr></thead><tbody>{episodiosFiltrados.map((ep)=><tr key={ep.id_epurgencia || ep.id}><td>{ep.id_epurgencia || ep.id}</td><td>{ep.nome_utente || '—'}</td><td>{ep.datahoraentr || '—'}</td><td><button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>Abrir</button></td></tr>)}</tbody></table></div></div></section>}
          {mainMenu==='triagem' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Abrir episódio para triagem</h2></div>{episodioSelecionado ? <><div className="admin-table-card"><p><strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}</p><p><strong>Entrada:</strong> {episodioSelecionado.datahoraentr || '—'}</p></div><div className="admin-actions-row"><button className="admin-form__submit" onClick={() => setMainMenu('ficha')}>Ver ficha</button><button className="admin-secondary-button" onClick={() => setMainMenu('medicacao')}>Ver medicação</button></div></> : <p>Seleciona um episódio na fila.</p>}</section>}
          {mainMenu==='ficha' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Ficha do utente</h2></div>{utente ? <div className="admin-table-card"><p><strong>Nome:</strong> {utente.nome || '—'}</p><p><strong>NIF:</strong> {utente.nif || '—'}</p><p><strong>Data nascimento:</strong> {utente.data_nascimento || '—'}</p><p><strong>Alergias:</strong> {utente.alergias || '—'}</p></div> : <p>Abre um episódio para consultar a ficha.</p>}</section>}
          {mainMenu==='medicacao' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Medicação ativa</h2></div><div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Lista</h3><span>{medicacaoAtiva.length}</span></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Nome</th><th>Posologia</th><th>Início</th><th>Fim</th></tr></thead><tbody>{medicacaoAtiva.map((m, i)=><tr key={i}><td>{m.nome || '—'}</td><td>{m.dosagem || '—'}</td><td>{m.datainicio || '—'}</td><td>{m.datafim || '—'}</td></tr>)}</tbody></table></div></div></section>}
          {mainMenu==='registo' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Registar triagem</h2></div><form className="admin-form" onSubmit={gravarTriagem}><div className="admin-form__grid"><div className="admin-form__group"><label>Tensão</label><input name="tensao" value={triagem.tensao} onChange={handleTriagemChange} /></div><div className="admin-form__group"><label>Pulso</label><input name="pulso" value={triagem.pulso} onChange={handleTriagemChange} /></div><div className="admin-form__group"><label>Temperatura</label><input name="temperatura" value={triagem.temperatura} onChange={handleTriagemChange} /></div><div className="admin-form__group"><label>Saturação</label><input name="saturacao" value={triagem.saturacao} onChange={handleTriagemChange} /></div><div className="admin-form__group"><label>Dor</label><input name="dor" value={triagem.dor} onChange={handleTriagemChange} /></div><div className="admin-form__group" style={{gridColumn:'1 / -1'}}><label>Sintomas</label><textarea name="sintomas" value={triagem.sintomas} onChange={handleTriagemChange} /></div><div className="admin-form__group"><label>Cor sugerida</label><input name="cor_sugerida" value={triagem.cor_sugerida} onChange={handleTriagemChange} /></div></div><div className="admin-actions-row"><button type="button" className="admin-secondary-button" onClick={pedirSugestaoCor}>Pedir sugestão à IA</button><button type="submit" className="admin-form__submit">Gravar triagem</button></div></form></section>}
          {erro && <p className="admin-form__error">{erro}</p>}
          {mensagem && <p className="admin-form__success">{mensagem}</p>}
        </div>
      </section>
    </main>
  );
}
