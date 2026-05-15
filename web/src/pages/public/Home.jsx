// src/pages/public/Home.jsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarHospitais } from '../../services/hospitais';
import { useLanguage } from '../../contexts/LanguageContext';

// STYLES
import '../../styles/main.css';

// IMAGES
import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

const CAROUSEL_IMAGES = [info1, info2, info3, info4, info5];

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function waitColor(mins) {
  if (mins == null) return '#94a3b8';
  if (mins <= 20) return '#16a34a';
  if (mins <= 45) return '#ca8a04';
  return '#dc2626';
}

async function consultarIACompleta(hospital) {
  try {
    const id = hospital.id_hosp ?? hospital.id;

    const response = await fetch(
      `http://localhost:8000/api/v1/predict/tempos-espera/${id}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const t = data.tempos_espera;

    return {
      Critical: t.vermelho?.minutos,
      High: t.laranja?.minutos,
      Medium: t.amarelo?.minutos,
      Low: t.verde?.minutos,
      'Not Urgent': t.azul?.minutos,
    };
  } catch (err) {
    console.error('Erro na predição IA:', err);
    return null;
  }
}

// --------------------------------------------------
// COMPONENTS
// --------------------------------------------------

function HospitalCard({ hospital, onClick, textos }) {
  const espera =
    hospital.previsoes_ia?.Medium || hospital.previsoes_ia?.medium;
  const ativo = hospital.ativo !== false;

  return (
    <button
      className={`hcard ${!ativo ? 'hcard--offline' : ''}`}
      onClick={() => onClick(hospital)}
      aria-label={`${textos.home?.labelHospitais || 'Hospital'} ${hospital.nome}`}
    >
      <div className="hcard__header">
        <div className="hcard__title-row">
          <h3 className="hcard__name">{hospital.nome}</h3>
          <span
            className={`hcard__status-dot ${
              ativo ? 'hcard__status-dot--on' : 'hcard__status-dot--off'
            }`}
          />
        </div>
        <p className="hcard__address">
          {hospital.morada || hospital.localizacao || '—'}
        </p>
      </div>

      <div className="triage-bar">
        {/* aqui podes iterar sobre previsoes_ia, se quiseres barras de triagem */}
      </div>

      <div className="hcard__footer">
        <div className="hcard__wait-block">
          <span className="hcard__wait-label">
            {textos.home?.labelEspera || 'Média (Urgente)'}
          </span>
          <strong
            className="hcard__wait-value"
            style={{
              color: waitColor(espera),
            }}
          >
            {ativo && espera != null ? `${espera} min` : '-- min'}
          </strong>
        </div>

        <span className="hcard__cta">
          Ver Detalhes
        </span>
      </div>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div
      className="hcard hcard--skeleton"
      aria-hidden="true"
    >
      <div
        className="skeleton"
        style={{
          height: '1rem',
          width: '65%',
          marginBottom: '0.4rem',
        }}
      />

      <div
        className="skeleton"
        style={{
          height: '0.8rem',
          width: '80%',
          marginBottom: '1rem',
        }}
      />

      <div
        className="skeleton"
        style={{
          height: '6px',
          marginBottom: '1rem',
        }}
      />

      <div
        className="skeleton"
        style={{
          height: '1.8rem',
          width: '35%',
        }}
      />
    </div>
  );
}

// --------------------------------------------------
// PAGE
// --------------------------------------------------

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

        const data = await listarHospitais();
        const listaBase = Array.isArray(data)
          ? data
          : data?.data ?? [];

        const listaComIA = await Promise.all(
          listaBase.map(async (h) => {
            const dictIA = await consultarIACompleta(h);

            return {
              ...h,
              previsoes_ia: dictIA,
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
      setCurrentSlide((prev) =>
        prev === CAROUSEL_IMAGES.length - 1 ? 0 : prev + 1
      );
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleCardClick = useCallback(
    (hospital) => {
      const id = hospital?.id_hosp ?? hospital?.id;

      if (!id) return;

      navigate(`/hospital/${id}`, {
        state: {
          hospitalData: hospital,
        },
      });
    },
    [navigate]
  );

  const filteredHospitais = hospitais.filter((h) => {
    const search = query.toLowerCase();

    return (
      (h.nome || '').toLowerCase().includes(search) ||
      (h.morada || h.localizacao || '').toLowerCase().includes(search)
    );
  });

  const scrollLeft = () =>
    scrollRef.current?.scrollBy({
      left: -340,
      behavior: 'smooth',
    });

  const scrollRight = () =>
    scrollRef.current?.scrollBy({
      left: 340,
      behavior: 'smooth',
    });

  return (
    <>
      {/* Home Hero */}
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__panel">
            <div className="home-hero__top">
              <span className="home-hero__eyebrow">
                {textos.home.labelIntro}
              </span>
              <span className="home-hero__divider" />
              <span className="home-hero__meta">
                {textos.home.valorProjeto}
              </span>
            </div>

            <div className="home-hero__content">
              <div className="home-hero__main">
                <h1 className="home-hero__title">
                  {textos.home.tituloPrincipal}
                </h1>
                <p className="home-hero__description">
                  {textos.home.subtituloPrincipal}
                </p>
              </div>

              <aside className="home-hero__stats">
                <div className="home-hero__stat">
                  <span>Projeto</span>
                  <strong>Prodigi</strong>
                </div>
                <div className="home-hero__stat">
                  <span>Área</span>
                  <strong>Saúde</strong>
                </div>
                <div className="home-hero__stat">
                  <span>Tecnologia</span>
                  <strong>XGBoost IA</strong>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Secção de Hospitais */}
      <section className="home-hospitals">
        <div className="container">
          <div className="home-hospitals__header">
            <div>
              <h2 className="hospital-section__title">
                {textos.home.tituloHospitais}
              </h2>
              <p className="hospital-section__subtitle">
                Tempos reais calculados por Inteligência Artificial
              </p>
            </div>

            <div className="hospital-section__actions">
              <input
                type="search"
                className="hospital-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar..."
              />
              <div className="hospital-section__scroll">
                <button onClick={scrollLeft} className="hospital-arrow">
                  ←
                </button>
                <button onClick={scrollRight} className="hospital-arrow">
                  →
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="home-empty">
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="hgrid" ref={scrollRef}>
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="hgrid" ref={scrollRef}>
              {filteredHospitais.map((h) => (
                <HospitalCard
                  key={h.idhosp || h.id}
                  hospital={h}
                  onClick={handleCardClick}
                  textos={textos}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Secção de Informações (carrossel) */}
      <section className="home-info">
        <div className="container">
          <h2 className="info-carousel__title">Informações Adicionais</h2>
          <div className="info-carousel__wrapper">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Informação adicional"
                className={`info-carousel__image ${
                  idx === currentSlide ? 'active' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}