import React, { useState } from 'react';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import '../../styles/FAQ.css'; 

// Array com as perguntas e respostas (dados que forneceste)
const faqsData = [
  {
    question: "O que é o SIAGUH?",
    answer: "É o Sistema Integrado de Apoio à Gestão de Urgências Hospitalares, uma plataforma modular (SIGUI) desenvolvida para gerir desde a entrada do utente até à sua alta ou internamento."
  },
  {
    question: "Os meus dados estão seguros?",
    answer: "Sim. O sistema utiliza autenticação robusta (JWT) e segue as normas do RGPD para garantir que apenas profissionais autorizados acedam aos dados clínicos."
  },
  {
    question: "Como é decidida a cor da minha pulseira?",
    answer: "O enfermeiro introduz os seus sinais vitais e sintomas no sistema. A nossa IA analisa esses dados e sugere uma cor baseada no Protocolo de Manchester, mas a decisão final é sempre validada por um profissional de saúde."
  },
  {
    question: "O tempo de espera indicado é exato?",
    answer: "O tempo é uma estimativa calculada pela IA com base no histórico do hospital e no número de doentes em espera no momento. Pode sofrer alterações se surgirem casos de emergência crítica (pulseiras vermelhas)."
  },
  {
    question: "Como posso saber em que quarto estou internado?",
    answer: "Essa informação é gerida no módulo de internamentos, onde o sistema atribui automaticamente uma cama e serviço após a decisão médica."
  },
  {
    question: "Onde posso consultar as minhas prescrições?",
    answer: "As prescrições emitidas pelos médicos ficam registadas no seu histórico clínico dentro do SIAGUH e podem ser consultadas pelos profissionais que o acompanham."
  },
  {
    question: "Como recupero o meu acesso de funcionário?",
    answer: "Deve contactar o Administrador do sistema, que é o responsável pela gestão de contas e permissões no módulo de profissionais."
  },
  {
    question: "O sistema funciona em dispositivos móveis?",
    answer: "Sim, o SIAGUH possui uma aplicação Android dedicada para que os profissionais possam consultar dados e registar atos médicos em mobilidade."
  }
];

export default function Faqs() {
  // Estado que guarda um array com os índices das perguntas que estão abertas
  const [openIndices, setOpenIndices] = useState([]);

  // 1. Define o caminho das migalhas de pão para esta página
  const breadcrumbsLinks = [
    { name: 'Início', path: '/' },
    { name: 'Perguntas Frequentes', path: '/faqs' }
  ];

  // Verifica se todas estão abertas
  const isAllOpen = openIndices.length === faqsData.length;

  // Função para abrir/fechar uma pergunta individual
  const toggleAccordion = (index) => {
    setOpenIndices((prevIndices) => {
      if (prevIndices.includes(index)) {
        // Se já está aberta, remove do array (fecha)
        return prevIndices.filter((i) => i !== index);
      } else {
        // Se está fechada, adiciona ao array (abre)
        return [...prevIndices, index];
      }
    });
  };

  // Função para expandir ou colapsar todas
  const toggleAll = () => {
    if (isAllOpen) {
      setOpenIndices([]); // Limpa o array (fecha todas)
    } else {
      // Cria um array com todos os índices [0, 1, 2, ..., 7]
      const allIndices = faqsData.map((_, index) => index);
      setOpenIndices(allIndices); // Abre todas
    }
  };

  return (
    <div className="faqs-page-wrapper">
      
      {/* 2. Coloca o componente Breadcrumbs aqui, fora do main para ficar alinhado pelo topo */}
      <Breadcrumbs items={breadcrumbsLinks} />

      <main className="faqs-main-content">
        <div className="faqs-container">
          
          <div className="faqs-header">
            <h1>Perguntas Frequentes (FAQ)</h1>
            <p>Encontre respostas rápidas para as dúvidas mais comuns sobre o funcionamento do sistema SIAGUH.</p>
          </div>

          <div className="faqs-controls">
            <button className="btn-toggle-all" onClick={toggleAll}>
              {isAllOpen ? 'Colapsar tudo' : 'Expandir tudo'}
            </button>
          </div>

          <div className="accordion-list">
            {faqsData.map((faq, index) => {
              const isOpen = openIndices.includes(index);

              return (
                <div 
                  key={index} 
                  className={`accordion-item ${isOpen ? 'open' : ''}`}
                >
                  <button 
                    className="accordion-header" 
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                  >
                    <h3>{faq.question}</h3>
                    <span className="accordion-icon">
                      {/* Ícone que roda quando abre */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </button>
                  
                  {/* Truque CSS com Grid para a animação ficar fluida */}
                  <div className="accordion-collapse">
                    <div className="accordion-body">
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}