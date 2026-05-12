import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarHospitais } from '../../services/hospitais';
import { useLanguage } from '../../contexts/LanguageContext';

import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

const CAROUSEL_IMAGES = [info1, info2, info3, info4, info5];

function waitColor(mins) {
    if (mins == null) return '#94a3b8';
    if (mins <= 20) return '#16a34a';
    if (mins <= 45) return '#ca8a04';
    return '#dc2626';
}

function HospitalCard({ hospital, onClick, textos }) {
    const espera = hospital.tempo_espera ?? hospital.tempoEspera;
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
                    <span className="hcard2__wait-label">{textos.home?.labelEspera || 'Tempo de espera'}</span>
                    <strong className="hcard2__wait-val" style={{ color: waitColor(espera) }}>
                        {ativo && espera != null ? `${espera} min` : (textos.home?.valorEsperaIndisponivel || '-- min')}
                    </strong>
                </div>
                <span className="hcard2__cta">Detalhes</span>
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
        async function loadHospitais() {
            try {
                setLoading(true);
                setError(null);
                const data = await listarHospitais();
                setHospitais(Array.isArray(data) ? data : data?.data ?? []);
            } catch {
                setError('Erro ao carregar hospitais.');
                setHospitais([]);
            } finally {
                setLoading(false);
            }
        }
        loadHospitais();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleCardClick = useCallback((hospital) => {
        const hospitalId = hospital?.idhosp ?? hospital?.id;
        if (!hospitalId) return;
        navigate(`/hospital/${hospitalId}`);
    }, [navigate]);

    const filteredHospitais = hospitais.filter((h) => {
        const search = query.toLowerCase();
        return (h.nome || '').toLowerCase().includes(search)
            || (h.morada || h.localizacao || '').toLowerCase().includes(search);
    });

    const scrollLeft = () => {
        if (scrollRef.current) scrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    };

    const scrollRight = () => {
        if (scrollRef.current) scrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    };

    return (
        <>
            <section className="home-intro-pro" aria-labelledby="home-hero-title">
                <div className="container">
                    <div className="home-intro-pro__panel">
                        <div className="home-intro-pro__header">
                            <span className="home-intro-pro__eyebrow">{textos.home.labelIntro}</span>
                            <span className="home-intro-pro__divider" aria-hidden="true" />
                            <span className="home-intro-pro__meta">{textos.home.valorProjeto}</span>
                        </div>

                        <div className="home-intro-pro__grid">
                            <div className="home-intro-pro__main">
                                <h1 id="home-hero-title" className="home-intro-pro__title">
                                    {textos.home.tituloPrincipal}
                                </h1>
                                <p className="home-intro-pro__text">{textos.home.subtituloPrincipal}</p>
                            </div>

                            <aside className="home-intro-pro__aside" aria-label="Resumo do projeto">
                                <div className="home-intro-pro__stat">
                                    <span>{textos.home.labelProjeto}</span>
                                    <strong>{textos.home.valorProjeto}</strong>
                                </div>
                                <div className="home-intro-pro__stat">
                                    <span>{textos.home.labelArea}</span>
                                    <strong>{textos.home.valorArea}</strong>
                                </div>
                                <div className="home-intro-pro__stat">
                                    <span>{textos.home.labelTech}</span>
                                    <strong>{textos.home.valorTech}</strong>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </section>

            <section className="hospital-section hospital-section--scroll" aria-labelledby="hospitais-title">
                <div className="container">
                    <div className="hospital-section__topbar">
                        <div>
                            <p className="section-label" aria-hidden="true">{textos.home.labelHospitais}</p>
                            <h2 id="hospitais-title" className="hospital-section__title">{textos.home.tituloHospitais}</h2>
                            <p className="hospital-section__subtitle">{textos.home.subtituloHospitais}</p>
                        </div>

                        <div className="hospital-section__tools">
                            <div className="hospital-search-box">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <input
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={textos.home.placeholderPesquisa || 'Pesquisar hospital ou localização'}
                                    aria-label={textos.home.placeholderPesquisa || 'Pesquisar hospital ou localização'}
                                />
                            </div>

                            <div className="hospital-scroll-actions" role="group" aria-label={textos.home.ariaPaginacao}>
                                <button type="button" className="hospital-arrow" onClick={scrollLeft} aria-label={textos.home.btnAnterior}>←</button>
                                <button type="button" className="hospital-arrow" onClick={scrollRight} aria-label={textos.home.btnSeguinte}>→</button>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <div className="hospital-loading">{error}</div>
                    ) : loading ? (
                        <div className="hospital-scroll-row" ref={scrollRef}>
                            {[1, 2, 3, 4].map((item) => <SkeletonCard key={item} />)}
                        </div>
                    ) : filteredHospitais.length === 0 ? (
                        <div className="hospital-loading">{textos.geral?.semResultados || 'Sem resultados.'}</div>
                    ) : (
                        <div className="hospital-scroll-row" ref={scrollRef} role="list">
                            {filteredHospitais.map((hospital) => (
                                <div key={hospital.idhosp ?? hospital.id} className="hospital-scroll-item" role="listitem">
                                    <HospitalCard hospital={hospital} onClick={handleCardClick} textos={textos} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="info-section" aria-labelledby="info-title">
                <div className="container">
                    <div className="info-box-carousel">
                        <p className="section-label" aria-hidden="true">{textos.home.labelInfo}</p>
                        <h2 id="info-title" className="info-title">{textos.home.tituloInfo}</h2>

                        <div className="carousel-wrapper" role="region" aria-roledescription="carousel" aria-label={textos.home.ariaCarrossel}>
                            <div aria-live="polite">
                                {CAROUSEL_IMAGES.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${textos.home.altSlide} ${index + 1}`}
                                        className={`carousel-image ${index === currentSlide ? 'active' : ''}`}
                                        aria-hidden={index !== currentSlide}
                                    />
                                ))}
                            </div>

                            <div className="carousel-indicators" role="tablist">
                                {CAROUSEL_IMAGES.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`${textos.home.ariaIrParaSlide} ${index + 1}`}
                                        aria-selected={index === currentSlide}
                                        role="tab"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
