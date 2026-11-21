'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const saved = localStorage.getItem('mypocket_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme('dark');
    }
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    const isDark = t === 'dark';
    const themeColor = isDark ? '#07090F' : '#FFFFFF';
    const schemeValue = isDark ? 'dark' : 'light';

    root.style.colorScheme = schemeValue;
    root.style.backgroundColor = themeColor;
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.colorScheme = schemeValue;
    }

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Forcefully update meta tags for Android 15/16 WindowInsetsController & iOS
    if (typeof document !== 'undefined') {
      // 1. Meta color-scheme: forces Chrome Android to toggle APPEARANCE_LIGHT_NAVIGATION_BARS
      let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
      if (!colorSchemeMeta) {
        colorSchemeMeta = document.createElement('meta');
        colorSchemeMeta.setAttribute('name', 'color-scheme');
        document.head.appendChild(colorSchemeMeta);
      }
      colorSchemeMeta.setAttribute('content', schemeValue);

      // 2. Meta theme-color: remove old ones and append fresh element to force Blink repaint of system bars
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach((meta) => meta.remove());

      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = themeColor;
      document.head.appendChild(meta);

      // 3. Update iOS status bar appearance
      const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleMeta) {
        appleMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
      }
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem('mypocket_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

