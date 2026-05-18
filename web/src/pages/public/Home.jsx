import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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

function StatCard({ label, value, note }) {
  return (
    <div className="home-stat">
      <span className="home-stat__label">{label}</span>
      <strong className="home-stat__value">{value}</strong>
      <p className="home-stat__note">{note}</p>
    </div>
  );
}

function TrustCard({ icon, title, text }) {
  return (
    <article className="home-trustcard">
      <span className="home-trustcard__icon">{icon}</span>
      <div className="home-trustcard__content">
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function HospitalCard({ hospital, onClick, textos }) {
  const espera = hospital.previsoes_ia?.Medium ?? hospital.previsoes_ia?.medium;
  const ativo = hospital.ativo !== false;

  return (
    <article className={`hcard ${!ativo ? 'hcard--offline' : ''}`}>
      <div className="hcard__top">
        <div className="hcard__namewrap">
          <span className="hcard__badge">{ativo ? 'Ativo' : 'Indisponível'}</span>
          <h3 className="hcard__name">{hospital.nome}</h3>
        </div>
        <button
          className="btn btn--secondary btn--icon hcard__arrow"
          onClick={() => onClick(hospital)}
          type="button"
          aria-label="Ver detalhes do hospital"
        >
          →
        </button>
      </div>

      <div className="hcard__bottom">
        <div className="hcard__wait">
          <span className="hcard__wait-label">{textos.home?.labelEspera || 'Tempo de espera'}</span>
          <strong className="hcard__wait-value" style={{ color: waitColor(espera) }}>
            {ativo && espera != null ? `${espera} min` : '-- min'}
          </strong>
        </div>

        <button className="btn btn--primary hcard__cta" onClick={() => onClick(hospital)} type="button">
          Ver detalhes
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <article className="hcard hcard--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--wait" />
      <div className="skeleton skeleton--button" />
    </article>
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
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await listarHospitais();
        const listaBase = Array.isArray(data) ? data : data?.data ?? [];
        const listaComIA = await Promise.all(
          listaBase.map(async (h) => ({
            ...h,
            previsoes_ia: await consultarIACompleta(h),
          }))
        );
        setHospitais(listaComIA);
      } catch {
        setError('Não foi possível carregar os dados dos hospitais.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  const filteredHospitais = useMemo(() => {
    const s = query.toLowerCase().trim();
    if (!s) return hospitais;
    return hospitais.filter((h) => {
      const nome = (h.nome || '').toLowerCase();
      const local = (h.morada || h.localizacao || '').toLowerCase();
      return nome.includes(s) || local.includes(s);
    });
  }, [hospitais, query]);

  const totalHospitais = hospitais.length;
  const ativos = hospitais.filter((h) => h.ativo !== false).length;

  const mediaEspera =
    hospitais.length > 0
      ? Math.round(
          hospitais
            .map((h) => h.previsoes_ia?.Medium ?? h.previsoes_ia?.medium)
            .filter((v) => typeof v === 'number')
            .reduce((a, b) => a + b, 0) /
            Math.max(
              1,
              hospitais
                .map((h) => h.previsoes_ia?.Medium ?? h.previsoes_ia?.medium)
                .filter((v) => typeof v === 'number').length
            )
        )
      : null;

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -900, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 900, behavior: 'smooth' });

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__topbar" />
        <div className="container">
          <div className="home-hero__content">
            <div className="home-hero__main">
              <p className="home-hero__eyebrow">Portal público de saúde</p>
              <h1 className="home-hero__title">
                Informação hospitalar clara, atual e acessível num único lugar.
              </h1>
              <p className="home-hero__description">
                Consulte hospitais, acompanhe tempos de espera estimados e encontre rapidamente a informação
                essencial para uma decisão mais informada.
              </p>

              <div className="home-hero__actions">
                <a href="#hospitais" className="btn btn--primary">
                  Consultar hospitais
                </a>
                <a href="#informacoes" className="btn btn--secondary">
                  Ver informações
                </a>
                <a href="/login" className="btn btn--secondary">
                  Login
                </a>
              </div>
            </div>

            <aside className="home-hero__panel">
              <div className="home-hero__live">
                <span className="home-hero__live-dot" />
                <strong>Atualização em tempo real</strong>
                <span>Dados sincronizados automaticamente</span>
              </div>

              <div className="home-hero__statsgrid">
                <StatCard
                  label="Projeto"
                  value="SIAGUH"
                  note="Sistema integrado de apoio ao utente e gestão hospitalar."
                />
                <StatCard
                  label="Tecnologia"
                  value="IA + Dados"
                  note="Previsões de espera com base em informação processada automaticamente."
                />
                <StatCard
                  label="Hospitais"
                  value={String(totalHospitais || '—')}
                  note="Unidades disponíveis para consulta pública."
                />
                <StatCard
                  label="Média estimada"
                  value={mediaEspera != null ? `${mediaEspera} min` : '—'}
                  note="Valor médio dos tempos de espera atualmente carregados."
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="container">
          <div className="home-trust__grid">
            <TrustCard icon="⏱️" title="Consulta rápida" text="Informação organizada para acesso imediato." />
            <TrustCard icon="🧠" title="Análise preditiva" text="Estimativas orientadas por dados e atualizadas automaticamente." />
            <TrustCard icon="🏥" title="Cobertura pública" text={`Hospitais ativos: ${ativos}/${totalHospitais || 0}.`} />
            <TrustCard icon="🔒" title="Experiência clara" text="Interface simples, limpa e centrada no utilizador." />
          </div>
        </div>
      </section>

      <section className="home-hospitals" id="hospitais">
        <div className="container">
          <div className="home-hospitals__header">
            <div>
              <h2 className="home-hospitals__title">Hospitais</h2>
              <p className="home-hospitals__subtitle">
                Pesquisa rápida por nome ou localização, com acesso direto aos detalhes de cada unidade.
              </p>
            </div>

            <div className="home-controls">
              <div className="home-search">
                <span className="home-search__icon">⌕</span>
                <input
                  type="search"
                  className="home-search__input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar hospital..."
                />
              </div>

              <div className="home-scroll-btns">
                <button className="btn btn--secondary btn--icon" onClick={scrollLeft} type="button" aria-label="Anterior">
                  ‹
                </button>
                <button className="btn btn--secondary btn--icon" onClick={scrollRight} type="button" aria-label="Próximo">
                  ›
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="home-empty home-empty--error">
              <span className="home-empty__icon">⚠️</span>
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="hgrid" ref={scrollRef}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
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

      <section className="home-info" id="informacoes">
        <div className="container">
          <div className="home-info__header">
            <h2 className="home-hospitals__title">Informações adicionais</h2>
            <p className="home-hospitals__subtitle">
              Conteúdo institucional de apoio para orientar a navegação e o uso da plataforma.
            </p>
          </div>

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

          <div className="info-carousel__dots">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`info-carousel__dot ${idx === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
                type="button"
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

    
    </div>
  );
}