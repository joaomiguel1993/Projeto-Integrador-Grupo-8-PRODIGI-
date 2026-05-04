import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Importação direta das imagens (recuando 2 pastas: pages e public)
import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

const ITEMS_PER_PAGE = 6;

// 2. Colocamos as variáveis importadas diretamente no array (sem aspas)
const carouselImages = [
  info1,
  info2,
  info3,
  info4,
  info5
];

export default function Home() {
  const navigate = useNavigate();
  const [hospitais, setHospitais] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estado para controlar o slide atual do carrossel
  const [currentSlide, setCurrentSlide] = useState(0);

  // Efeito para carregar os hospitais
  useEffect(() => {
    async function loadHospitais() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/hospitais/');
        
        if (!response.ok) {
          throw new Error('Erro ao obter hospitais');
        }

        const data = await response.json();
        setHospitais(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar hospitais:', error);
        setHospitais([]);
      } finally {
        setLoading(false);
      }
    }

    loadHospitais();
  }, []);

  // Efeito para o temporizador do Carrossel (6 em 6 segundos)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 6000);

    // Limpa o temporizador se o componente for desmontado para evitar memory leaks
    return () => clearInterval(timer);
  }, []);

  const grupos = useMemo(() => {
    const result = [];
    for (let i = 0; i < hospitais.length; i += ITEMS_PER_PAGE) {
      result.push(hospitais.slice(i, i + ITEMS_PER_PAGE));
    }
    return result;
  }, [hospitais]);

  const totalPages = grupos.length;
  const hospitaisVisiveis = grupos[page] || [];

  const previousPage = () => {
    setPage((current) => Math.max(current - 1, 0));
  };

  const nextPage = () => {
    setPage((current) => Math.min(current + 1, Math.max(totalPages - 1, 0)));
  };

  return (
    <>
      <section className="intro-section">
        <div className="container">
          <div className="intro-box">
            <p className="section-label">Introdução</p>
            <h1 className="intro-title">
              SIAGUH — Sistema Integrado de Apoio à Gestão de Urgências Hospitalares
            </h1>
            <p className="intro-text">
              Plataforma de apoio à gestão hospitalar, urgências, internamentos e organização dos profissionais de saúde.
            </p>

            <div className="intro-highlights">
              <div className="intro-highlight">
                <span>Projeto</span>
                <strong>Grupo 8 · PRODIGI</strong>
              </div>
              <div className="intro-highlight">
                <span>Área</span>
                <strong>Urgências e internamentos</strong>
              </div>
              <div className="intro-highlight">
                <span>Tecnologia</span>
                <strong>FastAPI · PostgreSQL · Docker</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hospital-section">
        <div className="container">
          <div className="hospital-section__header">
            <div>
              <p className="section-label">Hospitais</p>
              <h2 className="hospital-section__title">Hospitais disponíveis e tempos de espera</h2>
              <p className="hospital-section__subtitle">
                Consulta rápida das unidades registadas no sistema.
              </p>
            </div>

            <div className="hospital-arrows">
              <button
                type="button"
                className="hospital-arrow"
                onClick={previousPage}
                disabled={page === 0 || loading}
              >
                ←
              </button>

              <button
                type="button"
                className="hospital-arrow"
                onClick={nextPage}
                disabled={page >= totalPages - 1 || loading || totalPages === 0}
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <div className="hospital-loading">A carregar hospitais...</div>
          ) : hospitais.length === 0 ? (
            <div className="hospital-loading">Não existem hospitais a apresentar.</div>
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

                      <span className="hospital-card__status">Disponível</span>
                    </div>

                    <div className="hospital-card__wait">
                      <span className="hospital-card__label">Tempo de espera</span>
                      <strong>-- min</strong>
                    </div>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="hospital-pagination">
                  {grupos.map((_, index) => (
                    <span
                      key={index}
                      className={`hospital-pagination__dot ${index === page ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* --- NOVA INFO SECTION COM CARROSSEL --- */}
      <section className="info-section">
        <div className="container">
          <div className="info-box-carousel">
            <p className="section-label">Mais informações</p>
            <h2 className="info-title">Destaques e Informações</h2>
            
            <div className="carousel-wrapper">
              {/* Imagens do Carrossel */}
              {carouselImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className={`carousel-image ${index === currentSlide ? 'active' : ''}`}
                />
              ))}

              {/* Pontos de Navegação do Carrossel (Indicadores) */}
              <div className="carousel-indicators">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir para o slide ${index + 1}`}
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