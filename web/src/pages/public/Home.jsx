// src/pages/public/Home.jsx
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

const CAROUSEL_IMAGES = [info1, info2, info3, info4, info5];

function waitColor(mins) {
  if (mins == null) return '#94a3b8';
  if (mins <= 20) return '#16a34a';
  if (mins <= 45) return '#ca8a04';
  return '#dc2626';
}

async function consultarIACompleta(hospital) {
  try {
    const id = hospital.id_hosp ?? hospital.id;
    const response = await fetch(`http://localhost:8000/api/v1/predict/tempos-espera/${id}`);
    if (!response.ok) return null;
    const data = await response.json();
    const t = data.tempos_espera;
    return {
      Critical: t.vermelho?.minutos,
      High:     t.laranja?.minutos,
      Medium:   t.amarelo?.minutos,
      Low:      t.verde?.minutos,
      'Not Urgent': t.azul?.minutos,
    };
  } catch (err) {
    console.error('Erro na predição IA:', err);
    return null;
  }
}

// ── TRIAGE BAR ──────────────────────────────────────────
const TRIAGE_LEVELS = [
  { key: 'Critical',   color: '#dc2626', label: 'C' },
  { key: 'High',       color: '#ea580c', label: 'H' },
  { key: 'Medium',     color: '#ca8a04', label: 'M' },
  { key: 'Low',        color: '#16a34a', label: 'L' },
  { key: 'Not Urgent', color: '#3b82f6', label: 'N' },
];

function TriageBar({ previsoes }) {
  if (!previsoes) return <div className="triage-bar triage-bar--empty" />;
  return (
    <div className="triage-bar">
      {TRIAGE_LEVELS.map(({ key, color, label }) => {
        const mins = previsoes[key];
        return (
          <div
            key={key}
            className="triage-bar__segment"
            style={{ background: color }}
            title={`${key}: ${mins != null ? mins + ' min' : '—'}`}
          >
            <span className="triage-bar__label">{label}</span>
            <span className="triage-bar__value">
              {mins != null ? `${mins}m` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── HOSPITAL CARD ────────────────────────────────────────
function HospitalCard({ hospital, onClick, textos }) {
  const espera = hospital.previsoes_ia?.Medium ?? hospital.previsoes_ia?.medium;
  const ativo  = hospital.ativo !== false;

  return (
    <div className={`hcard ${!ativo ? 'hcard--offline' : ''}`}>
      <div className="hcard__header">
        <div className="hcard__title-row">
          <h3 className="hcard__name">{hospital.nome}</h3>
          <span className={`hcard__status-dot ${ativo ? 'hcard__status-dot--on' : 'hcard__status-dot--off'}`} />
        </div>
        <p className="hcard__address">
          {hospital.morada || hospital.localizacao || '—'}
        </p>
      </div>

      <TriageBar previsoes={hospital.previsoes_ia} />

      <div className="hcard__footer">
        <div className="hcard__wait-block">
          <span className="hcard__wait-label">
            {textos.home?.labelEspera || 'Média (Urgente)'}
          </span>
          <strong
            className="hcard__wait-value"
            style={{ color: waitColor(espera) }}
          >
            {ativo && espera != null ? `${espera} min` : '-- min'}
          </strong>
        </div>
        <button
          className="btn btn--primary hcard__cta"
          onClick={() => onClick(hospital)}
        >
          Ver Detalhes →
        </button>
      </div>
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="hcard hcard--skeleton" aria-hidden="true">
      <div className="skeleton" style={{ height: '1rem',   width: '60%', marginBottom: '0.5rem' }} />
      <div className="skeleton" style={{ height: '0.8rem', width: '80%', marginBottom: '1.2rem' }} />
      <div className="skeleton" style={{ height: '32px',              marginBottom: '1.2rem' }} />
      <div className="skeleton" style={{ height: '1.8rem', width: '40%' }} />
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { textos } = useLanguage();

  const [hospitais,    setHospitais]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [query,        setQuery]        = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollRef = useRef(null);

  // load hospitals + IA
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data      = await listarHospitais();
        const listaBase = Array.isArray(data) ? data : data?.data ?? [];

        const listaComIA = await Promise.all(
          listaBase.map(async (h) => ({
            ...h,
            previsoes_ia: await consultarIACompleta(h),
          }))
        );
        setHospitais(listaComIA);
      } catch {
        setError('Erro ao sincronizar com servidor de IA.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // carousel auto-play
  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((p) => (p === CAROUSEL_IMAGES.length - 1 ? 0 : p + 1)),
      6000
    );
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = useCallback(
    (hospital) => {
      const id = hospital?.id_hosp ?? hospital?.id;
      if (!id) return;
      navigate(`/hospital/${id}`, { state: { hospitalData: hospital } });
    },
    [navigate]
  );

  const filteredHospitais = hospitais.filter((h) => {
    const s = query.toLowerCase();
    return (
      (h.nome     || '').toLowerCase().includes(s) ||
      (h.morada   || h.localizacao || '').toLowerCase().includes(s)
    );
  });

  const scrollLeft  = () => scrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left:  340, behavior: 'smooth' });

  return (
    <>
      {/* ── HERO ── */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__panel">

            <div className="home-hero__top">
              <span className="home-hero__eyebrow">{textos.home?.labelIntro}</span>
              <span className="home-hero__divider" />
              <span className="home-hero__meta">{textos.home?.valorProjeto}</span>
            </div>

            <div className="home-hero__content">
              <div className="home-hero__main">
                <h1 className="home-hero__title">{textos.home?.tituloPrincipal}</h1>
                <p  className="home-hero__description">{textos.home?.subtituloPrincipal}</p>
              </div>

              <aside className="home-hero__stats">
                {[
                  { label: 'Projeto',     value: 'Prodigi'    },
                  { label: 'Área',        value: 'Saúde'      },
                  { label: 'Tecnologia',  value: 'XGBoost IA' },
                ].map(({ label, value }) => (
                  <div key={label} className="home-hero__stat">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </aside>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOSPITALS ── */}
      <section className="home-hospitals">
        <div className="container">

          <div className="home-hospitals__header">
            <div>
              <h2 className="home-hospitals__title">
                {textos.home?.tituloHospitais}
              </h2>
              <p className="home-hospitals__subtitle">
                Tempos reais calculados por Inteligência Artificial
              </p>
            </div>

            <div className="home-controls">
              <input
                type="search"
                className="home-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={textos.home?.pesquisar || 'Pesquisar hospital...'}
              />
              <div className="home-scroll-btns">
                <button className="btn btn--secondary" onClick={scrollLeft}  aria-label="Anterior">←</button>
                <button className="btn btn--secondary" onClick={scrollRight} aria-label="Próximo" >→</button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="home-empty">
              <span className="home-empty__icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="hgrid" ref={scrollRef}>
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredHospitais.length === 0 ? (
            <div className="home-empty">
              <span className="home-empty__icon">🏥</span>
              <p>Nenhum hospital encontrado.</p>
            </div>
          ) : (
            <div className="hgrid" ref={scrollRef}>
              {filteredHospitais.map((h) => (
                <HospitalCard
                  key={h.id_hosp || h.id}
                  hospital={h}
                  onClick={handleCardClick}
                  textos={textos}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── INFO CAROUSEL ── */}
      <section className="home-info">
        <div className="container">
          <h2 className="info-carousel__title">Informações Adicionais</h2>

          <div className="info-carousel__wrapper">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Informação adicional ${idx + 1}`}
                className={`info-carousel__image ${idx === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>

          {/* dots */}
          <div className="info-carousel__dots">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`info-carousel__dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}