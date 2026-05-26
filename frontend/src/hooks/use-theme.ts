import * as React from 'react';
import { ThemeContext } from '@/components/ThemeProvider';

// Hook dipisahkan dari ThemeProvider agar react-refresh (fast refresh) bekerja
// dengan benar — satu file hanya boleh export satu tipe (komponen atau hook/konstanta)
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
