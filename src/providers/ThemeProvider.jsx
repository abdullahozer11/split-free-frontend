import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const themes = {
  light: {
    primary: "#3b82f6", // Blue
    secondary: "#f472b6", // Pink
    accent: "#fbbf24", // Amber
    background: "#ffffff", // White
    surface: "#f3f4f6", // Light Gray
    text: "#1f2937", // Gray-800
    success: "#10b981", // Emerald
    error: "#ef4444", // Red
    warning: "#f97316", // Orange
    info: "#0ea5e9", // Sky Blue
  },
  dark: {
    primary: "#60a5fa", // Light Blue
    secondary: "#f472b6", // Pink
    accent: "#fbbf24", // Amber
    background: "#1e293b", // Dark Blue-Gray
    surface: "#374151", // Gray-700
    text: "#e5e7eb", // Light Gray
    success: "#10b981", // Emerald
    error: "#ef4444", // Red
    warning: "#f97316", // Orange
    info: "#0ea5e9", // Sky Blue
  },
  pastel: {
    primary: "#a78bfa", // Soft Purple
    secondary: "#f9a8d4", // Pink
    accent: "#fcd34d", // Yellow
    background: "#fef3c7", // Light Cream
    surface: "#fde68a", // Pale Yellow
    text: "#4b5563", // Gray-700
    success: "#34d399", // Green
    error: "#f87171", // Red
    warning: "#fb923c", // Orange
    info: "#93c5fd", // Light Blue
  },
  retro: {
    primary: "#ff7f50", // Coral
    secondary: "#ff69b4", // Hot Pink
    accent: "#ffd700", // Gold
    background: "#2c3e50", // Dark Blue-Gray
    surface: "#34495e", // Slate
    text: "#ecf0f1", // Light Gray
    success: "#27ae60", // Green
    error: "#e74c3c", // Red
    warning: "#f39c12", // Yellow-Orange
    info: "#3498db", // Blue
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("light"); // Default theme
  const theme = themes[themeName];

  const switchTheme = (newTheme) => {
    setThemeName(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
