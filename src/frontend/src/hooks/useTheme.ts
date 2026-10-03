import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ThemeMode } from "@/types/chat";
import { useCallback, useEffect } from "react";

/**
 * Dark/light theme hook.
 *
 * Applies the `dark` class to `<html>` (matching the Tailwind `darkMode:
 * ["class"]` config and the `color-scheme` rules in index.css), defaults to
 * dark, and persists the choice in localStorage.
 */
export function useTheme(): {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
} {
  const [theme, setTheme] = useLocalStorage<ThemeMode>("jarvis.theme", "dark");

  // Reflect the active theme on the document root.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
