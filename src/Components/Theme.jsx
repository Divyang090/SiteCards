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
    
    // Apply CSS variables to :root (entire document)
    const root = document.documentElement;
    
    if (isDark) {
      // Dark theme
      root.style.setProperty('--bg-primary', '#111827');
      root.style.setProperty('--bg-secondary', '#1f2937');
      root.style.setProperty('--bg-card', '#1f2937');
      root.style.setProperty('--bg-hover', '#374151');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--border-light', '#4b5563');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-hover', '#60a5fa');
      root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.4)');
    } else {
      // Light theme
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--bg-hover', '#f3f4f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6b7280');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#e5e7eb');
      root.style.setProperty('--border-light', '#f3f4f6');
      root.style.setProperty('--accent-primary', '#2563eb');
      root.style.setProperty('--accent-hover', '#1d4ed8');
      root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1)');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const setTheme = (theme) => setIsDark(theme === 'dark');

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};