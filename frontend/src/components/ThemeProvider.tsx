import * as React from 'react';
import { ThemeContext, type Theme } from './theme-context';

// Lazy initializer: membaca localStorage/system pref SEKALI saat mount
// tanpa setState di dalam useEffect
function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return savedTheme || systemTheme;
}

// File ini HANYA mengekspor satu komponen — react-refresh/fast-refresh bekerja optimal
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  // useEffect hanya untuk side-effect ke DOM (external system) — tidak ada setState di sini
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
