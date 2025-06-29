import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface Theme {
  background: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  error: string;
  onError: string;
  success: string;
  warning: string;
}

const lightTheme: Theme = {
  background: '#FFFBFE',
  surface: '#FFFBFE',
  surfaceVariant: '#F4EFF4',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1D192B',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  shadow: '#000000',
  error: '#BA1A1A',
  onError: '#FFFFFF',
  success: '#4CAF50',
  warning: '#FF9800',
};

const darkTheme: Theme = {
  background: '#1C1B1F',
  surface: '#1C1B1F',
  surfaceVariant: '#49454F',
  onSurface: '#E6E1E5',
  onSurfaceVariant: '#CAC4D0',
  primary: '#D0BCFF',
  primaryContainer: '#4F378B',
  onPrimary: '#371E73',
  onPrimaryContainer: '#EADDFF',
  secondary: '#CCC2DC',
  secondaryContainer: '#4A4458',
  onSecondary: '#332D41',
  onSecondaryContainer: '#E8DEF8',
  outline: '#938F99',
  outlineVariant: '#49454F',
  shadow: '#000000',
  error: '#FFB4AB',
  onError: '#690005',
  success: '#81C784',
  warning: '#FFB74D',
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  const isDark = themeMode === 'system' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.log('Error saving theme mode:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, isDark, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}