import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import "../../styles/components/breadcrumbs.css";

export default function Breadcrumbs({ items = [] }) {
  const { textos } = useLanguage();

  const ariaLabel =
    textos?.acessibilidade?.navegacaoBreadcrumb ||
    'Navegação breadcrumb';

  return (
    <nav className="breadcrumbs-nav" aria-label={ariaLabel}>
      <div className="container">
        <ul className="breadcrumbs-list">
          {items.length > 0 ? (
            items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={`${item.path || item.name || index}`} className="breadcrumbs-item">
                  {isLast ? (
                    <span className="breadcrumbs-current" aria-current="page">
                      {item.name}
                    </span>
                  ) : (
                    <>
                      <Link to={item.path} className="breadcrumbs-link">
                        {item.name}
                      </Link>
                      <span className="breadcrumbs-separator" aria-hidden="true">
                        {'>'}
                      </span>
                    </>
                  )}
                </li>
              );
            })
          ) : null}
        </ul>
      </div>
    </nav>
  );
}