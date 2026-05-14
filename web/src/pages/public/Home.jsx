import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarHospitais } from '../../services/hospitais';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';


import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';
const CAROUSEL_IMAGES = [info1, info2, info3, info4, info5];

// --- FUNÇÕES DE APOIO (IA E UI) ---

function waitColor(mins) {
    if (mins == null) return '#94a3b8';
    if (mins <= 20) return '#16a34a';
    if (mins <= 45) return '#ca8a04';
    return '#dc2626';
}

const obterContextoIA = () => {
    const agora = new Date();
    const mes = agora.getMonth();
    const hora = agora.getHours();
    const seasonMap = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
    
    let timeOfDay = "Night";
    if (hora >= 6 && hora < 12) timeOfDay = "Morning";
    else if (hora >= 12 && hora < 18) timeOfDay = "Afternoon";
    else if (hora >= 18 && hora < 24) timeOfDay = "Evening";

    return {
        Day_of_Week: agora.toLocaleDateString('en-US', { weekday: 'long' }),
        Season: seasonMap[mes],
        Time_of_Day: timeOfDay
    };
};

async function consultarIACompleta(hospital) {
    try {
        const contexto = obterContextoIA();
        // Dados operacionais vindos do SQL (Trabalha/EpUrgencia)
        const enfermeiros = hospital.contagem_enfermeiros || 1;
        const pacientes = hospital.pacientes_ativos || 1;
        const medicos = hospital.contagem_medicos || 1;

        const body = {
            "Urgency_Level": "Medium", 
            "Nurse_to_Patient_Ratio": parseFloat((enfermeiros / pacientes).toFixed(2)),
            "Specialist_Availability": medicos,
            "Facility_Size_Beds": hospital.total_camas || 100,
            "Day_of_Week": contexto.Day_of_Week,
            "Time_of_Day": contexto.Time_of_Day,
            "Season": contexto.Season
        };

        const response = await fetch(`${API_IA}/predict/wait-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json(); 
        // Retorna o mapeamento total: { Critical, High, Medium, Low, "Not Urgent" }
        return data; 
    } catch (err) {
        console.error("Erro na predição IA:", err);
        return null;
    }
}

// --- COMPONENTES ---

function HospitalCard({ hospital, onClick, textos }) {
    // Para o card inicial, usamos o nível 'Medium' como referência visual
    const espera = hospital.previsoes_ia?.Medium || hospital.previsoes_ia?.medium;
    const ativo = hospital.ativo !== false;

    return (
        <button
            className={`hcard2 ${!ativo ? 'hcard2--offline' : ''}`}
            onClick={() => onClick(hospital)}
            aria-label={`${textos.home?.labelHospitais || 'Hospital'} ${hospital.nome}`}
        >
            <div className="hcard2__head">
                <div className="hcard2__title-row">
                    <h3 className="hcard2__name">{hospital.nome}</h3>
                    <span
                        className="hcard2__dot"
                        style={{ background: ativo ? '#22c55e' : '#94a3b8' }}
                        title={ativo ? (textos.home?.statusDisponivel || 'Disponível') : 'Indisponível'}
                    />
                </div>
                <p className="hcard2__addr">{hospital.morada || hospital.localizacao || '—'}</p>
            </div>

            <div className="hcard2__foot">
                <div className="hcard2__wait">
                    <span className="hcard2__wait-label">{textos.home?.labelEspera || 'Média (Urgente)'}</span>
                    <strong className="hcard2__wait-val" style={{ color: waitColor(espera) }}>
                        {ativo && espera != null ? `${espera} min` : (textos.home?.valorEsperaIndisponivel || '-- min')}
                    </strong>
                </div>
                <span className="hcard2__cta">Ver Detalhes</span>
            </div>
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="hcard2 hcard2--skeleton" aria-hidden="true">
            <div className="sk" style={{ height: '1rem', width: '65%', marginBottom: '0.4rem' }} />
            <div className="sk" style={{ height: '0.8rem', width: '80%', marginBottom: '1rem' }} />
            <div className="sk" style={{ height: '6px', marginBottom: '1rem' }} />
            <div className="sk" style={{ height: '1.8rem', width: '35%' }} />
        </div>
    );
}

// --- PÁGINA HOME ---

export default function Home() {
    const navigate = useNavigate();
    const { textos } = useLanguage();
    const [hospitais, setHospitais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                
                // 1. Busca dados do SQL via Backend
                const data = await listarHospitais();
                const listaBase = Array.isArray(data) ? data : data?.data ?? [];

                // 2. Realiza o mapeamento total para cada hospital
                const listaComIA = await Promise.all(
                    listaBase.map(async (h) => {
                        const dictIA = await consultarIACompleta(h);
                        return { 
                            ...h, 
                            previsoes_ia: dictIA // Guarda Critical, High, Medium, Low, Not Urgent
                        };
                    })
                );

                setHospitais(listaComIA);
            } catch (err) {
                setError('Erro ao sincronizar com servidor de IA.');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleCardClick = useCallback((hospital) => {
        const id = hospital?.idhosp ?? hospital?.id;
        if (!id) return;
        // Passamos o hospital com as predições já carregadas para a view de detalhes
        navigate(`/hospital/${id}`, { state: { hospitalData: hospital } });
    }, [navigate]);

    const filteredHospitais = hospitais.filter((h) => {
        const search = query.toLowerCase();
        return (h.nome || '').toLowerCase().includes(search)
            || (h.morada || h.localizacao || '').toLowerCase().includes(search);
    });

    const scrollLeft = () => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
    const scrollRight = () => scrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });

    return (
        <>
            <section className="home-intro-pro">
                <div className="container">
                    <div className="home-intro-pro__panel">
                        <div className="home-intro-pro__header">
                            <span className="home-intro-pro__eyebrow">{textos.home.labelIntro}</span>
                            <span className="home-intro-pro__divider" />
                            <span className="home-intro-pro__meta">{textos.home.valorProjeto}</span>
                        </div>
                        <div className="home-intro-pro__grid">
                            <div className="home-intro-pro__main">
                                <h1 className="home-intro-pro__title">{textos.home.tituloPrincipal}</h1>
                                <p className="home-intro-pro__text">{textos.home.subtituloPrincipal}</p>
                            </div>
                            <aside className="home-intro-pro__aside">
                                <div className="home-intro-pro__stat"><span>Projeto</span><strong>Prodigi</strong></div>
                                <div className="home-intro-pro__stat"><span>Área</span><strong>Saúde</strong></div>
                                <div className="home-intro-pro__stat"><span>Tecnologia</span><strong>XGBoost IA</strong></div>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hospital-section hospital-section--scroll">
                <div className="container">
                    <div className="hospital-section__topbar">
                        <div>
                            <h2 className="hospital-section__title">{textos.home.tituloHospitais}</h2>
                            <p className="hospital-section__subtitle">Tempos reais calculados por Inteligência Artificial</p>
                        </div>
                        <div className="hospital-section__tools">
                            <div className="hospital-search-box">
                                <input 
                                    type="search" 
                                    value={query} 
                                    onChange={(e) => setQuery(e.target.value)} 
                                    placeholder="Pesquisar..." 
                                />
                            </div>
                            <div className="hospital-scroll-actions">
                                <button onClick={scrollLeft} className="hospital-arrow">←</button>
                                <button onClick={scrollRight} className="hospital-arrow">→</button>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="hospital-loading">{error}</div>
                    ) : loading ? (
                        <div className="hospital-scroll-row" ref={scrollRef}>
                            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="hospital-scroll-row" ref={scrollRef}>
                            {filteredHospitais.map((h) => (
                                <div key={h.idhosp || h.id} className="hospital-scroll-item">
                                    <HospitalCard hospital={h} onClick={handleCardClick} textos={textos} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="info-section">
                <div className="container">
                    <div className="info-box-carousel">
                        <h2 className="info-title">Informações Adicionais</h2>
                        <div className="carousel-wrapper">
                            {CAROUSEL_IMAGES.map((img, idx) => (
                                <img key={idx} src={img} className={`carousel-image ${idx === currentSlide ? 'active' : ''}`} alt="info" />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
