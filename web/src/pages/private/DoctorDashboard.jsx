import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const normalizar = (texto) => String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [mainMenu, setMainMenu] = useState('kpis');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [atos, setAtos] = useState([]);
  const [prescricao, setPrescricao] = useState({ medicamento: '', dosagem: '', duracao: '', via: '' });
  const [alta, setAlta] = useState({ destino: 'alta', observacoes: '', internamento_destino: '' });
  const [filtro, setFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => { carregarEpisodios(); }, []);

  const carregarEpisodios = async () => {
    try {
      const res = await fetch(`${API_URL}/api/episodios/triados`);
      const data = await res.json();
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) { setErro(e.message); setEpisodios([]); }
  };

  const episodiosFiltrados = useMemo(() => episodios.filter((ep) => normalizar([ep.nome_utente, ep.id_epurgencia, ep.cor_triagem, ep.tempo_espera].join(' ')).includes(normalizar(filtro))), [episodios, filtro]);

  const abrirEpisodio = async (ep) => {
    setEpisodioSelecionado(ep); setMainMenu('detalhe'); setErro(''); setMensagem('');
    try {
      const [uRes, aRes, mRes] = await Promise.all([
        fetch(`${API_URL}/api/utentes/${ep.id_utente}`),
        fetch(`${API_URL}/api/alertas/${ep.id_utente}`),
        fetch(`${API_URL}/api/medicacao-ativa/${ep.id_utente}`),
      ]);
      const uData = await uRes.json();
      const aData = await aRes.json();
      const mData = await mRes.json();
      setUtente(uData || null);
      setAlertas(Array.isArray(aData) ? aData : []);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
      setAtos([]);
    } catch (e) { setErro(e.message); }
  };

  const handlePrescricaoChange = (e) => { const { name, value } = e.target; setPrescricao((prev) => ({ ...prev, [name]: value })); };
  const handleAltaChange = (e) => { const { name, value } = e.target; setAlta((prev) => ({ ...prev, [name]: value })); };

  const adicionarPrescricao = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/prescricao/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_utente: utente?.id_utente, ...prescricao }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao criar prescrição.');
      setMensagem('Prescrição registada com sucesso.');
      setPrescricao({ medicamento: '', dosagem: '', duracao: '', via: '' });
      await carregarEpisodios();
    } catch (e) { setErro(e.message); }
  };

  const registarAlta = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/episodios/${episodioSelecionado?.id_epurgencia}/alta`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(alta) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao registar alta.');
      setMensagem('Alta / internamento registado com sucesso.');
      await carregarEpisodios();
    } catch (e) { setErro(e.message); }
  };

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand"><div><strong>Médico</strong><span>Prioridade clínica</span></div></div>
        <nav className="admin-sidebar__nav">
          <button type="button" className={`admin-sidebar__link ${mainMenu==='kpis'?'is-active':''}`} onClick={() => setMainMenu('kpis')}>KPIs</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='medias'?'is-active':''}`} onClick={() => setMainMenu('medias')}>Tempos médios</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='fila'?'is-active':''}`} onClick={() => setMainMenu('fila')}>Fila por prioridade</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='episodios'?'is-active':''}`} onClick={() => setMainMenu('episodios')}>Episódios triados</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='detalhe'?'is-active':''}`} onClick={() => setMainMenu('detalhe')}>Detalhe completo</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='prescricao'?'is-active':''}`} onClick={() => setMainMenu('prescricao')}>Prescrição</button>
          <button type="button" className={`admin-sidebar__link ${mainMenu==='alta'?'is-active':''}`} onClick={() => setMainMenu('alta')}>Alta / internamento</button>
        </nav>
        <div className="admin-sidebar__footer"><button type="button" className="admin-logout-button" onClick={() => navigate('/')}>Sair</button></div>
      </aside>
      <section className="admin-content">
        <div className="admin-content__top"><h1>Dashboard Médico</h1><p>Prioridade, detalhe clínico completo, prescrição e decisão final.</p></div>
        <div className="admin-content__body">
          {mainMenu==='kpis' && <section className="admin-panel-section"><div className="admin-report-grid"><div className="admin-report-card"><h3>Episódios triados</h3><strong>{episodios.length}</strong></div><div className="admin-report-card"><h3>Em espera</h3><strong>{episodios.filter(ep => !ep.atendido).length}</strong></div><div className="admin-report-card"><h3>Altas hoje</h3><strong>{episodios.filter(ep => ep.alta).length}</strong></div><div className="admin-report-card"><h3>Internamentos</h3><strong>{episodios.filter(ep => ep.internamento).length}</strong></div></div></section>}
          {mainMenu==='medias' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Tempos médios por cor</h2></div><div className="admin-table-card admin-table-card--full"><table className="admin-table"><thead><tr><th>Cor</th><th>Tempo médio</th></tr></thead><tbody><tr><td>Vermelho</td><td>—</td></tr><tr><td>Amarelo</td><td>—</td></tr><tr><td>Verde</td><td>—</td></tr></tbody></table></div></section>}
          {mainMenu==='fila' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Fila resumida por prioridade</h2></div><div className="admin-form__group"><label>Pesquisar</label><input value={filtro} onChange={(e)=>setFiltro(e.target.value)} placeholder="Utente, cor, episódio..." /></div><div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Episódios</h3><span>{episodiosFiltrados.length}</span></div><div className="admin-table-scroll admin-table-scroll--employees"><table className="admin-table"><thead><tr><th>Utente</th><th>Cor</th><th>Espera</th><th>Ação</th></tr></thead><tbody>{episodiosFiltrados.map((ep)=><tr key={ep.id_epurgencia || ep.id}><td>{ep.nome_utente || '—'}</td><td>{ep.cor_triagem || '—'}</td><td>{ep.tempo_espera || '—'}</td><td><button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>Atender</button></td></tr>)}</tbody></table></div></div></section>}
          {mainMenu==='episodios' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Episódios triados</h2></div><div className="admin-table-card admin-table-card--full"><div className="admin-table-card__header"><h3>Lista completa</h3><span>{episodios.length}</span></div><div className="admin-table-scroll admin-table-scroll--employees"><table className="admin-table"><thead><tr><th>Episódio</th><th>Utente</th><th>Gravidade</th><th>Espera</th><th>Ações</th></tr></thead><tbody>{episodios.map((ep)=><tr key={ep.id_epurgencia || ep.id}><td>{ep.id_epurgencia || ep.id}</td><td>{ep.nome_utente || '—'}</td><td>{ep.cor_triagem || '—'}</td><td>{ep.tempo_espera || '—'}</td><td><button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep)}>Abrir detalhe</button></td></tr>)}</tbody></table></div></div></section>}
          {mainMenu==='detalhe' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Detalhe completo do episódio</h2></div>{episodioSelecionado ? <><div className="admin-table-card"><p><strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'}</p><p><strong>Cor:</strong> {episodioSelecionado.cor_triagem || '—'}</p><p><strong>Espera:</strong> {episodioSelecionado.tempo_espera || '—'}</p></div><div className="admin-table-card" style={{marginTop:'1rem'}}><h3>Alertas</h3>{alertas.map((a, i) => <p key={i}>{a.descricao || a.mensagem || '—'}</p>)}</div></> : <p>Seleciona um episódio triado.</p>}</section>}
          {mainMenu==='prescricao' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Prescrição</h2></div><form className="admin-form" onSubmit={adicionarPrescricao}><div className="admin-form__grid"><div className="admin-form__group"><label>Medicamento</label><input name="medicamento" value={prescricao.medicamento} onChange={handlePrescricaoChange} /></div><div className="admin-form__group"><label>Dosagem</label><input name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} /></div><div className="admin-form__group"><label>Duração</label><input name="duracao" value={prescricao.duracao} onChange={handlePrescricaoChange} /></div><div className="admin-form__group"><label>Via</label><input name="via" value={prescricao.via} onChange={handlePrescricaoChange} /></div></div><div className="admin-actions-row"><button className="admin-form__submit" type="submit">Fazer prescrição</button></div></form></section>}
          {mainMenu==='alta' && <section className="admin-panel-section"><div className="admin-panel-section__header"><h2>Alta ou internamento</h2></div><form className="admin-form" onSubmit={registarAlta}><div className="admin-form__grid"><div className="admin-form__group"><label>Destino</label><select name="destino" value={alta.destino} onChange={handleAltaChange}><option value="alta">Alta</option><option value="internamento">Internamento</option></select></div><div className="admin-form__group"><label>Destino internamento</label><input name="internamento_destino" value={alta.internamento_destino} onChange={handleAltaChange} /></div><div className="admin-form__group" style={{gridColumn:'1 / -1'}}><label>Observações</label><textarea name="observacoes" value={alta.observacoes} onChange={handleAltaChange} /></div></div><div className="admin-actions-row"><button className="admin-form__submit" type="submit">Confirmar</button></div></form></section>}
          {erro && <p className="admin-form__error">{erro}</p>}
          {mensagem && <p className="admin-form__success">{mensagem}</p>}
        </div>
      </section>
    </main>
  );
}
