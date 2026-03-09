"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const modes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "System", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function BoostPanel() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clear any previously saved custom theme overrides
    const keysToRemove = [
      "theme-hue", "theme-p-sat", "theme-p-lit", "theme-b-sat",
      "theme-b-lit", "theme-contrast", "theme-sat", "theme-lit",
      "theme-rad", "theme-tint",
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Remove any inline CSS var overrides left by the old engine
    const root = document.documentElement;
    const overrides = [
      "--primary", "--ring", "--chart-main",
      "--background", "--card", "--popover", "--secondary",
      "--radius",
    ];
    overrides.forEach((v) => root.style.removeProperty(v));
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-[220px] flex flex-col gap-3 select-none">
      <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground px-1">
        Appearance
      </p>

      {/* Mode selector */}
      <div className="flex bg-secondary/60 p-1 rounded-xl gap-1">
        {modes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg text-[11px] font-mono font-semibold transition-all duration-200",
              theme === value
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-1 leading-relaxed">
        System follows your OS preference.
      </p>
    </div>
  );
}