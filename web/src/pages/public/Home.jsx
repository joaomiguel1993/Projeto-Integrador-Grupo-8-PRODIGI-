import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext'; // Importação do Contexto

// Importação das imagens
import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

const ITEMS_PER_PAGE = 6;

/**
 * @file Home.jsx
 * @description Landing page pública do SIAGUH com suporte multi-idioma (PT/EN).
 * 
 * @component
 */
export default function Home() {
  const navigate = useNavigate();
  const { textos } = useLanguage(); // Aceder aos textos dinâmicos
  const [hospitais, setHospitais] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [info1, info2, info3, info4, info5];

  useEffect(() => {
    async function loadHospitais() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/hospitais/');
        if (!response.ok) throw new Error('Erro API');
        const data = await response.json();
        setHospitais(Array.isArray(data) ? data : []);
      } catch (error) {
        setHospitais([]);
      } finally {
        setLoading(false);
      }
    }
    loadHospitais();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  const grupos = useMemo(() => {
    const result = [];
    for (let i = 0; i < hospitais.length; i += ITEMS_PER_PAGE) {
      result.push(hospitais.slice(i, i + ITEMS_PER_PAGE));
    }
    return result;
  }, [hospitais]);

  const totalPages = grupos.length;
  const hospitaisVisiveis = grupos[page] || [];

  const previousPage = () => setPage((current) => Math.max(current - 1, 0));
  const nextPage = () => setPage((current) => Math.min(current + 1, Math.max(totalPages - 1, 0)));

  return (
    <>
      {/* SECÇÃO INTRODUÇÃO */}
      <section className="intro-section" aria-labelledby="intro-title">
        <div className="container">
          <div className="intro-box">
            <p className="section-label" aria-hidden="true">{textos.home.labelIntro}</p>
            <h1 id="intro-title" className="intro-title">{textos.home.tituloPrincipal}</h1>
            <p className="intro-text">{textos.home.subtituloPrincipal}</p>

            <div className="intro-highlights">
              <div className="intro-highlight">
                <span>{textos.home.labelProjeto}</span>
                <strong>{textos.home.valorProjeto}</strong>
              </div>
              <div className="intro-highlight">
                <span>{textos.home.labelArea}</span>
                <strong>{textos.home.valorArea}</strong>
              </div>
              <div className="intro-highlight">
                <span>{textos.home.labelTech}</span>
                <strong>{textos.home.valorTech}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECÇÃO HOSPITAIS */}
      <section className="hospital-section" aria-labelledby="hospitais-title">
        <div className="container">
          <div className="hospital-section__header">
            <div>
              <p className="section-label" aria-hidden="true">{textos.home.labelHospitais}</p>
              <h2 id="hospitais-title" className="hospital-section__title">{textos.home.tituloHospitais}</h2>
              <p className="hospital-section__subtitle">{textos.home.subtituloHospitais}</p>
            </div>

            <div className="hospital-arrows" role="group" aria-label={textos.home.ariaPaginacao}>
              <button
                type="button"
                className="hospital-arrow"
                onClick={previousPage}
                disabled={page === 0 || loading}
                aria-label={textos.home.btnAnterior}
              >
                ←
              </button>
              <button
                type="button"
                className="hospital-arrow"
                onClick={nextPage}
                disabled={page >= totalPages - 1 || loading || totalPages === 0}
                aria-label={textos.home.btnSeguinte}
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="hospital-loading" aria-busy="true">{textos.geral.aCarregar}</div>
          ) : hospitais.length === 0 ? (
            <div className="hospital-loading">{textos.geral.semResultados}</div>
          ) : (
            <>
              <div className="hospital-grid--paged">
                {hospitaisVisiveis.map((hospital) => (
                  <article key={hospital.idhosp} className="hospital-card">
                    <div className="hospital-card__top">
                      <div>
                        <h3>{hospital.nome}</h3>
                        <p>{hospital.localizacao}</p>
                      </div>
                      <span className="hospital-card__status">{textos.home.statusDisponivel}</span>
                    </div>
                    <div className="hospital-card__wait">
                      <span className="hospital-card__label">{textos.home.labelEspera}</span>
                      <strong>{textos.home.valorEsperaIndisponivel}</strong>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="hospital-pagination" role="tablist" aria-label={textos.home.ariaDots}>
                  {grupos.map((_, index) => (
                    <span
                      key={index}
                      className={`hospital-pagination__dot ${index === page ? 'is-active' : ''}`}
                      aria-current={index === page ? 'step' : undefined}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* SECÇÃO INFO COM CARROSSEL */}
      <section className="info-section" aria-labelledby="info-title">
        <div className="container">
          <div className="info-box-carousel">
            <p className="section-label" aria-hidden="true">{textos.home.labelInfo}</p>
            <h2 id="info-title" className="info-title">{textos.home.tituloInfo}</h2>
            
            <div className="carousel-wrapper" role="region" aria-roledescription="carousel" aria-label={textos.home.ariaCarrossel}>
              <div aria-live="polite">
                {carouselImages.map((img, index) => (
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
                {carouselImages.map((_, index) => (
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