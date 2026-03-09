"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const modes = [
  {
    value: "light",
    label: "Light",
    description: "Clean white interface",
    icon: Sun,
  },
  {
    value: "system",
    label: "System",
    description: "Follows your OS setting",
    icon: Monitor,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Easy on the eyes",
    icon: Moon,
  },
] as const;

export function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Clean up any custom CSS var overrides left by the old theming engine
    const root = document.documentElement;
    const overrides = [
      "--primary", "--ring", "--chart-main",
      "--background", "--card", "--popover", "--secondary", "--radius",
    ];
    overrides.forEach((v) => root.style.removeProperty(v));

    // Clear old localStorage keys
    [
      "theme-hue", "theme-p-sat", "theme-p-lit", "theme-b-sat",
      "theme-b-lit", "theme-contrast", "theme-sat", "theme-lit",
      "theme-rad", "theme-tint",
    ].forEach((k) => localStorage.removeItem(k));
  }, []);

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map(({ value, label, description, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
              isActive
                ? "border-brand bg-brand/5 shadow-sm"
                : "border-border hover:border-border/80 hover:bg-secondary/40"
            )}
          >
            {isActive && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-brand-foreground" />
              </span>
            )}
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isActive ? "bg-brand/15 text-brand" : "bg-secondary text-muted-foreground"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className={cn(
                "text-sm font-mono font-bold text-center",
                isActive ? "text-brand" : "text-foreground"
              )}>
                {label}
              </p>
              <p className="text-[10px] text-muted-foreground text-center mt-0.5 leading-tight font-sans">
                {description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
