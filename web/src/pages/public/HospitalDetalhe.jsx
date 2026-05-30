/**
 * @file HospitalDetalhe.jsx
 * @description Página pública de detalhes de uma unidade hospitalar específica.
 * Apresenta informações de contacto, mapas de localização geográfica e a
 * decomposição dos tempos de espera previstos por modelo de IA para cada cor de triagem.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

/**
 * Formata o valor numérico dos minutos adicionando o sufixo traduzido.
 * @param {number|null} value - Quantidade de minutos estimada.
 * @param {string} [fallback='-- min'] - Sufixo ou texto padrão de ausência de dados.
 * @returns {string} Texto formatado para exibição na interface.
 */
function getWaitLabel(value, fallback = '-- min') {
  return value == null ? fallback : `${value} min`;
}

/**
 * Mapeia o tempo de espera para um modificador de estilo ou tom visual (CSS).
 * @param {number|null} value - Minutos de espera.
 * @returns {string} Classe de tom correspondente ('neutral'|'green'|'yellow'|'red').
 */
function getWaitTone(value) {
  if (value == null) return 'neutral';
  if (value <= 20)   return 'green';
  if (value <= 45)   return 'yellow';
  return 'red';
}

/**
 * Constrói a URL externa do Google Maps para navegação baseada nos dados do hospital.
 * @param {Object} hospital - Objeto de dados do hospital.
 * @returns {string} URL de redirecionamento externa.
 */
function buildGoogleMapsUrl(hospital) {
  const query = encodeURIComponent(
    hospital?.morada || hospital?.localizacao || hospital?.nome || 'Hospital'
  );
  // CORREÇÃO: Aplicada a sintaxe correta de template literals `${query}`
  return `https://maps.google.com/?q=${query}`;
}

/**
 * Constrói a URL de incorporação (Embed) utilizada no iframe do mapa da página.
 * @param {Object} hospital - Objeto de dados do hospital.
 * @returns {string} URL parametrizada para o iframe do Google Maps.
 */
function buildEmbedUrl(hospital) {
  const query = encodeURIComponent(
    hospital?.morada || hospital?.localizacao || hospital?.nome || 'Hospital'
  );
  // CORREÇÃO: Aplicada a sintaxe correta de template literals `${query}`
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}

/**
 * Componente visual interno que renderiza uma linha/cartão de triagem de Manchester.
 * @component
 * @param {Object} props
 * @param {string} props.label - Nome ou cor da triagem (ex: Vermelho, Laranja).
 * @param {number|null} props.value - Tempo estimado em minutos.
 * @param {string} props.tone - Modificador de estilo CSS associado à cor.
 * @param {string} props.fallbackText - Texto de fallback caso o valor seja nulo.
 */
function TriageCard({ label, value, tone, fallbackText }) {
  return (
    <article className={`triage-card triage-card--${tone}`}>
      <span className="triage-card__label">{label}</span>
      <strong className="triage-card__value">{getWaitLabel(value, fallbackText)}</strong>
    </article>
  );
}

/**
 * Componente principal de visualização detalhada do Hospital.
 * Consome o ecossistema FastAPI e reage dinamicamente à alteração de idioma.
 * @component
 */
export default function HospitalDetalhe() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { textos }  = useLanguage();

  // Aliases de segurança para o sistema internacional de tradução
  const tGeral = textos?.geral || {};
  const tHome  = textos?.home || {};
  const tHosp  = textos?.hospitalDetalhe || {};

  const [hospital, setHospital] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState('');

  useEffect(() => {
    /**
     * Carrega concorrentemente a ficha do hospital e as predições do painel de IA.
     * @async
     */
    async function loadHospital() {
      try {
        setLoading(true);
        setErro('');

        const [dataHosp, dataPainel] = await Promise.all([
          apiFetch(`/api/v1/hospitais/${id}`),
          apiFetch(`/api/v1/predict/tempos-espera/${id}`).catch(() => null),
        ]);

        if (!dataHosp) throw new Error('Erro ao carregar dados');

        setHospital({
          ...dataHosp,
          espera_vermelho: dataPainel?.tempos_espera?.vermelho?.minutos ?? null,
          espera_laranja:  dataPainel?.tempos_espera?.laranja?.minutos  ?? null,
          espera_amarelo:  dataPainel?.tempos_espera?.amarelo?.minutos  ?? null,
          espera_verde:    dataPainel?.tempos_espera?.verde?.minutos    ?? null,
          espera_azul:     dataPainel?.tempos_espera?.azul?.minutos     ?? null,
        });
      } catch (err) {
        setErro(tHosp.erroCarregamento ?? 'Não foi possível carregar os dados detalhados deste hospital.');
      } finally {
        setLoading(false);
      }
    }
    loadHospital();
  }, [id, tHosp.erroCarregamento]);

  const mapUrl   = useMemo(() => hospital ? buildGoogleMapsUrl(hospital) : '#', [hospital]);
  const embedUrl = useMemo(() => hospital ? buildEmbedUrl(hospital)       : '',  [hospital]);

  const fallbackMinutos = `-- ${tHome.unidadeMinutos || 'min'}`;

  if (loading) {
    return (
      <main className="hosp-detail hosp-detail--state">
        <div className="container">
          <div className="hosp-detail__state">
            <div className="perfil-loading__spinner" />
            <p>{tGeral.aCarregar || 'A carregar...'}</p>
          </div>
        </div>
      </main>
    );
  }

  if (erro || !hospital) {
    return (
      <main className="hosp-detail hosp-detail--state">
        <div className="container">
          <div className="hosp-detail__state hosp-detail__state--error">
            <span>⚠️</span>
            <p>{erro || (tHosp.naoEncontrado ?? 'Hospital não encontrado.')}</p>
            <button className="btn btn--secondary" onClick={() => navigate('/')}>
              {tGeral.voltar || 'Voltar'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="hosp-detail" role="main">
      {/* ── HERO ── */}
      <section className="hosp-detail__hero">
        <div className="container hosp-detail__hero-inner">
          <button
            type="button"
            className="btn-back"
            onClick={() => navigate('/')}
          >
            ← {tGeral.voltar || 'Voltar'}
          </button>

          <div className="hosp-detail__hero-body">
            <div className="hosp-detail__hero-text">
              <span className="hosp-detail__eyebrow">
                {tHome.labelHospitais || 'Hospital'}
              </span>
              <h1 className="hosp-detail__title">{hospital.nome}</h1>
              <p className="hosp-detail__subtitle">
                {hospital.localizacao || hospital.morada || (tHosp.semLocalizacaoDefinida ?? 'Informação de localização disponível na ficha do hospital.')}
              </p>
            </div>

            <div className={`hosp-detail__kpi hosp-detail__kpi--${getWaitTone(hospital.espera_amarelo)}`}>
              <span className="hosp-detail__kpi-label">
                {tHome.labelEspera || 'Tempo de espera'}
              </span>
              <strong className="hosp-detail__kpi-value">
                {getWaitLabel(hospital.espera_amarelo, fallbackMinutos)}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTEÚDO ── */}
      <section className="hosp-detail__content">
        <div className="container hosp-detail__grid">

          {/* Coluna principal */}
          <div className="hosp-detail__main">

            {/* Informação geral */}
            <div className="hosp-card">
              <div className="hosp-card__header">
                <h2 className="hosp-card__title">{tHosp.tituloInfoGeral ?? 'Informação geral'}</h2>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hosp-card__link"
                >
                  {tHosp.linkGoogleMaps ?? 'Abrir no Google Maps ↗'}
                </a>
              </div>

              <div className="hosp-info-grid">
                <div className="hosp-info-item">
                  <span className="hosp-info-item__label">{tHosp.labelEmail ?? 'Email'}</span>
                  <strong className="hosp-info-item__value">
                    {hospital.email || (tHosp.valorNaoDisponivel ?? 'Não disponível')}
                  </strong>
                </div>
                <div className="hosp-info-item">
                  <span className="hosp-info-item__label">{tHosp.labelTelefone ?? 'Telefone'}</span>
                  <strong className="hosp-info-item__value">
                    {hospital.telefone || (tHosp.valorNaoDisponivel ?? 'Não disponível')}
                  </strong>
                </div>
                <div className="hosp-info-item hosp-info-item--full">
                  <span className="hosp-info-item__label">{tHosp.labelMorada ?? 'Morada'}</span>
                  <strong className="hosp-info-item__value">
                    {hospital.morada || hospital.localizacao || (tHosp.valorNaoDisponivel ?? 'Não disponível')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Triagem */}
            <div className="hosp-card">
              <div className="hosp-card__header">
                <h2 className="hosp-card__title">{tHosp.tituloTriagem ?? 'Tempos de espera por triagem'}</h2>
              </div>

              <div className="triage-grid">
                <TriageCard label={tHosp.triagemVermelho ?? 'Vermelho'} value={hospital.espera_vermelho} tone="red" fallbackText={fallbackMinutos} />
                <TriageCard label={tHosp.triagemLaranja ?? 'Laranja'}  value={hospital.espera_laranja}  tone="orange" fallbackText={fallbackMinutos} />
                <TriageCard label={tHosp.triagemAmarelo ?? 'Amarelo'}  value={hospital.espera_amarelo}  tone="yellow" fallbackText={fallbackMinutos} />
                <TriageCard label={tHosp.triagemVerde ?? 'Verde'}    value={hospital.espera_verde}    tone="green" fallbackText={fallbackMinutos} />
                <TriageCard label={tHosp.triagemAzul ?? 'Azul'}     value={hospital.espera_azul}     tone="blue" fallbackText={fallbackMinutos} />
              </div>
            </div>
          </div>

          {/* Sidebar: mapa */}
          <aside className="hosp-detail__side">
            <div className="hosp-card hosp-card--map">
              <div className="hosp-card__header">
                <h2 className="hosp-card__title">{tHosp.tituloLocalizacao ?? 'Localização'}</h2>
              </div>

              <div className="hosp-map-embed">
                <iframe
                  title={`${tHosp.iframeMapaDe ?? 'Mapa de'} ${hospital.nome}`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  className="hosp-map-embed__iframe"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hosp-map-open"
              >
                {tHosp.btnVerRota ?? 'Ver rota no Google Maps →'}
              </a>
            </div>
          </aside>

        </div>
      </section>
    </main>
  );
}
