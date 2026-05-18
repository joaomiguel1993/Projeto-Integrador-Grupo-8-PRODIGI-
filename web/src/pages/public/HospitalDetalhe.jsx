// src/pages/public/HospitalDetalhe.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

function getWaitLabel(value) {
  return value == null ? '-- min' : `${value} min`;
}

function getWaitTone(value) {
  if (value == null) return 'neutral';
  if (value <= 20)   return 'green';
  if (value <= 45)   return 'yellow';
  return 'red';
}

function buildGoogleMapsUrl(hospital) {
  const query = encodeURIComponent(
    hospital?.morada || hospital?.localizacao || hospital?.nome || 'Hospital'
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function buildEmbedUrl(hospital) {
  const query = encodeURIComponent(
    hospital?.morada || hospital?.localizacao || hospital?.nome || 'Hospital'
  );
  return `https://www.google.com/maps?q=${query}&z=15&output=embed`;
}

function TriageCard({ label, value, tone }) {
  return (
    <article className={`triage-card triage-card--${tone}`}>
      <span className="triage-card__label">{label}</span>
      <strong className="triage-card__value">{getWaitLabel(value)}</strong>
    </article>
  );
}

export default function HospitalDetalhe() {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const { textos }  = useLanguage();

  const [hospital, setHospital] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [erro,     setErro]     = useState('');

  useEffect(() => {
    async function loadHospital() {
      try {
        setLoading(true);
        setErro('');

        const [respHosp, respPainel] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/hospitais/${id}`),
          fetch(`http://localhost:8000/api/v1/predict/tempos-espera/${id}`),
        ]);

        if (!respHosp.ok) throw new Error('Erro ao carregar hospital');

        const dataHosp   = await respHosp.json();
        const dataPainel = respPainel.ok ? await respPainel.json() : null;

        setHospital({
          ...dataHosp,
          espera_vermelho: dataPainel?.tempos_espera?.vermelho?.minutos ?? null,
          espera_laranja:  dataPainel?.tempos_espera?.laranja?.minutos  ?? null,
          espera_amarelo:  dataPainel?.tempos_espera?.amarelo?.minutos  ?? null,
          espera_verde:    dataPainel?.tempos_espera?.verde?.minutos    ?? null,
          espera_azul:     dataPainel?.tempos_espera?.azul?.minutos     ?? null,
        });
      } catch {
        setErro('Não foi possível carregar os dados do hospital.');
      } finally {
        setLoading(false);
      }
    }
    loadHospital();
  }, [id]);

  const mapUrl   = useMemo(() => hospital ? buildGoogleMapsUrl(hospital) : '#', [hospital]);
  const embedUrl = useMemo(() => hospital ? buildEmbedUrl(hospital)       : '',  [hospital]);

  if (loading) {
    return (
      <main className="hosp-detail hosp-detail--state">
        <div className="container">
          <div className="hosp-detail__state">
            <div className="perfil-loading__spinner" />
            <p>{textos.geral?.aCarregar || 'A carregar...'}</p>
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
            <p>{erro || 'Hospital não encontrado.'}</p>
            <button className="btn btn--secondary" onClick={() => navigate('/')}>
              {textos.geral?.voltar || 'Voltar'}
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
            ← {textos.geral?.voltar || 'Voltar'}
          </button>

          <div className="hosp-detail__hero-body">
            <div className="hosp-detail__hero-text">
              <span className="hosp-detail__eyebrow">
                {textos.home?.labelHospitais || 'Hospital'}
              </span>
              <h1 className="hosp-detail__title">{hospital.nome}</h1>
              <p className="hosp-detail__subtitle">
                {hospital.localizacao || hospital.morada || 'Informação de localização disponível na ficha do hospital.'}
              </p>
            </div>

            <div className={`hosp-detail__kpi hosp-detail__kpi--${getWaitTone(hospital.espera_amarelo)}`}>
              <span className="hosp-detail__kpi-label">
                {textos.home?.labelEspera || 'Tempo de espera'}
              </span>
              <strong className="hosp-detail__kpi-value">
                {getWaitLabel(hospital.espera_amarelo)}
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
                <h2 className="hosp-card__title">Informação geral</h2>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hosp-card__link"
                >
                  Abrir no Google Maps ↗
                </a>
              </div>

              <div className="hosp-info-grid">
                <div className="hosp-info-item">
                  <span className="hosp-info-item__label">Email</span>
                  <strong className="hosp-info-item__value">
                    {hospital.email || 'Não disponível'}
                  </strong>
                </div>
                <div className="hosp-info-item">
                  <span className="hosp-info-item__label">Telefone</span>
                  <strong className="hosp-info-item__value">
                    {hospital.telefone || 'Não disponível'}
                  </strong>
                </div>
                <div className="hosp-info-item hosp-info-item--full">
                  <span className="hosp-info-item__label">Morada</span>
                  <strong className="hosp-info-item__value">
                    {hospital.morada || hospital.localizacao || 'Não disponível'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Triagem */}
            <div className="hosp-card">
              <div className="hosp-card__header">
                <h2 className="hosp-card__title">Tempos de espera por triagem</h2>
              </div>

              <div className="triage-grid">
                <TriageCard label="Vermelho" value={hospital.espera_vermelho} tone="red"    />
                <TriageCard label="Laranja"  value={hospital.espera_laranja}  tone="orange" />
                <TriageCard label="Amarelo"  value={hospital.espera_amarelo}  tone="yellow" />
                <TriageCard label="Verde"    value={hospital.espera_verde}    tone="green"  />
                <TriageCard label="Azul"     value={hospital.espera_azul}     tone="blue"   />
              </div>
            </div>

          </div>

          {/* Sidebar: mapa */}
          <aside className="hosp-detail__side">
            <div className="hosp-card hosp-card--map">
              <div className="hosp-card__header">
                <h2 className="hosp-card__title">Localização</h2>
              </div>

              <div className="hosp-map-embed">
                <iframe
                  title={`Mapa de ${hospital.nome}`}
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
                Ver rota no Google Maps →
              </a>
            </div>
          </aside>

        </div>
      </section>

    </main>
  );
}