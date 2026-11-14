import React, { createContext, useContext, useEffect, useMemo } from 'react';

/**
 * Dark-only theme. There is no toggle and no choice: the product is locked to
 * the dark HUD palette, so the context is a no-op that guarantees `dark`.
 */

const ThemeContext = createContext({ mode: 'dark', resolved: 'dark' });

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }, []);

  const value = useMemo(() => ({ mode: 'dark', resolved: 'dark' }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}