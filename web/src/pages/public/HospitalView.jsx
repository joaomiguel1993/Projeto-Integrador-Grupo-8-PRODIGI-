import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { obterHospitalPorId } from '../../services/hospitais';

const API_IA = import.meta.env.VITE_API_IA_URL || 'http://localhost:8001';

export default function HospitalView() {
    const { id } = useParams();
    const location = useLocation();

    // Estados para o Hospital e para as Predições da IA
    const [hospital, setHospital] = useState(location.state?.hospitalData || null);
    const [previsoes, setPrevisoes] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Função para calcular o contexto temporal (Obrigatório para a API da imagem image_827dbc.png)
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

    // 2. Função que liga para a IA e atualiza o estado
    const buscarDadosIA = async (h) => {
        try {
            const ctx = obterContextoIA();
            const body = {
                "Urgency_Level": "Medium",
                "Nurse_to_Patient_Ratio": parseFloat(((h.contagem_enfermeiros || 1) / (h.pacientes_ativos || 1)).toFixed(2)),
                "Specialist_Availability": h.contagem_medicos || 1,
                "Facility_Size_Beds": h.total_camas || 100,
                ...ctx
            };

            const response = await fetch(`${API_IA}/predict/wait-time`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            setPrevisoes(data); // Guarda Critical, High, Medium, Low, Not Urgent
        } catch (err) {
            console.error("Erro ao carregar tempos de espera:", err);
        }
    };

    useEffect(() => {
        async function carregarPagina() {
            setLoading(true);
            let dadosHospital = hospital;

            // Se não veio da Home, carrega do SQL
            if (!dadosHospital) {
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

    // Tempo Médio para o cabeçalho (usamos o Medium/Amarelo como referência)
    const tempoMedioHeader = previsoes?.Medium || previsoes?.medium || "--";

    return (
        <div className="hospital-detail-page">
            {/* CABEÇALHO (Onde aparece o tempo na image_819d52.png) */}
            <header className="hospital-header">
                <div className="header-info">
                    <h1>{hospital.nome}</h1>
                    <p>{hospital.morada || hospital.localizacao}</p>
                </div>
                
                <div className="header-wait-time-box">
                    <span className="label">TEMPO DE ESPERA</span>
                    <strong className="time">{tempoMedioHeader} min</strong>
                </div>
            </header>

            {/* SECÇÃO DOS CARTÕES COLORIDOS (image_81ac1d.png) */}
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
                        <strong>{previsoes?.["Not Urgent"] || previsoes?.not_urgent || '--'} min</strong>
                    </div>
                </div>
            </section>
        </div>
    );
}