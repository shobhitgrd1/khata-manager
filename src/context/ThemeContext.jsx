import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../theme/theme';

const ThemeContext = createContext({
  mode: 'dark',
  toggleTheme: () => {},
  setThemeMode: () => {},
  isDark: true,
});

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      const saved = localStorage.getItem('khata_theme_mode');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('khata_theme_mode', mode);
    } catch (e) {
      console.warn('Failed to save theme in localStorage', e);
    }
    // Set data-theme attribute on document root for CSS selectors
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
    }
  };

  const muiTheme = useMemo(() => getTheme(mode), [mode]);

  const value = {
    mode,
    toggleTheme,
    setThemeMode,
    isDark: mode === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a CustomThemeProvider');
  }
  return context;
};

export default ThemeContext;

