/**
 * @file Home.jsx
 * @description Página inicial pública do ecossistema SIAGUH.
 * Fornece aos utentes uma visão consolidada dos hospitais da rede,
 * integrando previsões em tempo real geradas pelos módulos de IA.
 */

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

import info1 from '../../imagens/Info1.png';
import info2 from '../../imagens/Info2.png';
import info3 from '../../imagens/Info3.png';
import info4 from '../../imagens/Info4.png';
import info5 from '../../imagens/Info5.png';

/** * @constant {string[]} CAROUSEL_IMAGES 
 * @description Array contendo as imagens importadas para o carrossel de informações adicionais.
 */
const CAROUSEL_IMAGES = [info1, info2, info3, info4, info5];

/**
 * Retorna uma cor hexadecimal correspondente à urgência baseada nos minutos de espera.
 * * @param {number|null} mins - Tempo de espera estimado em minutos.
 * @returns {string} Código de cor hexadecimal para estilização inline.
 */
function waitColor(mins) {
  if (mins == null) return '#94a3b8';
  if (mins <= 20) return '#16a34a';
  if (mins <= 45) return '#ca8a04';
  return '#dc2626';
}

/**
 * Consulta o microsserviço de Inteligência Artificial para obter a listagem
 * completa dos tempos de espera preditivos associados a um hospital.
 * * @async
 * @param {Object} hospital - Objeto representativo da entidade Hospital.
 * @returns {Promise<Object|null>} Objeto mapeado com os tempos de triagem ou null em caso de falha.
 */
async function consultarIACompleta(hospital) {
  try {
    const id = hospital.id_hosp ?? hospital.id;
    const data = await apiFetch(`/api/v1/predict/tempos-espera/${id}`);
    if (!data || !data.tempos_espera) return null;
    
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

/**
 * Cartão de estatística individual exibido no painel lateral da secção Hero.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.label - Título identificador do indicador.
 * @param {string} props.value - Métrica ou texto em destaque.
 * @param {string} props.note - Descrição breve de contexto.
 */
function StatCard({ label, value, note }) {
  return (
    <div className="home-stat">
      <span className="home-stat__label">{label}</span>
      <strong className="home-stat__value">{value}</strong>
      <p className="home-stat__note">{note}</p>
    </div>
  );
}

/**
 * Cartão informativo focado em destacar os pilares de credibilidade do ecossistema.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {string} props.icon - Emoji ou glifo visual.
 * @param {string} props.title - Título do pilar.
 * @param {string} props.text - Corpo de texto explicativo.
 */
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

/**
 * Componente de cartão operacional para representação individual de um hospital.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Object} props.hospital - Dados unificados da instituição hospitalar.
 * @param {Function} props.onClick - Manipulador de clique para navegação detalhada.
 * @param {Object} props.textos - Objeto contendo o dicionário internacional ativo.
 */
function HospitalCard({ hospital, onClick, textos }) {
  const espera = hospital.previsoes_ia?.Medium ?? hospital.previsoes_ia?.medium;
  const ativo = hospital.ativo !== false;

  const tHome = textos?.home || {};
  const tGeral = textos?.geral || {};

  return (
    <article className={`hcard ${!ativo ? 'hcard--offline' : ''}`}>
      <div className="hcard__top">
        <div className="hcard__namewrap">
          <span className="hcard__badge">
            {ativo ? (tHome.statusAtivo ?? 'Ativo') : (tHome.statusIndisponivel ?? 'Indisponível')}
          </span>
          <h3 className="hcard__name">{hospital.nome}</h3>
        </div>
        <button
          className="btn btn--secondary btn--icon hcard__arrow"
          onClick={() => onClick(hospital)}
          type="button"
          aria-label={tHome.ariaVerDetalhes ?? 'Ver detalhes'}
        >
          →
        </button>
      </div>

      <div className="hcard__bottom">
        <div className="hcard__wait">
          <span className="hcard__wait-label">{tHome.labelEspera ?? 'Tempo de espera'}</span>
          <strong className="hcard__wait-value" style={{ color: waitColor(espera) }}>
            {ativo && espera != null ? `${espera} min` : `-- ${tHome.unidadeMinutos ?? 'min'}`}
          </strong>
        </div>

        <button className="btn btn--primary hcard__cta" onClick={() => onClick(hospital)} type="button">
          {tGeral.btnVerDetalhes ?? 'Ver Detalhes'}
        </button>
      </div>
    </article>
  );
}

/**
 * Esqueleto visual animado (Shimmer Effect) utilizado como placeholder de carregamento assíncrono.
 * * @component
 */
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

/**
 * Componente View da Home Page. Orquestra os hooks de renderização,
 * filtros de pesquisa dinâmica e internacionalização global.
 * * @component
 */
export default function Home() {
  const navigate = useNavigate();
  const { textos } = useLanguage();
  
  const tHome = textos?.home || {};
  const tGeral = textos?.geral || {};

  const [hospitais, setHospitais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    /**
     * Recupera as infraestruturas do backend e anexa as predições de inteligência artificial.
     * @async
     */
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const data = await apiFetch('/api/v1/hospitais/');
        const listaBase = Array.isArray(data) ? data : data?.data ?? [];
        
        if (!data || listaBase.length === 0) {
          setHospitais([]);
          return;
        }

        const listaComIA = await Promise.all(
          listaBase.map(async (h) => ({
            ...h,
            previsoes_ia: await consultarIACompleta(h),
          }))
        );
        setHospitais(listaComIA);
      } catch (err) {
        setError(tHome.erroSincronizacao ?? 'Não foi possível estabelecer ligação com o servidor do SIAGUH. Garanta que o backend está ativo e autenticado.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [tHome.erroSincronizacao]);

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
              hospitais.map((h) => h.previsoes_ia?.Medium ?? h.previsoes_ia?.medium).filter((v) => typeof v === 'number').length
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
              <p className="home-hero__eyebrow">{tHome.heroEyebrow ?? 'Portal de saúde'}</p>
              <h1 className="home-hero__title">
                {tHome.heroTitle ?? 'Tempos de espera e informação de saúde num único lugar.'}
              </h1>
              <p className="home-hero__description">
                {tHome.heroDescription ?? 'Acompanhe hospitais, consulte previsões em tempo real e encontre rapidamente a informação mais relevante, com uma experiência clara, moderna e profissional.'}
              </p>

              <div className="home-hero__actions">
                <a href="#hospitais" className="btn btn--primary">
                  {tHome.btnConsultarHospitais ?? 'Consultar hospitais'}
                </a>
                <a href="#informacoes" className="btn btn--secondary">
                  {tHome.btnVerInformacoes ?? 'Ver informações'}
                </a>
              </div>
            </div>

            <aside className="home-hero__panel">
              <div className="home-hero__live">
                <span className="home-hero__live-dot" />
                <strong>{tHome.liveStatus ?? 'Tempo real'}</strong>
                <span>{tHome.liveSubStatus ?? 'Atualizado automaticamente'}</span>
              </div>

              <div className="home-hero__statsgrid">
                <StatCard
                  label={tHome.statProjetoLabel ?? 'Projeto'}
                  value="SIAGUH"
                  note={tHome.statProjetoNote ?? 'Sistema integrado de gestão e apoio ao utente.'}
                />
                <StatCard
                  label={tHome.statAreaLabel ?? 'Área'}
                  value={tHome.statAreaValue ?? 'Saúde'}
                  note={tHome.statAreaNote ?? 'Informação útil para decisões rápidas e seguras.'}
                />
                <StatCard
                  label={tHome.statTecnologiaLabel ?? 'Tecnologia'}
                  value="IA + Dados"
                  note={tHome.statTecnologiaNote ?? 'Previsões de espera e visualização em tempo real.'}
                />
                <StatCard
                  label={tHome.statAtualizacaoLabel ?? 'Atualização'}
                  value={tHome.statAtualizacaoValue ?? 'Automática'}
                  note={mediaEspera != null ? `${tHome.statMediaEstimada ?? 'Média estimada atual:'} ${mediaEspera} min.` : (tGeral.aCarregar || 'A carregar dados.')}
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="home-trust">
        <div className="container">
          <div className="home-trust__grid">
            <TrustCard icon="⏱️" title={tHome.trustTempoRealTitle ?? 'Tempo real'} text={tHome.trustTempoRealText ?? 'Consulta rápida com atualização contínua.'} />
            <TrustCard icon="🧠" title={tHome.trustIaTitle ?? 'IA preditiva'} text={tHome.trustIaText ?? 'Estimativas orientadas por dados.'} />
            <TrustCard icon="🏥" title={tHome.trustCoberturaTitle ?? 'Cobertura'} text={`${tHome.trustCoberturaText ?? 'Hospitais ativos:'} ${ativos}/${totalHospitais || 0}.`} />
            <TrustCard icon="🔒" title={tHome.trustConfiancaTitle ?? 'Confiança'} text={tHome.trustConfiancaText ?? 'Layout limpo, claro e centrado no utente.'} />
          </div>
        </div>
      </section>

      <section className="home-hospitals" id="hospitais">
        <div className="container">
          <div className="home-hospitals__header">
            <div>
              <h2 className="home-hospitals__title">{tHome.seccaoHospitaisTitle ?? 'Hospitais'}</h2>
              <p className="home-hospitals__subtitle">
                {tHome.seccaoHospitaisSubtitle ?? 'Resultados organizados para leitura rápida, com acesso imediato aos detalhes.'}
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
                  placeholder={tHome.placeholderPesquisa ?? 'Pesquisar hospital...'}
                />
              </div>

              <div className="home-scroll-btns">
                <button className="btn btn--secondary btn--icon" onClick={scrollLeft} type="button" aria-label={tGeral.btnAnterior ?? 'Anterior'}>
                  ‹
                </button>
                <button className="btn btn--secondary btn--icon" onClick={scrollRight} type="button" aria-label={tGeral.btnProximo ?? 'Próximo'}>
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
              <p>{tHome.nenhumHospitalEncontrado ?? 'Nenhum hospital encontrado.'}</p>
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
            <h2 className="home-hospitals__title">{tHome.seccaoInfoTitle ?? 'Informações adicionais'}</h2>
          </div>

          <div className="info-carousel__wrapper">
            {CAROUSEL_IMAGES.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${tHome.altImagemAdicional ?? 'Informação adicional'} ${idx + 1}`}
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
                aria-label={`${tHome.ariaSlide ?? 'Slide'} ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
