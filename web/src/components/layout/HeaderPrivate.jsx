// src/components/layout/HeaderPrivate.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import logo from '../../imagens/logo100fundo.png';
import '../../styles/main.css';

export default function HeaderPrivate({
  breadcrumbs = [],
  userName    = 'Utilizador',
}) {
  const location = useLocation();
  const [fotoUrl, setFotoUrl] = useState('');

  useEffect(() => {
    const rawUser = sessionStorage.getItem('user');
    if (!rawUser) { setFotoUrl(''); return; }
    try {
      const userObj = JSON.parse(rawUser);
      setFotoUrl(userObj.foto_url || '');
    } catch {
      setFotoUrl('');
    }
  }, [location.pathname]);

  const avatarFallback = userName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="header-private">
      <div className="header-private__inner container">

        {/* Esquerda: logo + branding + breadcrumbs */}
        <div className="header-private__left">
          <img
            src={logo}
            alt="Logótipo SIAGUH"
            className="header-private__logo"
          />

          <div className="header-private__branding">
            <span className="header-private__title">SIAGUH</span>
            <div className="header-private__breadcrumbs-wrap">
              <Breadcrumbs items={breadcrumbs} />
            </div>
          </div>
        </div>

        {/* Direita: perfil */}
        <Link to="/perfil" className="header-private__profile-link">
          <span className="header-private__user-name">{userName}</span>

          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Fotografia do utilizador"
              className="header-private__avatar-img"
            />
          ) : (
            <div className="header-private__avatar" aria-hidden="true">
              {avatarFallback}
            </div>
          )}
        </Link>

      </div>
    </header>
  );
}