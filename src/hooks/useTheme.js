import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'hbd-theme';

export function useTheme() {
  const getSystemTheme = () =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY) || 'system';
    } catch {
      return 'system';
    }
  };

  const [preference, setPreference] = useState(getSavedTheme);
  const [resolved, setResolved] = useState(() => {
    const pref = getSavedTheme();
    return pref === 'system' ? getSystemTheme() : pref;
  });

  const applyTheme = useCallback((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setResolved(theme);
  }, []);

  useEffect(() => {
    const pref = getSavedTheme();
    applyTheme(pref === 'system' ? getSystemTheme() : pref);
  }, [applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preference === 'system') {
        applyTheme(getSystemTheme());
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference, applyTheme]);

  const setTheme = (newPref) => {
    try {
      localStorage.setItem(THEME_KEY, newPref);
    } catch {}
    setPreference(newPref);
    applyTheme(newPref === 'system' ? getSystemTheme() : newPref);
  };

  const toggleTheme = () => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return { theme: resolved, preference, setTheme, toggleTheme, isDark: resolved === 'dark' };
}
