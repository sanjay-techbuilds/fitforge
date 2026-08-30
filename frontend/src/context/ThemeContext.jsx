import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 1. Check localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('siteTheme') || 'dark';
  });

  // 2. Update the HTML class and localStorage whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    localStorage.setItem('siteTheme', theme);
  }, [theme]);

  // 3. Function to switch themes
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);