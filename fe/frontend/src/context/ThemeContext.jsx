import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// theme values: 'light' | 'dark'
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("techedu-theme") || "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove("dark");

    if (theme === "dark") {
      root.classList.add("dark");
    }
    // 'light' → no class needed, default Tailwind behavior

    localStorage.setItem("techedu-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
