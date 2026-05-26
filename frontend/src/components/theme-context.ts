import * as React from 'react';

export type Theme = 'light' | 'dark';

// Context dipisah ke file sendiri agar:
// - ThemeProvider.tsx hanya export komponen (react-refresh happy)
// - useTheme hook bisa import tanpa circular dependency
export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | undefined>(undefined);
