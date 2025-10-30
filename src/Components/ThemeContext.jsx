// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply data-theme attribute to html element instead of setting CSS variables directly
    const html = document.documentElement;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Optional: Debug log
    console.log('🎨 Theme applied:', isDark ? 'dark' : 'light');
    
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const setTheme = (theme) => setIsDark(theme === 'dark');

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};