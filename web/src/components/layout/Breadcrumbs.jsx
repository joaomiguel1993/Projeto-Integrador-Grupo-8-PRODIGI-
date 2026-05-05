import React from 'react';
import { Link } from 'react-router-dom';
import { TEXTOS_PT } from '../../locals/pt';
import '../../styles/Breadcrumbs.css';

/**
 * @file Breadcrumbs.jsx
 * @description Componente de navegação estrutural (Migalhas de Pão) que indica a 
 * localização atual do utilizador dentro da hierarquia do sistema SIAGUH.
 * Implementa boas práticas de acessibilidade (ARIA) para leitores de ecrã.
 * 
 * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Array<{name: string, path: string}>} props.items - Lista de objetos com o nome e o caminho para a rota.
 * @returns {JSX.Element} Navegação horizontal em formato breadcrumb.
 */
export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs-nav" aria-label={TEXTOS_PT.acessibilidade.navegacaoBreadcrumb}>
      
      <div className="container">
        <ul className="breadcrumbs-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="breadcrumbs-item">
                {isLast ? (
                  // O aria-current="page" avisa o leitor de ecrã que este elemento representa a página onde estamos agora
                  <span 
                    className="breadcrumbs-current" 
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link to={item.path} className="breadcrumbs-link">
                      {item.name}
                    </Link>
                    
                    {/* aria-hidden="true" faz com que os leitores de ecrã ignorem o símbolo ">" */}
                    <span 
                      className="breadcrumbs-separator" 
                      aria-hidden="true"
                    > 
                      {'>'} 
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

    </nav>
  );
}