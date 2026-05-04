import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Breadcrumbs.css';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
      
      {/* ADICIONA ESTA DIV COM A CLASSE CONTAINER */}
      <div className="container">
        <ul className="breadcrumbs-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="breadcrumbs-item">
                {isLast ? (
                  <span className="breadcrumbs-current">{item.name}</span>
                ) : (
                  <>
                    <Link to={item.path} className="breadcrumbs-link">
                      {item.name}
                    </Link>
                    <span className="breadcrumbs-separator"> {'>'} </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {/* FECHA A DIV AQUI */}

    </nav>
  );
}