"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function BoostPanel() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Theme State
  const [hue, setHue] = useState(240); 
  const [contrast, setContrast] = useState(5);
  
  // 2D Coordinates (0-100)
  // Dot 1: Primary Color (Sat, Lit)
  const [pSat, setPSat] = useState(60); 
  const [pLit, setPLit] = useState(50);
  
  // Dot 2: Background Tint (Sat, Lit)
  const [bSat, setBSat] = useState(10); 
  const [bLit, setBLit] = useState(50); // Mapped to theme L range

  const boxRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'primary' | 'bg' | null>(null);

  useEffect(() => {
    setMounted(true);
    const savedHue = localStorage.getItem("theme-hue");
    const savedPSat = localStorage.getItem("theme-p-sat");
    const savedPLit = localStorage.getItem("theme-p-lit");
    const savedBSat = localStorage.getItem("theme-b-sat");
    const savedBLit = localStorage.getItem("theme-b-lit");
    const savedCont = localStorage.getItem("theme-contrast");
    
    if (savedHue) setHue(Number(savedHue));
    if (savedPSat) setPSat(Number(savedPSat));
    if (savedPLit) setPLit(Number(savedPLit));
    if (savedBSat) setBSat(Number(savedBSat));
    if (savedBLit) setBLit(Number(savedBLit));
    if (savedCont) setContrast(Number(savedCont));
  }, []);

  // Update CSS
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    // 1. Primary Color (Dot 1)
    const actualPLit = 100 - pLit;
    const primaryHSL = `${hue} ${pSat}% ${actualPLit}%`;
    const chartHSL = `${hue} ${pSat}% ${Math.max(actualPLit, 40)}%`; 

    root.style.setProperty("--primary", primaryHSL);
    root.style.setProperty("--ring", primaryHSL);
    root.style.setProperty("--chart-main", chartHSL);

    // 2. Background (Dot 2)
    // bSat = Tint intensity (0-20% max usually for backgrounds)
    const bgSatVal = (bSat / 100) * 20; 
    
    let bgL, cardL;
    // Map bLit (0-100 slider pos) to appropriate range
    // Top (0) = Lightest, Bottom (100) = Darkest
    const normalizedL = (100 - bLit) / 100;

    if (isDark) {
      // Dark Mode: Background is dark, Cards are lighter
      bgL = normalizedL * 25; 
      cardL = bgL + contrast; 
    } else {
      // Light Mode: Background is tinted/gray (darker), Cards are white (lighter)
      // We map slider 0-100 to lightness 80-98 for background
      bgL = 80 + (normalizedL * 18); 
      // Cards pop by being lighter (up to pure white)
      cardL = Math.min(100, bgL + contrast + 2); 
    }

    root.style.setProperty("--background", `${hue} ${bgSatVal}% ${bgL}%`);
    root.style.setProperty("--card", `${hue} ${bgSatVal * 0.5}% ${cardL}%`);
    root.style.setProperty("--popover", `${hue} ${bgSatVal * 0.5}% ${cardL}%`);
    root.style.setProperty("--secondary", `${hue} ${bgSatVal}% ${Math.max(cardL - 10, 10)}%`);

    // Persist
    localStorage.setItem("theme-hue", String(hue));
    localStorage.setItem("theme-p-sat", String(pSat));
    localStorage.setItem("theme-p-lit", String(pLit));
    localStorage.setItem("theme-b-sat", String(bSat));
    localStorage.setItem("theme-b-lit", String(bLit));
    localStorage.setItem("theme-contrast", String(contrast));

  }, [hue, pSat, pLit, bSat, bLit, contrast, resolvedTheme, mounted]);

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!draggingRef.current || !boxRef.current) return;
    
    // Prevent default to stop scrolling/selection
    e.preventDefault(); 
    
    const rect = boxRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;

    // Clamp
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    if (draggingRef.current === 'primary') {
      setPSat(x);
      setPLit(y);
    } else {
      setBSat(x);
      setBLit(y);
    }
  };

  const stopDrag = () => {
    draggingRef.current = null;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', stopDrag);
  };

  const startDrag = (target: 'primary' | 'bg') => {
    draggingRef.current = target;
    document.addEventListener('mousemove', handleDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
  };

  const reset = () => {
    setHue(240); 
    setPSat(60); setPLit(50);
    setBSat(10); setBLit(50);
    setContrast(5);
    setTheme("system");
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="w-[320px] flex flex-col gap-5 select-none">
      
      {/* 1. Mode Toggles */}
      <div className="flex bg-secondary/50 p-1 rounded-full w-full">
        {['light', 'system', 'dark'].map((mode) => (
          <button
            key={mode}
            onClick={() => setTheme(mode)}
            className={cn(
              "flex-1 flex items-center justify-center py-1.5 rounded-full text-sm font-medium transition-all",
              theme === mode 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === 'light' && <Sun className="w-4 h-4" />}
            {mode === 'system' && <Monitor className="w-4 h-4" />}
            {mode === 'dark' && <Moon className="w-4 h-4" />}
          </button>
        ))}
      </div>

      {/* 2. The Color Space Box (Arc Style) */}
      <div 
        ref={boxRef}
        className="relative w-full h-48 rounded-xl cursor-crosshair overflow-hidden shadow-inner border border-white/10"
        style={{
          background: `
            linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)),
            linear-gradient(to right, #808080, hsl(${hue}, 100%, 50%))
          `
        }}
        onMouseDown={(e) => {
           // Simple click-to-move logic logic if needed, but dragging handles is safer
        }}
      >
        {/* Dot 1: Primary (Main) */}
        <div 
          className="absolute w-8 h-8 rounded-full border-[3px] border-white shadow-xl transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing flex items-center justify-center z-20 hover:scale-110 transition-transform"
          style={{ 
            left: `${pSat}%`, 
            top: `${pLit}%`,
            backgroundColor: `hsl(${hue}, ${pSat}%, ${100 - pLit}%)`
          }}
          onMouseDown={(e) => { e.stopPropagation(); startDrag('primary'); }}
          onTouchStart={(e) => { e.stopPropagation(); startDrag('primary'); }}
        >
           <span className="text-[10px] font-bold text-white drop-shadow-md mix-blend-difference">P</span>
        </div>

        {/* Dot 2: Background (Tint) */}
        <div 
          className="absolute w-6 h-6 rounded-full border-2 border-white/80 shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing flex items-center justify-center z-10 hover:scale-110 transition-transform"
          style={{ 
            left: `${bSat}%`, 
            top: `${bLit}%`,
            backgroundColor: `hsl(${hue}, ${(bSat/100)*20}%, ${(100-bLit)/100 * 50}%)` // Approx preview
          }}
          onMouseDown={(e) => { e.stopPropagation(); startDrag('bg'); }}
          onTouchStart={(e) => { e.stopPropagation(); startDrag('bg'); }}
        >
           <span className="text-[8px] font-bold text-white/80 drop-shadow-md">BG</span>
        </div>
      </div>

      {/* 3. Hue Slider (Rainbow) */}
      <div className="space-y-2 px-1">
        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>Hue</span>
          <span>{hue}°</span>
        </div>
        <div className="relative h-4 w-full rounded-full overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          <div 
             className="absolute inset-0 opacity-90"
             style={{ 
               background: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" 
             }} 
          />
          <Slider 
            value={[hue]} 
            max={360} 
            step={1} 
            onValueChange={(val) => setHue(val[0])}
            className="absolute inset-0 z-10 [&>.h-2]:h-full [&>.h-2]:opacity-0 [&>span]:h-5 [&>span]:w-5 [&>span]:border-2 [&>span]:border-white [&>span]:shadow-md [&>span]:bg-transparent hover:[&>span]:scale-110 transition-all"
          />
        </div>
      </div>

      {/* 4. Sliders Grid */}
      <div className="grid grid-cols-2 gap-4 px-1">
         <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
               <span>Brightness</span>
               <span>{100 - Math.round(bLit)}%</span>
            </div>
            <Slider 
              value={[100 - bLit]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setBLit(100 - val[0])} 
            />
         </div>
         <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
               <span>Contrast</span>
               <span>{contrast}%</span>
            </div>
            <Slider value={[contrast]} max={15} step={1} onValueChange={(val) => setContrast(val[0])} />
         </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/50 flex justify-between items-center">
        <span className="text-xs text-muted-foreground font-medium">AlphaDesk Boost</span>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs text-destructive hover:bg-destructive/10">
          <RotateCcw className="w-3 h-3 mr-1" /> Reset
        </Button>
      </div>
    </div>
  );
}