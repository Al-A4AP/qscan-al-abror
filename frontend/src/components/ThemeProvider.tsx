import * as React from 'react';

type Theme = 'light' | 'dark';

export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | undefined>(undefined);

// Lazy initializer — membaca localStorage/system preference SEKALI saat mount
// tanpa perlu setTheme di dalam useEffect (menghindari cascading render)
function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return savedTheme || systemTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = React.useState(false);

  // useEffect hanya untuk side-effect ke external system (DOM) — bukan untuk setState
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
