import React, { useState, useContext, createContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  });
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set initial theme on mount
    const saved = localStorage.getItem('theme');
    const initialTheme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Update data-theme attribute immediately for CSS variables
    const newIsDark = !isDark;
    const newTheme = !isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Set timeout to actually toggle the state after a brief delay
    // This ensures CSS variables update before the animation
    setTimeout(() => {
      setIsDark(!isDark);
      setIsAnimating(false);
    }, 300); // Halfway through the expansion
  };

  return (
    <ThemeContext.Provider value={{
      isDark,
      toggleTheme,
      isAnimating
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};