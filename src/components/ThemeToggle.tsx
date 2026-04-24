import { useCallback, useEffect, useState } from 'react';
import styles from './themeToggle.module.css';

const THEME_STORAGE_KEY = 'theme';

function setMetaThemeColor(theme: 'light' | 'dark') {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#121110' : '#FFFEFA');
  }
}

function applyDomTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  setMetaThemeColor(theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(t);
    setMetaThemeColor(t);
  }, []);

  const toggle = useCallback(() => {
    if (theme === null) return;
    const next = theme === 'dark' ? 'light' : 'dark';
    applyDomTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }, [theme]);

  if (theme === null) {
    return null;
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={theme === 'dark'}
    >
      <span className={styles.icon} aria-hidden>
        {theme === 'dark' ? '\u2600' : '\u263E'}
      </span>
    </button>
  );
}
