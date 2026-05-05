import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './app/router';
import './styles/index.css';

// 1. Importa o LanguageProvider que criaste na pasta context
import { LanguageProvider } from "./contexts/LanguageContext";
/**
 * @file main.jsx
 * @description Ponto de entrada da aplicação. 
 * Envolvemos a estrutura de rotas com o LanguageProvider para permitir
 * a internacionalização (PT/EN) em todo o sistema SIAGUH.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. O LanguageProvider deve envolver o RouterProvider */}
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </React.StrictMode>
);