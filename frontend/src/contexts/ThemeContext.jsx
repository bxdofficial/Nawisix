import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar'; // Arabic as default
  });

  useEffect(() => {
    // Update document classes and CSS variables
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.setProperty('--primary-color', '#9FE3FF');
      root.style.setProperty('--bg-primary', '#0F1724');
      root.style.setProperty('--bg-secondary', '#0E1722');
      root.style.setProperty('--text-primary', '#E6F7FF');
      root.style.setProperty('--text-secondary', '#94A3B8');
      root.style.setProperty('--brand-name', '#9FE3FF'); // Light sky-blue in night mode
      root.style.setProperty('--card-bg', '#0E1722');
      root.style.setProperty('--card-shadow', '0 4px 6px rgba(0, 0, 0, 0.4)');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--primary-color', '#67C7FF');
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F8FAFC');
      root.style.setProperty('--text-primary', '#0B0B0B');
      root.style.setProperty('--text-secondary', '#4B5563');
      root.style.setProperty('--brand-name', '#0B0B0B'); // Black in day mode
      root.style.setProperty('--card-bg', '#FFFFFF');
      root.style.setProperty('--card-shadow', '0 4px 6px rgba(0, 0, 0, 0.1)');
    }
    
    // Common colors
    root.style.setProperty('--accent-color', '#0A84FF');
    root.style.setProperty('--error-color', '#EF4444');
    root.style.setProperty('--success-color', '#10B981');
    root.style.setProperty('--warning-color', '#F59E0B');
    root.style.setProperty('--info-color', '#3B82F6');
    
    // Save to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    // Handle RTL for Arabic
    const root = document.documentElement;
    if (language === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
      root.style.fontFamily = 'Tajawal, system-ui, sans-serif';
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
      root.style.fontFamily = 'Inter, system-ui, sans-serif';
    }
    
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };

  const setTheme = (dark) => {
    setIsDarkMode(dark);
  };

  const setLanguagePreference = (lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguage(lang);
    }
  };

  const themeColors = {
    primary: isDarkMode ? '#9FE3FF' : '#67C7FF',
    primaryDark: '#0A84FF',
    background: isDarkMode ? '#0F1724' : '#FFFFFF',
    surface: isDarkMode ? '#0E1722' : '#F8FAFC',
    text: isDarkMode ? '#E6F7FF' : '#0B0B0B',
    textSecondary: isDarkMode ? '#94A3B8' : '#4B5563',
    brandName: isDarkMode ? '#9FE3FF' : '#0B0B0B',
    card: isDarkMode ? '#0E1722' : '#FFFFFF',
    border: isDarkMode ? 'rgba(159, 227, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  };

  const value = {
    isDarkMode,
    language,
    toggleTheme,
    toggleLanguage,
    setTheme,
    setLanguagePreference,
    themeColors,
    isRTL: language === 'ar',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;