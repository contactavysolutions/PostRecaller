import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

import {
  ColorName,
  Mode,
  fonts,
  fontSize,
  radius,
  resolveColors,
  shadow,
  spacing,
} from "./tokens";

type Theme = {
  mode: Mode;
  c: Record<ColorName, string>;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fonts: typeof fonts;
  shadow: typeof shadow;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const mode: Mode = scheme === "dark" ? "dark" : "light";
  const value: Theme = {
    mode,
    c: resolveColors(mode),
    spacing,
    radius,
    fontSize,
    fonts,
    shadow,
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
