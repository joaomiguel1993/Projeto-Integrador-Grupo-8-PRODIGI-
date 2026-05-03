import { Outlet } from 'react-router-dom';
import HeaderPublic from '../../components/layout/HeaderPublic';
import FooterLayout from '../../components/layout/FooterLayout';
import React from 'react';
import '../../styles/About.css'; 

// Importa a imagem do grupo (ajusta a extensão para .jpg se for o caso)
import logo from '../../imagens/logo.png';

const SobreNos = () => {
  return (
    <div className="sobre-nos-container">
      
      {/* Secção de Cabeçalho / Título */}
      <section className="sobre-nos-hero">
        <h1>Sobre o Projeto <span>Integrador</span></h1>
        <p className="hero-subtitle">Grupo 8: Inovação, Companheirismo e Excelência Técnica.</p>
      </section>

      {/* Secção Principal com o Texto */}
      <section className="sobre-nos-content">
        <div className="text-box">
          <p>
            O <strong>Projeto Integrador</strong> surge como o culminar estratégico e técnico de um percurso de exigência e inovação, materializando-se no sistema <strong>PRODIGI</strong>. Este software de Gestão Hospitalar, focado na otimização de Urgências e Internamentos, representa a fusão entre a arquitetura de sistemas robustos e o apoio à decisão clínica através de Inteligência Artificial. Mais do que uma simples ferramenta digital, o PRODIGI é o resultado final de meses de dedicação, onde cada linha de código foi pensada para melhorar a eficiência do atendimento e a segurança dos dados de saúde.
          </p>
          <p>
            Este projeto uniu quatro percursos e visões num só grupo de trabalho, o <strong>Grupo 8</strong>, composto por João Martins, João Sacramento, Luís Franco e Pedro Antunes. Ao longo do desenvolvimento desta solução, o que começou por ser uma colaboração académica transformou-se num ambiente de forte companheirismo e de uma amizade sólida que ultrapassou os limites do laboratório. Juntos, estes quatro integrantes enfrentaram desafios técnicos complexos, desde a estruturação da base de dados até à implementação de modelos preditivos, mantendo sempre a união como o seu pilar principal.
          </p>
          <p className="highlight-text">
            Refletindo o espírito de união e a boa disposição que caracterizou cada reunião e sessão de trabalho, o grupo acabou por se autoapelidar, em tom de brincadeira, de <span className="sapo-emoji">"Sapos" 🐸</span>. Este nome de código interno simboliza não só a agilidade e a capacidade de adaptação demonstrada perante os obstáculos, mas também o laço afetivo que se criou entre todos. O PRODIGI é, por isso, mais do que um sistema tecnológico de excelência; é a prova viva de que o sucesso de um projeto integrador reside na harmonia e na cumplicidade daqueles que o constroem.
          </p>
        </div>
      </section>

      {/* Secção da Fotografia de Grupo */}
      <section className="equipa-section">
        <h2>A Equipa por trás do Projeto SIAGUH</h2>
        
        <div className="grupo-imagem-container">
          {/* Se a imagem falhar, verifica o nome e a extensão do ficheiro no import */}
          <img src={logo} alt="Fotografia do Grupo 8 - Os Sapos" className="imagem-grupo" />
        </div>

        <div className="membros-lista">
          <span className="membro-nome">João Martins</span>
          <span className="separador">•</span>
          <span className="membro-nome">João Sacramento</span>
          <span className="separador">•</span>
          <span className="membro-nome">Luís Franco</span>
          <span className="separador">•</span>
          <span className="membro-nome">Pedro Antunes</span>
        </div>
      </section>

    </div>
  );
};

export default SobreNos;