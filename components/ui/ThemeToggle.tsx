"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";

const ThemeToggle = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const sizeClass = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`flex ${sizeClass} items-center justify-center rounded-md
                 border border-ts-border
                 bg-ts-bg-main
                 text-ts-text-main
                 hover:bg-ts-border
                 transition`}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </Button>
  );
};

export default ThemeToggle;
