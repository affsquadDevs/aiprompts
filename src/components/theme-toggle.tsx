"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className="liquid-glass-toggle inline-flex h-9 w-9 items-center justify-center rounded-full"
        aria-hidden
      />
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="liquid-glass-toggle inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 transition hover:bg-white/50 dark:text-zinc-200 dark:hover:bg-white/10"
      title={isDark ? "Light theme" : "Dark theme"}
      aria-label={isDark ? "Use light theme" : "Use dark theme"}
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
