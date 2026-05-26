import * as React from 'react';
import { ThemeContext } from '@/components/theme-context';

// Hook dipisahkan dari ThemeProvider agar react-refresh bekerja dengan benar
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
