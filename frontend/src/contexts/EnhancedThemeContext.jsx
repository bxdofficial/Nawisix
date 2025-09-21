import React, { createContext, useContext, useState, useEffect } from 'react';

// Enhanced Theme Context with advanced features
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Theme modes: light, dark, auto, system
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect system preference
  const getSystemTheme = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // Get auto theme based on time
  const getAutoTheme = () => {
    const hour = new Date().getHours();
    // Light mode from 6 AM to 6 PM
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  };

  // Resolve the actual theme to use
  const resolveTheme = () => {
    switch (theme) {
      case 'light':
      case 'dark':
        return theme;
      case 'auto':
        return getAutoTheme();
      case 'system':
        return getSystemTheme();
      default:
        return 'light';
    }
  };

  // Apply theme to document
  const applyTheme = (newTheme) => {
    setIsTransitioning(true);
    
    // Add transition class
    document.documentElement.classList.add('theme-transitioning');
    
    // Update CSS variables and classes
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name=theme-color]');
    if (metaThemeColor) {
      metaThemeColor.content = newTheme === 'dark' ? '#1E293B' : '#FFFFFF';
    }

    // Remove transition class after animation
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    }, 300);

    setResolvedTheme(newTheme);
  };

  // Handle theme changes
  useEffect(() => {
    const newResolvedTheme = resolveTheme();
    applyTheme(newResolvedTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const newResolvedTheme = e.matches ? 'dark' : 'light';
        applyTheme(newResolvedTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Auto theme update interval
  useEffect(() => {
    if (theme === 'auto') {
      const interval = setInterval(() => {
        const newResolvedTheme = getAutoTheme();
        if (newResolvedTheme !== resolvedTheme) {
          applyTheme(newResolvedTheme);
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [theme, resolvedTheme]);

  // Theme color presets
  const colorPresets = {
    default: {
      primary: '#0EA5E9',
      secondary: '#8B5CF6',
      accent: '#F97316'
    },
    ocean: {
      primary: '#0891B2',
      secondary: '#06B6D4',
      accent: '#F59E0B'
    },
    forest: {
      primary: '#059669',
      secondary: '#10B981',
      accent: '#F97316'
    },
    sunset: {
      primary: '#DC2626',
      secondary: '#F97316',
      accent: '#FCD34D'
    },
    midnight: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899'
    }
  };

  const [colorPreset, setColorPreset] = useState('default');

  // Apply color preset
  const applyColorPreset = (preset) => {
    const colors = colorPresets[preset];
    if (colors) {
      Object.entries(colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });
      setColorPreset(preset);
      localStorage.setItem('colorPreset', preset);
    }
  };

  // Load saved color preset
  useEffect(() => {
    const savedPreset = localStorage.getItem('colorPreset');
    if (savedPreset && colorPresets[savedPreset]) {
      applyColorPreset(savedPreset);
    }
  }, []);

  // Contrast mode for accessibility
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true';
  });

  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // Reduce motion for accessibility
  const [reduceMotion, setReduceMotion] = useState(() => {
    const savedValue = localStorage.getItem('reduceMotion');
    if (savedValue !== null) {
      return savedValue === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const toggleReduceMotion = () => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    localStorage.setItem('reduceMotion', newValue.toString());
    
    if (newValue) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme,
    isTransitioning,
    themes: ['light', 'dark', 'auto', 'system'],
    colorPresets,
    colorPreset,
    applyColorPreset,
    highContrast,
    toggleHighContrast,
    reduceMotion,
    toggleReduceMotion,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;