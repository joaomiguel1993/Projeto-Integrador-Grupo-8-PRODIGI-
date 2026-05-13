import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { obterHospitalPorId } from '../../services/hospitais';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

export default function HospitalView() {
    const { id } = useParams();
    const location = useLocation();

    const [hospital, setHospital] = useState(location.state?.hospitalData || null);
    const [previsoes, setPrevisoes] = useState(null);
    const [loading, setLoading] = useState(true);

    const obterContextoIA = () => {
        const agora = new Date();
        const meses = ["Winter", "Winter", "Spring", "Spring", "Spring", "Summer", "Summer", "Summer", "Autumn", "Autumn", "Autumn", "Winter"];
        const hora = agora.getHours();
        return {
            Day_of_Week: agora.toLocaleDateString('en-US', { weekday: 'long' }),
            Season: meses[agora.getMonth()],
            Time_of_Day: hora >= 6 && hora < 12 ? "Morning" : hora >= 12 && hora < 18 ? "Afternoon" : "Evening"
        };
    };

    const buscarDadosIA = async (h) => {
        try {
            const ctx = obterContextoIA();
            
            // MAPEAMENTO COM A VISTA SQL v_estatisticas_ia
            const enfermeiros = h.contagem_enfermeiros || 1;
            const pacientes = h.pacientes_ativos || 1;
            
            const body = {
                "Urgency_Level": "Medium",
                // Cálculo do rácio baseado na vista SQL
                "Nurse_to_Patient_Ratio": parseFloat((enfermeiros / pacientes).toFixed(2)),
                // Especialistas ativos vindos da vista SQL
                "Specialist_Availability": h.contagem_medicos || 1,
                // Tamanho da unidade vindo da vista SQL (TotalCamas)
                "Facility_Size_Beds": h.facility_size_beds || 100,
                ...ctx
            };

            const response = await fetch(`${API_IA}/predict/wait-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            setPrevisoes(data);
        } catch (err) {
            console.error("Erro ao carregar tempos de espera:", err);
        }
    };

    useEffect(() => {
        async function carregarPagina() {
            setLoading(true);
            let dadosHospital = hospital;

            // Se não veio da Home ou se os dados da Home não têm as contagens da IA
            if (!dadosHospital || !dadosHospital.pacientes_ativos) {
                dadosHospital = await obterHospitalPorId(id);
                setHospital(dadosHospital);
            }

            if (dadosHospital) {
                await buscarDadosIA(dadosHospital);
            }
            setLoading(false);
        }
        carregarPagina();
    }, [id]);

    if (loading || !hospital) return <div className="p-10">A carregar hospital...</div>;

    const tempoMedioHeader = previsoes?.Medium || "--";

    return (
        <div className="hospital-detail-page">
            <header className="hospital-header">
                <div className="header-info">
                    <h1>{hospital.nome}</h1>
                    <p>{hospital.localizacao}</p>
                </div>
                
                <div className="header-wait-time-box">
                    <span className="label">TEMPO DE ESPERA</span>
                    <strong className="time">{tempoMedioHeader} min</strong>
                </div>
            </header>

            <section className="triage-section">
                <h3>Tempos de espera por triagem</h3>
                <div className="triage-grid">
                    <div className="card red">
                        <span>VERMELHO</span>
                        <strong>{previsoes?.Critical ?? '--'} min</strong>
                    </div>
                    <div className="card orange">
                        <span>LARANJA</span>
                        <strong>{previsoes?.High ?? '--'} min</strong>
                    </div>
                    <div className="card yellow">
                        <span>AMARELO</span>
                        <strong>{previsoes?.Medium ?? '--'} min</strong>
                    </div>
                    <div className="card green">
                        <span>VERDE</span>
                        <strong>{previsoes?.Low ?? '--'} min</strong>
                    </div>
                    <div className="card blue">
                        <span>AZUL</span>
                        <strong>{previsoes?.["Not Urgent"] ?? '--'} min</strong>
                    </div>
                </div>
            </section>
        </div>
    );
}