import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from '../utils/themes';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
  const [theme, setTheme] = useState(isDark ? darkTheme : lightTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === 'dark');
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    setTheme(!isDark ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}