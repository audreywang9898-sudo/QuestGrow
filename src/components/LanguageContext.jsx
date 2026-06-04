import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('questgrow_language') || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('questgrow_language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'zh' ? 'en' : 'zh'));
  };

  const t = (key, interpolations = {}) => {
    const langDict = translations[language] || translations.zh;
    let translation = langDict[key] || key;

    // Handle variable interpolations, e.g. {name} or {count}
    Object.entries(interpolations).forEach(([k, v]) => {
      translation = translation.replace(`{${k}}`, v);
    });

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
