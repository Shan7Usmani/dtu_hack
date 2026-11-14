import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'netrakshak.theme';
export const MODES = ['light', 'dark', 'system'];
const DEFAULT_MODE = 'system';

const ThemeContext = createContext(null);

function readMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (MODES.includes(stored)) return stored;
  } catch (error) {
    /* storage blocked */
  }
  return DEFAULT_MODE;
}

function prefersDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readMode);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      /* storage blocked - theme still applies for this session */
    }
  }, [mode, resolved]);

  const setThemeMode = useCallback((next) => {
    setMode(MODES.includes(next) ? next : DEFAULT_MODE);
  }, []);

  const value = useMemo(() => ({ mode, resolved, setThemeMode }), [mode, resolved, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
