import { useCallback, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyThemeClass(theme: Exclude<Theme, "system">): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored ?? "system";
  });

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") return getSystemPrefersDark() ? "dark" : "light";
    return theme;
  }, [theme]);

  useEffect(() => {
    // Persist preference (including "system")
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
    // Apply class for resolved theme
    applyThemeClass(resolvedTheme);

    // React to system theme changes when in system mode
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass(mq.matches ? "dark" : "light");
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, [theme, resolvedTheme]);

  const setLight = useCallback(() => setTheme("light"), []);
  const setDark = useCallback(() => setTheme("dark"), []);
  const setSystem = useCallback(() => setTheme("system"), []);
  const toggle = useCallback(() => setTheme((prev) => (prev === "dark" ? "light" : "dark")), []);

  return { theme, resolvedTheme, setTheme, setLight, setDark, setSystem, toggle };
}

export default useTheme;


