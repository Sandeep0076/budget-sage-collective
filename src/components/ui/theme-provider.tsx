"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type GradientTheme = "blue" | "purple" | "green" | "orange" | "pink" | "teal" | "custom";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultGradient?: GradientTheme;
  storageKey?: string;
  gradientStorageKey?: string;
};

type CustomGradientColors = {
  startColor: string;
  endColor: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  gradientTheme: GradientTheme;
  setGradientTheme: (gradient: GradientTheme) => void;
  customColors: CustomGradientColors;
  setCustomColors: (colors: CustomGradientColors) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  gradientTheme: "blue",
  setGradientTheme: () => null,
  customColors: { startColor: "#0091FF", endColor: "#006FE8" },
  setCustomColors: () => null,
};

// Predefined gradient themes - now properly exported
export const gradientThemes = {
  blue: { startColor: "#0091FF", endColor: "#006FE8" },
  purple: { startColor: "#9333EA", endColor: "#6D28D9" },
  green: { startColor: "#10B981", endColor: "#059669" },
  orange: { startColor: "#F97316", endColor: "#EA580C" },
  pink: { startColor: "#EC4899", endColor: "#DB2777" },
  teal: { startColor: "#14B8A6", endColor: "#0D9488" },
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultGradient = "blue",
  storageKey = "vite-ui-theme",
  gradientStorageKey = "vite-ui-gradient-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  
  const [gradientTheme, setGradientTheme] = useState<GradientTheme>(
    () => (localStorage.getItem(gradientStorageKey) as GradientTheme) || defaultGradient
  );
  
  const [customColors, setCustomColors] = useState<CustomGradientColors>(() => {
    const storedColors = localStorage.getItem("vite-ui-custom-colors");
    return storedColors 
      ? JSON.parse(storedColors) 
      : { startColor: "#0091FF", endColor: "#006FE8" };
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Apply gradient theme
    applyGradientTheme(root, gradientTheme, customColors);
  }, [theme, gradientTheme, customColors]);

  const applyGradientTheme = (
    root: HTMLElement, 
    gradient: GradientTheme, 
    custom: CustomGradientColors
  ) => {
    let colors;
    
    if (gradient === "custom") {
      colors = custom;
    } else {
      colors = gradientThemes[gradient as keyof typeof gradientThemes];
    }
    
    // Convert hex to HSL for CSS variables
    const startColorHsl = hexToHSL(colors.startColor);
    const endColorHsl = hexToHSL(colors.endColor);
    
    // Update CSS variables for gradients
    root.style.setProperty('--background-start', `${startColorHsl.h} ${startColorHsl.s}% ${startColorHsl.l}%`);
    root.style.setProperty('--background-end', `${endColorHsl.h} ${endColorHsl.s}% ${endColorHsl.l}%`);
    root.style.setProperty('--background', `${startColorHsl.h} ${startColorHsl.s}% ${startColorHsl.l}%`);
    
    // Update primary and accent colors based on the gradient
    root.style.setProperty('--primary', `${startColorHsl.h} ${startColorHsl.s}% ${startColorHsl.l}%`);
    root.style.setProperty('--accent', `${endColorHsl.h} ${endColorHsl.s}% ${endColorHsl.l}%`);
    root.style.setProperty('--ring', `${startColorHsl.h} ${startColorHsl.s}% ${startColorHsl.l}%`);
  };

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    gradientTheme,
    setGradientTheme: (gradient: GradientTheme) => {
      localStorage.setItem(gradientStorageKey, gradient);
      setGradientTheme(gradient);
    },
    customColors,
    setCustomColors: (colors: CustomGradientColors) => {
      localStorage.setItem("vite-ui-custom-colors", JSON.stringify(colors));
      setCustomColors(colors);
    }
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Helper function to convert hex to HSL
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the # if present
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find the min and max values to calculate the lightness
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Calculate lightness
  let l = (max + min) / 2;
  
  let h = 0;
  let s = 0;

  if (max !== min) {
    // Calculate saturation
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    
    // Calculate hue
    if (max === r) {
      h = ((g - b) / (max - min)) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = ((b - r) / (max - min)) + 2;
    } else if (max === b) {
      h = ((r - g) / (max - min)) + 4;
    }
    
    h = Math.round(h * 60);
  }
  
  // Round values
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
