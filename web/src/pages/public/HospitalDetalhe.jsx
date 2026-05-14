import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import '../../styles/main.css';

function getWaitLabel(value) {
  if (value == null) return '-- min';
  return `${value} min`;
}

function getWaitTone(value) {
  if (value == null) return 'neutral';
  if (value <= 20) return 'green';
  if (value <= 45) return 'yellow';
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
    <article className={`hospital-triage-card hospital-triage-card--${tone}`}>
      <span className="hospital-triage-card__label">{label}</span>
      <strong className="hospital-triage-card__value">{getWaitLabel(value)}</strong>
    </article>
  );
}

export default function HospitalDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { textos } = useLanguage();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function loadHospital() {
      try {
        setLoading(true);
        setErro('');

        const [respHosp, respPainel] = await Promise.all([
          fetch(`http://localhost:8000/api/hospitais/${id}`),
          fetch(`http://localhost:8000/api/painel/tempos-espera/${id}`)
        ]);

        if (!respHosp.ok) throw new Error('Erro ao carregar hospital');

        const dataHosp = await respHosp.json();
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

  const mapUrl = useMemo(() => (hospital ? buildGoogleMapsUrl(hospital) : '#'), [hospital]);
  const embedUrl = useMemo(() => (hospital ? buildEmbedUrl(hospital) : ''), [hospital]);

  if (loading) {
    return (
      <main className="hospital-detail-pro hospital-detail-pro--state">
        <div className="container">
          <div className="hospital-detail-state">{textos.geral?.aCarregar || 'A carregar...'}</div>
        </div>
      </main>
    );
  }

  if (erro || !hospital) {
    return (
      <main className="hospital-detail-pro hospital-detail-pro--state">
        <div className="container">
          <div className="hospital-detail-state hospital-detail-state--error">{erro || 'Hospital não encontrado.'}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="hospital-detail-pro" role="main">
      <section className="hospital-detail-hero">
        <div className="container hospital-detail-hero__inner">
          <button type="button" className="hospital-detail-back" onClick={() => navigate('/')}>
            {textos.geral?.voltar || 'Voltar'}
          </button>

          <div className="hospital-detail-hero__top">
            <div>
              <span className="hospital-detail-eyebrow">{textos.home?.labelHospitais || 'Hospitais'}</span>
              <h1 className="hospital-detail-title">{hospital.nome}</h1>
              <p className="hospital-detail-subtitle">
                {hospital.localizacao || hospital.morada || 'Informação de localização disponível na ficha do hospital.'}
              </p>
            </div>

            <div className="hospital-detail-kpi">
              <span>{textos.home?.labelEspera || 'Tempo de espera'}</span>
              <strong>{getWaitLabel(hospital.espera_amarelo)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="hospital-detail-content">
        <div className="container hospital-detail-grid">
          <div className="hospital-detail-main">
            <section className="hospital-detail-card">
              <div className="hospital-detail-card__header">
                <h2>Informação geral</h2>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hospital-detail-link">
                  Abrir no Google Maps
                </a>
              </div>

              <div className="hospital-detail-info-grid">
                <div className="hospital-detail-info-item">
                  <span>Email</span>
                  <strong>{hospital.email || 'Não disponível'}</strong>
                </div>
                <div className="hospital-detail-info-item">
                  <span>Telefone</span>
                  <strong>{hospital.telefone || 'Não disponível'}</strong>
                </div>
                <div className="hospital-detail-info-item hospital-detail-info-item--full">
                  <span>Morada</span>
                  <strong>{hospital.morada || hospital.localizacao || 'Não disponível'}</strong>
                </div>
              </div>
            </section>

            <section className="hospital-detail-card">
              <div className="hospital-detail-card__header">
                <h2>Tempos de espera por triagem</h2>
              </div>

              <div className="hospital-triage-grid">
                <TriageCard label="Vermelho" value={hospital.espera_vermelho} tone="red" />
                <TriageCard label="Laranja" value={hospital.espera_laranja} tone="orange" />
                <TriageCard label="Amarelo" value={hospital.espera_amarelo} tone="yellow" />
                <TriageCard label="Verde" value={hospital.espera_verde} tone="green" />
                <TriageCard label="Azul" value={hospital.espera_azul} tone="blue" />
              </div>
            </section>
          </div>

          <aside className="hospital-detail-side">
            <section className="hospital-detail-card hospital-detail-card--map">
              <div className="hospital-detail-card__header">
                <h2>Localização</h2>
              </div>

              <div className="hospital-map-embed">
                <iframe
                  title={`Mapa de ${hospital.nome}`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hospital-map-open">
                Ver rota no Google Maps
              </a>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}