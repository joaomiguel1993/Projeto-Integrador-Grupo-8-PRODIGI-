import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../imagens/Logo.png';
import '../../styles/main.css';
import FooterLayout from '../../components/layout/FooterLayout';
import { useLanguage } from '../../contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const normalizar = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const IconMenu = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 3 2 4-5" />
  </svg>
);

const IconQueue = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="4" rx="1" />
    <rect x="4" y="10" width="16" height="4" rx="1" />
    <rect x="4" y="16" width="16" height="4" rx="1" />
  </svg>
);

const IconClipboard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
  </svg>
);

const IconExit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { textos, idioma, mudarIdioma } = useLanguage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mainMenu, setMainMenu] = useState('informacao_geral');
  const [episodios, setEpisodios] = useState([]);
  const [episodioSelecionado, setEpisodioSelecionado] = useState(null);
  const [utente, setUtente] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [medicacaoAtiva, setMedicacaoAtiva] = useState([]);
  const [antecedentes, setAntecedentes] = useState(null);
  const [mostrarAntecedentes, setMostrarAntecedentes] = useState(false);
  
  const [dadosTriagem, setDadosTriagem] = useState(null);
  const [modoEdicaoTriagem, setModoEdicaoTriagem] = useState(false);
  
  // Estado do Formulário atualizado com os novos campos biométricos mapeados
  const [formTriagem, setFormTriagem] = useState({
    cor_triagem: '',
    Temperatura: '',
    FreqCard: '',
    FreqResp: '',
    SPO2: '',
    Sistolica: '',
    Diastolica: '',
    Nivel_dor: '',
    Consciencia: 'Acordado'
  });
  
  const [temposMediosHospital, setTemposMediosHospital] = useState({
    vermelho: '—',
    laranja: '—',
    amarelo: '—',
    verde: '—',
    azul: '—'
  });
  
  const [filtro, setFiltro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  
  const [prescricao, setPrescricao] = useState({
    medicamento: '',
    dosagem: '',
    duracao: '',
    via: '',
  });
  
  const [alta, setAlta] = useState({
    destino: 'alta',
    observacoes: '',
    internamento_destino: '',
  });

  const utilizadorLogado = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const nomeUtilizador = utilizadorLogado?.nome || utilizadorLogado?.name || utilizadorLogado?.username || 'Utilizador';
  const nomeHospital = utilizadorLogado?.nome_hospital || utilizadorLogado?.hospital || 'Hospital Geral';
  const iniciaisUtilizador = nomeUtilizador.slice(0, 2).toUpperCase();

  const menuGroups = useMemo(
    () => [
      {
        title: textos?.doctor?.menuGrupoGeral || 'Visão geral',
        items: [
          { key: 'informacao_geral', icon: <IconChart />, label: textos?.doctor?.menuInfoGeral || 'Informação Geral' },
        ],
      },
      {
        title: textos?.doctor?.menuGrupoTriagem || 'Triagem',
        items: [
          { key: 'fila', icon: <IconQueue />, label: textos?.doctor?.menuFila || 'Fila por prioridade' },
          { key: 'atendimento', icon: <IconClipboard />, label: textos?.doctor?.menuAtendimento || 'Atendimento' },
        ],
      },
    ],
    [textos]
  );

  useEffect(() => {
    carregarEpisodios();
    carregarTemposMediosHospital();
  }, [utilizadorLogado]);

  const extrairMensagemErro = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.detail === 'object') return JSON.stringify(data.detail);
    if (data.message) return data.message;
    return fallback;
  };

  const abrirPerfilUtilizador = () => {
    const userId = utilizadorLogado?.id_utilizador || utilizadorLogado?.idutilizador || utilizadorLogado?.id_user || utilizadorLogado?.id;
    if (userId) navigate(`/perfil/${userId}`);
    else navigate('/perfil');
  };

  const carregarEpisodios = async () => {
    try {
      setErro('');
      const res = await fetch(`${API_URL}/api/v1/triagens`);
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao carregar episódios.'));
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(e.message);
      setEpisodios([]);
    }
  };

  const carregarTemposMediosHospital = async () => {
    const hospitalId = utilizadorLogado?.id_hospital || utilizadorLogado?.hospital_id || utilizadorLogado?.idhospital;
    if (!hospitalId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/hospitais/${hospitalId}/tempos-medios`);
      const data = await res.json();
      
      if (res.ok && data) {
        setTemposMediosHospital({
          vermelho: data.vermelho || data.Vermelho || '—',
          laranja: data.laranja || data.Laranja || '—',
          amarelo: data.amarelo || data.Amarelo || '—',
          verde: data.verde || data.Verde || '—',
          azul: data.azul || data.Azul || '—'
        });
      }
    } catch (e) {
      console.error('Erro ao carregar tempos médios do SQL:', e);
    }
  };

  const episodiosFiltrados = useMemo(() => {
    return episodios.filter((ep) =>
      normalizar([ep.nome_utente, ep.id_epurgencia || ep.id, ep.cor_triagem, ep.tempo_espera].join(' ')).includes(
        normalizar(filtro)
      )
    );
  }, [episodios, filtro]);

  const abrirEpisodio = async (ep, focarNaAlta = false) => {
    setEpisodioSelecionado(ep);
    setMainMenu('atendimento');
    setAntecedentes(null);
    setMostrarAntecedentes(false);
    setModoEdicaoTriagem(false);
    setErro('');
    setMensagem('');

    const episodioId = ep.id_epurgencia || ep.id || ep.cod_ep_urgenc;
    const utenteId = ep.id_utente || ep.idutente || ep.num_utent;

    try {
      const [uRes, aRes, mRes, tRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/utentes/${utenteId}`),
        fetch(`${API_URL}/api/v1/alertas/${utenteId}`),
        fetch(`${API_URL}/api/v1/medicacaoativa/${utenteId}`),
        fetch(`${API_URL}/api/v1/triagens/${episodioId}`)
      ]);

      const uData = await uRes.json();
      const aData = await aRes.json();
      const mData = await mRes.json();
      const tData = await tRes.json();

      if (!uRes.ok) throw new Error(extrairMensagemErro(uData, 'Erro ao carregar dados do utente.'));
      if (!aRes.ok) throw new Error(extrairMensagemErro(aData, 'Erro ao carregar alertas do utente.'));
      if (!mRes.ok) throw new Error(extrairMensagemErro(mData, 'Erro ao carregar medicação do utente.'));
      if (!tRes.ok) throw new Error(extrairMensagemErro(tData, 'Erro ao carregar dados da triagem.'));

      setUtente(uData || null);
      setAlertas(Array.isArray(aData) ? aData : []);
      setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
      
      setDadosTriagem(tData);
      setFormTriagem({
        cor_triagem: tData?.cor_triagem || ep.cor_triagem || '',
        Temperatura: tData?.Temperatura || '',
        FreqCard: tData?.FreqCard || '',
        FreqResp: tData?.FreqResp || '',
        SPO2: tData?.SPO2 || '',
        Sistolica: tData?.Sistolica || '',
        Diastolica: tData?.Diastolica || '',
        Nivel_dor: tData?.Nivel_dor || tData?.['Nivel de dor'] || '',
        Consciencia: tData?.Consciencia || 'Acordado'
      });

      if (focarNaAlta) {
        setTimeout(() => {
          document.getElementById('seccao-alta-form')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } catch (e) {
      setErro(e.message);
    }
  };

  const carregarAntecedentes = async () => {
    const utenteId = utente?.id_utente || utente?.idutente;
    if (!utenteId) return;

    try {
      setErro('');
      const res = await fetch(`${API_URL}/api/v1/antecedentes/${utenteId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao carregar antecedentes.'));
      setAntecedentes(data);
      setMostrarAntecedentes(true);
    } catch (e) {
      setErro(e.message);
    }
  };

  const atualizarDadosTriagem = async (e) => {
    e.preventDefault();
    const episodioId = episodioSelecionado?.id_epurgencia || episodioSelecionado?.id || episodioSelecionado?.cod_ep_urgenc;
    try {
      setMensagem('');
      setErro('');
      const res = await fetch(`${API_URL}/api/v1/triagens/${episodioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTriagem)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao atualizar dados da triagem.'));
      
      setDadosTriagem(data);
      setModoEdicaoTriagem(false);
      setMensagem('Dados da triagem atualizados no SQL com sucesso.');
      await carregarEpisodios();
    } catch (e) {
      setErro(e.message);
    }
  };

  const handlePrescricaoChange = (e) => {
    const { name, value } = e.target;
    setPrescricao((prev) => ({ ...prev, [name]: value }));
  };

  const handleAltaChange = (e) => {
    const { name, value } = e.target;
    setAlta((prev) => ({ ...prev, [name]: value }));
  };

  const adicionarPrescricao = async (e) => {
    e.preventDefault();
    try {
      setMensagem('');
      setErro('');

      const utenteId = utente?.id_utente || utente?.idutente;
      const res = await fetch(`${API_URL}/api/v1/prescricoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_utente: utenteId,
          ...prescricao,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao criar prescrição.'));

      setMensagem('Prescrição registada com sucesso.');
      setPrescricao({ medicamento: '', dosagem: '', duracao: '', via: '' });
      
      const mRes = await fetch(`${API_URL}/api/v1/medicacaoativa/${utenteId}`);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMedicacaoAtiva(Array.isArray(mData) ? mData : []);
      }
    } catch (e) {
      setErro(e.message);
    }
  };

  const registarAlta = async (e) => {
    e.preventDefault();
    try {
      setMensagem('');
      setErro('');

      const episodioId = episodioSelecionado?.id_epurgencia || episodioSelecionado?.id;
      const res = await fetch(`${API_URL}/api/v1/episodios/${episodioId}/alta`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alta),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extrairMensagemErro(data, 'Erro ao registar alta.'));

      setMensagem('Alta ou internamento registado com sucesso.');
      await carregarEpisodios();
    } catch (e) {
      setErro(e.message);
    }
  };

  const fazerLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const renderInformacaoGeral = () => (
    <div className="admin-general-info-group">
      <section className="admin-panel-section">
        <div className="admin-panel-section__header">
          <h2>{textos?.doctor?.kpisTitulo || 'Resumo clínico'}</h2>
          <p>{textos?.doctor?.kpisDesc || 'Visão rápida dos episódios triados e estado atual.'}</p>
        </div>
        <div className="admin-report-grid">
          <div className="admin-report-card">
            <h3>{textos?.doctor?.episodiosTriados || 'Episódios triados'}</h3>
            <strong>{episodios.length}</strong>
          </div>
          <div className="admin-report-card">
            <h3>{textos?.doctor?.emEspera || 'Em espera'}</h3>
            <strong>{episodios.filter((ep) => !ep.atendido).length}</strong>
          </div>
          <div className="admin-report-card">
            <h3>{textos?.doctor?.altasHoje || 'Altas hoje'}</h3>
            <strong>{episodios.filter((ep) => ep.alta).length}</strong>
          </div>
          <div className="admin-report-card">
            <h3>{textos?.doctor?.internamentos || 'Internamentos'}</h3>
            <strong>{episodios.filter((ep) => ep.internamento).length}</strong>
          </div>
        </div>
      </section>

      <section className="admin-panel-section" style={{ marginTop: '2rem' }}>
        <div className="admin-panel-section__header">
          <h2>🕒 Tempo médio por cor — <span style={{ color: '#007bff' }}>{nomeHospital}</span></h2>
          <p>Indicadores em tempo real baseados nas triagens registadas no vosso servidor SQL.</p>
        </div>
        <div className="admin-table-card admin-table-card--full">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{textos?.doctor?.cor || 'Cor de Triagem'}</th>
                <th>{textos?.doctor?.tempoMedio || 'Tempo Médio de Espera'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#dc3545', marginRight: '8px', borderRadius: '50%' }}></span>Vermelho</td>
                <td><strong>{temposMediosHospital.vermelho}</strong></td>
              </tr>
              <tr>
                <td><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#fd7e14', marginRight: '8px', borderRadius: '50%' }}></span>Laranja</td>
                <td><strong>{temposMediosHospital.laranja}</strong></td>
              </tr>
              <tr>
                <td><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ffc107', marginRight: '8px', borderRadius: '50%' }}></span>Amarelo</td>
                <td><strong>{temposMediosHospital.amarelo}</strong></td>
              </tr>
              <tr>
                <td><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#28a745', marginRight: '8px', borderRadius: '50%' }}></span>Verde</td>
                <td><strong>{temposMediosHospital.verde}</strong></td>
              </tr>
              <tr>
                <td><span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#007bff', marginRight: '8px', borderRadius: '50%' }}></span>Azul</td>
                <td><strong>{temposMediosHospital.azul}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderFila = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.doctor?.filaPrioridade || 'Fila resumida por prioridade'}</h2>
      </div>

      <div className="admin-form__group">
        <label>{textos?.geral?.pesquisar || 'Pesquisar'}</label>
        <input
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder={textos?.doctor?.placeholderPesquisa || 'Utente, cor, episódio...'}
        />
      </div>

      <div className="admin-table-card admin-table-card--full">
        <div className="admin-table-card__header">
          <h3>{textos?.doctor?.episodios || 'Episódios'}</h3>
          <span>{episodiosFiltrados.length}</span>
        </div>
        <div className="admin-table-scroll admin-table-scroll--employees">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{textos?.doctor?.utente || 'Utente'}</th>
                <th>{textos?.doctor?.cor || 'Cor'}</th>
                <th>{textos?.doctor?.espera || 'Espera'}</th>
                <th>{textos?.doctor?.acao || 'Ações'}</th>
              </tr>
            </thead>
            <tbody>
              {episodiosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4">{textos?.geral?.semResultados || 'Sem resultados'}</td>
                </tr>
              ) : (
                episodiosFiltrados.map((ep) => (
                  <tr key={ep.id_epurgencia || ep.id}>
                    <td>{ep.nome_utente || '—'}</td>
                    <td>{ep.cor_triagem || '—'}</td>
                    <td>{ep.tempo_espera || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="button" className="admin-secondary-button" onClick={() => abrirEpisodio(ep, false)}>
                          {textos?.doctor?.atender || 'Atender'}
                        </button>
                        <button 
                          type="button" 
                          className="admin-secondary-button" 
                          style={{ backgroundColor: '#dc3545', color: '#fff', borderColor: '#dc3545' }} 
                          onClick={() => abrirEpisodio(ep, true)}
                        >
                          {textos?.doctor?.alta || 'Alta'}
                        </button>
                      </div>
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

  const renderAtendimentoCompleto = () => (
    <section className="admin-panel-section">
      <div className="admin-panel-section__header">
        <h2>{textos?.doctor?.atendimentoPainel || 'Zona de Atendimento Clínico'}</h2>
      </div>

      {episodioSelecionado ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* 1. DETALHE DO EPISÓDIO & TABELA COMPLETA DE TRIAGEM */}
          <div className="admin-atendimento-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>
                {textos?.doctor?.detalheCompleto || '1. Detalhe completo e Ficha de Triagem'}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="admin-secondary-button"
                  style={{ backgroundColor: '#17a2b8', color: '#fff', borderColor: '#17a2b8' }}
                  onClick={() => setModoEdicaoTriagem(!modoEdicaoTriagem)}
                >
                  {modoEdicaoTriagem ? '✕ Cancelar' : '✏️ Editar Triagem'}
                </button>
                <button 
                  type="button" 
                  className="admin-secondary-button"
                  style={{ backgroundColor: '#007bff', color: '#fff', borderColor: '#007bff' }}
                  onClick={carregarAntecedentes}
                >
                  👁️ Ver Antecedentes do Utente
                </button>
              </div>
            </div>

            {mostrarAntecedentes && (
              <div className="admin-table-card" style={{ marginTop: '1rem', backgroundColor: '#f8f9fa', borderLeft: '4px solid #007bff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4>📋 Histórico / Antecedentes Clínicos</h4>
                  <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setMostrarAntecedentes(false)}>✕</button>
                </div>
                {antecedentes ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p><strong>Alergias Conhecidas:</strong> {antecedentes.alergias || 'Nenhuma registada.'}</p>
                    <p><strong>Cirurgias Anteriores:</strong> {antecedentes.cirurgias || 'Sem histórico.'}</p>
                    <p><strong>Doenças Crónicas:</strong> {antecedentes.doencas_cronicas || 'Nenhuma declarada.'}</p>
                    <p><strong>Notas Clínicas Globais:</strong> {antecedentes.observacoes || 'Sem notas adicionais.'}</p>
                  </div>
                ) : (
                  <p>A carregar antecedentes...</p>
                )}
              </div>
            )}

            <div className="admin-table-card" style={{ marginTop: '1rem' }}>
              <p style={{ marginBottom: '1rem' }}><strong>Utente:</strong> {utente?.nome || episodioSelecionado.nome_utente || '—'} (Tempo de Espera: {episodioSelecionado.tempo_espera || '—'})</p>
              
              {/* Tabela de triagem adaptada com os novos campos biométricos do SQL */}
              {!modoEdicaoTriagem ? (
                <div className="admin-table-card admin-table-card--full" style={{ boxShadow: 'none', padding: 0 }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Parâmetro Clínico</th>
                        <th>Informação Registada</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Cor atribuída</strong></td>
                        <td><span style={{ fontWeight: 'bold' }}>{dadosTriagem?.cor_triagem || episodioSelecionado.cor_triagem || '—'}</span></td>
                      </tr>
                      <tr>
                        <td><strong>Temperatura (°C)</strong></td>
                        <td>{dadosTriagem?.Temperatura ? `${dadosTriagem.Temperatura} °C` : '—'}</td>
                      </tr>
                      <tr>
                        <td><strong>Freq. Cardíaca (BPM)</strong></td>
                        <td>{dadosTriagem?.FreqCard ? `${dadosTriagem.FreqCard} bpm` : '—'}</td>
                      </tr>
                      <tr>
                        <td><strong>Freq. Respiratória (CPM)</strong></td>
                        <td>{dadosTriagem?.FreqResp ? `${dadosTriagem.FreqResp} cpm` : '—'}</td>
                      </tr>
                      <tr>
                        <td><strong>SPO2 (%)</strong></td>
                        <td>{dadosTriagem?.SPO2 ? `${dadosTriagem.SPO2} %` : '—'}</td>
                      </tr>
                      <tr>
                        <td><strong>Tensão Arterial (Sistólica / Diastólica)</strong></td>
                        <td>{dadosTriagem?.Sistolica || dadosTriagem?.Diastolica ? `${dadosTriagem.Sistolica || '—'} / ${dadosTriagem.Diastolica || '—'} mmHg` : '—'}</td>
                      </tr>
                      <tr>
                        <td><strong>Nível de Dor</strong></td>
                        <td>{dadosTriagem?.Nivel_dor || dadosTriagem?.['Nivel de dor'] || '—'} / 10</td>
                      </tr>
                      <tr>
                        <td><strong>Estado de Consciência</strong></td>
                        <td><span style={{ fontStyle: 'italic' }}>{dadosTriagem?.Consciencia || '—'}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <form onSubmit={atualizarDadosTriagem} style={{ marginTop: '1rem', background: '#fff', padding: '1rem', border: '1px dashed #17a2b8', borderRadius: '6px' }}>
                  <div className="admin-form__grid">
                    <div className="admin-form__group">
                      <label>Cor da Triagem</label>
                      <input value={formTriagem.cor_triagem} onChange={(e) => setFormTriagem({...formTriagem, cor_triagem: e.target.value})} required />
                    </div>
                    <div className="admin-form__group">
                      <label>Temperatura (°C)</label>
                      <input type="number" step="0.1" value={formTriagem.Temperatura} onChange={(e) => setFormTriagem({...formTriagem, Temperatura: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Freq. Cardíaca (BPM)</label>
                      <input type="number" value={formTriagem.FreqCard} onChange={(e) => setFormTriagem({...formTriagem, FreqCard: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Freq. Respiratória (CPM)</label>
                      <input type="number" value={formTriagem.FreqResp} onChange={(e) => setFormTriagem({...formTriagem, FreqResp: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>SPO2 (%)</label>
                      <input type="number" value={formTriagem.SPO2} onChange={(e) => setFormTriagem({...formTriagem, SPO2: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Sistólica (mmHg)</label>
                      <input type="number" value={formTriagem.Sistolica} onChange={(e) => setFormTriagem({...formTriagem, Sistolica: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Diastólica (mmHg)</label>
                      <input type="number" value={formTriagem.Diastolica} onChange={(e) => setFormTriagem({...formTriagem, Diastolica: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Nível de Dor (0 a 10)</label>
                      <input type="number" min="0" max="10" value={formTriagem.Nivel_dor} onChange={(e) => setFormTriagem({...formTriagem, Nivel_dor: e.target.value})} />
                    </div>
                    <div className="admin-form__group">
                      <label>Estado de Consciência</label>
                      <select value={formTriagem.Consciencia} onChange={(e) => setFormTriagem({...formTriagem, Consciencia: e.target.value})}>
                        <option value="Acordado">Acordado</option>
                        <option value="Confuso">Confuso</option>
                        <option value="Inconsciente">Inconsciente</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="admin-form__submit" style={{ backgroundColor: '#17a2b8', marginTop: '1.5rem' }}>
                    Atualizar Ficha de Triagem (PUT)
                  </button>
                </form>
              )}
            </div>

            <div className="admin-table-card" style={{ marginTop: '1rem' }}>
              <h3>⚠️ {textos?.doctor?.alertas || 'Alertas Médicos (SQL)'}</h3>
              {alertas.length > 0 ? (
                alertas.map((a, i) => (
                  <p key={i} style={{ color: '#dc3545', fontWeight: 'bold', margin: '0.4rem 0' }}>
                    • {a.descricao || a.mensagem || a.alerta || '—'}
                  </p>
                ))
              ) : (
                <p>{textos?.doctor?.semAlertas || 'Sem alertas críticos registados no sistema.'}</p>
              )}
            </div>

            <div className="admin-table-card" style={{ marginTop: '1rem' }}>
              <h3>💊 {textos?.doctor?.medicacaoAtiva || 'Medicação habitual ativa'}</h3>
              {medicacaoAtiva.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem' }}>
                  {medicacaoAtiva.map((m, i) => (
                    <li key={i} style={{ margin: '0.3rem 0' }}>
                      <strong>{m.nome || m.medicamento || '—'}</strong> — {m.dosagem || '—'} ({m.frequencia || 'N/A'})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>{textos?.doctor?.semMedicacao || 'Nenhum medicamento ativo associado ao registo SQL.'}</p>
              )}
            </div>
          </div>

          {/* 2. PRESCRIÇÃO */}
          <div className="admin-atendimento-block">
            <h3 style={{ borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              {textos?.doctor?.prescricao || '2. Emitir Nova Prescrição'}
            </h3>
            <form className="admin-form" onSubmit={adicionarPrescricao} style={{ marginTop: '1rem' }}>
              <div className="admin-form__grid">
                <div className="admin-form__group">
                  <label>{textos?.doctor?.medicamento || 'Medicamento'}</label>
                  <input name="medicamento" value={prescricao.medicamento} onChange={handlePrescricaoChange} required />
                </div>
                <div className="admin-form__group">
                  <label>{textos?.doctor?.dosagem || 'Dosagem'}</label>
                  <input name="dosagem" value={prescricao.dosagem} onChange={handlePrescricaoChange} placeholder="Ex: 500mg" />
                </div>
                <div className="admin-form__group">
                  <label>{textos?.doctor?.duracao || 'Duração'}</label>
                  <input name="duracao" value={prescricao.duracao} onChange={handlePrescricaoChange} placeholder="Ex: 7 dias" />
                </div>
                <div className="admin-form__group">
                  <label>{textos?.doctor?.via || 'Via'}</label>
                  <input name="via" value={prescricao.via} onChange={handlePrescricaoChange} placeholder="Ex: Oral" />
                </div>
              </div>
              <div className="admin-actions-row">
                <button className="admin-form__submit" type="submit">
                  {textos?.doctor?.fazerPrescricao || 'Submeter e Guardar no SQL'}
                </button>
              </div>
            </form>
          </div>

          {/* 3. ALTA / INTERNAMENTO */}
          <div className="admin-atendimento-block" id="seccao-alta-form">
            <h3 style={{ borderBottom: '2px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>
              {textos?.doctor?.altaInternamento || '3. Alta ou internamento'}
            </h3>
            <form className="admin-form" onSubmit={registarAlta} style={{ marginTop: '1rem' }}>
              <div className="admin-form__grid">
                <div className="admin-form__group">
                  <label>{textos?.doctor?.destino || 'Destino'}</label>
                  <select name="destino" value={alta.destino} onChange={handleAltaChange}>
                    <option value="alta">{textos?.doctor?.alta || 'Alta Home'}</option>
                    <option value="internamento">{textos?.doctor?.internamento || 'Internamento Clínico'}</option>
                  </select>
                </div>

                <div className="admin-form__group">
                  <label>{textos?.doctor?.destinoInternamento || 'Unidade/Serviço de destino'}</label>
                  <input name="internamento_destino" value={alta.internamento_destino} onChange={handleAltaChange} placeholder="Ex: Medicina Interna" />
                </div>

                <div className="admin-form__group admin-form__group--full">
                  <label>{textos?.doctor?.observacoes || 'Observações de Encerramento'}</label>
                  <textarea name="observacoes" value={alta.observacoes} onChange={handleAltaChange} rows="4" />
                </div>
              </div>

              <div className="admin-actions-row">
                <button className="admin-form__submit" type="submit" style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}>
                  {textos?.doctor?.confirmar || 'Confirmar Decisão Final'}
                </button>
              </div>
            </form>
          </div>

        </div>
      ) : (
        <p>{textos?.doctor?.selecionaTriado || 'Selecione um paciente na Fila por Prioridade para abrir a zona de atendimento.'}</p>
      )}
    </section>
  );

  const renderCenter = () => {
    switch (mainMenu) {
      case 'informacao_geral':
        return renderInformacaoGeral();
      case 'fila':
        return renderFila();
      case 'atendimento':
        return renderAtendimentoCompleto();
      default:
        return renderInformacaoGeral();
    }
  };

  const renderMenuGroup = (group) => (
    <div className="admin-sidebar__group" key={group.title}>
      <span className="admin-sidebar__group-title">{group.title}</span>
      {group.items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`admin-sidebar__link ${mainMenu === item.key ? 'is-active' : ''}`}
          onClick={() => setMainMenu(item.key)}
        >
          {item.icon}
          <span className="link-text">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <main className={`admin-layout doctor-dashboard ${isSidebarCollapsed ? 'is-collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <button
          type="button"
          className="admin-sidebar__toggle"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          aria-label="Alternar menu lateral"
        >
          <IconMenu />
        </button>

        <div className="admin-sidebar__brand">
          <img src={logo} alt="SIAGUH" className="admin-sidebar__logo" />
        </div>

        <div className="admin-sidebar__divider" />

        <button type="button" className="admin-sidebar__profile" onClick={abrirPerfilUtilizador}>
          <div className="admin-sidebar__profile-avatar admin-sidebar__profile-avatar--fallback">
            {iniciaisUtilizador}
          </div>
          <span className="admin-sidebar__profile-name">{nomeUtilizador}</span>
        </button>

        <div className="admin-sidebar__divider" />

        <nav className="admin-sidebar__nav">
          {menuGroups.map(renderMenuGroup)}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__lang-switcher">
            <button
              type="button"
              className={`admin-lang-btn ${idioma === 'pt' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('pt')}
            >
              PT
            </button>
            <span>/</span>
            <button
              type="button"
              className={`admin-lang-btn ${idioma === 'en' ? 'is-active' : ''}`}
              onClick={() => mudarIdioma('en')}
            >
              EN
            </button>
          </div>

          <button type="button" className="admin-logout-button" onClick={fazerLogout}>
            <IconExit />
            <span className="link-text">{textos?.geral?.sair || 'Sair'}</span>
          </button>
        </div>
      </aside>

      <section className="admin-content-wrapper">
        <div className="admin-content-inner">
          <div className="admin-content-top">
            <h1>SIAGUH</h1>
            <p>{textos?.doctor?.descricaoPainel || 'Prioridade, detalhe clínico completo, prescrição e decisão final.'}</p>
          </div>

          <div className="admin-content-body">
            {erro && (
              <p className="admin-form__error">
                ⚠️ {typeof erro === 'object' ? 'Ocorreu uma falha na ligação ao servidor SQL.' : erro}
              </p>
            )}
            {mensagem && (
              <p className="admin-form__success">
                ✅ {typeof mensagem === 'object' ? 'Operação concluída.' : mensagem}
              </p>
            )}
            {renderCenter()}
          </div>
        </div>

        <FooterLayout />
      </section>
    </main>
  );
}