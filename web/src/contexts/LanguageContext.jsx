// src/contexts/LanguageContext.jsx
import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { TEXTOS_PT } from '../locals/pt';
import { TEXTOS_EN } from '../locals/en';

const IDIOMAS_VALIDOS = ['pt', 'en'];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [idioma, setIdioma] = useState(() => {
    const guardado = localStorage.getItem('language');
    return IDIOMAS_VALIDOS.includes(guardado) ? guardado : 'pt';
  });

  const textos = useMemo(
    () => (idioma === 'pt' ? TEXTOS_PT : TEXTOS_EN),
    [idioma]
  );

  const mudarIdioma = useCallback((novoIdioma) => {
    if (!IDIOMAS_VALIDOS.includes(novoIdioma)) return;
    setIdioma(novoIdioma);
    localStorage.setItem('language', novoIdioma);
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  const value = useMemo(
    () => ({ idioma, textos, mudarIdioma }),
    [idioma, textos, mudarIdioma]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}