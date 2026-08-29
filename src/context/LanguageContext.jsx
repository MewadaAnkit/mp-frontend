import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en';
import hi from '../locales/hi';

const dictionaries = { en, hi };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('mp_school_lang');
    return saved === 'hi' ? 'hi' : 'en';
  });

  const setLanguage = (newLang) => {
    const valid = newLang === 'hi' ? 'hi' : 'en';
    setLangState(valid);
    localStorage.setItem('mp_school_lang', valid);
  };

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const t = (keyPath, fallback = '') => {
    if (!keyPath) return fallback;
    const keys = keyPath.split('.');
    
    // Attempt lookup in active language dictionary
    let curr = dictionaries[lang];
    for (const k of keys) {
      if (curr && typeof curr === 'object' && k in curr) {
        curr = curr[k];
      } else {
        curr = null;
        break;
      }
    }

    if (curr !== null && curr !== undefined) {
      return curr;
    }

    // Fallback to English dictionary
    let fallbackCurr = dictionaries.en;
    for (const k of keys) {
      if (fallbackCurr && typeof fallbackCurr === 'object' && k in fallbackCurr) {
        fallbackCurr = fallbackCurr[k];
      } else {
        fallbackCurr = null;
        break;
      }
    }

    return fallbackCurr !== null && fallbackCurr !== undefined ? fallbackCurr : fallback || keyPath;
  };

  const isHindi = lang === 'hi';

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t, isHindi }}>
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

export default LanguageContext;
