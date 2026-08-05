import React, { createContext, useContext, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'abuad_theme';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

function applyLightTheme() {
  const root = document.documentElement;
  root.setAttribute('data-theme', 'light');
  root.classList.remove('dark');
  root.classList.add('light');
  root.style.colorScheme = 'light';

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', '#f7f5f1');

  try {
    localStorage.setItem(STORAGE_KEY, 'light');
  } catch {
    /* ignore */
  }
}

/**
 * Light-only theme. Dark mode is intentionally disabled.
 */
export const ThemeProvider = ({ children }) => {
  useEffect(() => {
    applyLightTheme();
  }, []);

  const value = useMemo(
    () => ({
      theme: 'light',
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
