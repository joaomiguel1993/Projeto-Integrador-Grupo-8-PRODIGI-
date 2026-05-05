import React, { createContext, useState, useContext, useEffect } from 'react';
import { TEXTOS_PT } from '../locals/pt';
import { TEXTOS_EN } from '../locals/en';


const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Inicializa com o que estiver no localStorage ou 'pt' por defeito
  const [idioma, setIdioma] = useState(localStorage.getItem('language') || 'pt');

  const textos = idioma === 'pt' ? TEXTOS_PT : TEXTOS_EN;

  const mudarIdioma = (novoIdioma) => {
    setIdioma(novoIdioma);
    localStorage.setItem('language', novoIdioma);
    // Opcional: Atualiza o atributo lang do HTML para acessibilidade/SEO
    document.documentElement.lang = novoIdioma;
  };

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  return (
    <LanguageContext.Provider value={{ idioma, textos, mudarIdioma }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);