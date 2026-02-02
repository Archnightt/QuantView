"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, Palette, Moon, Sun } from "lucide-react";

interface HSL {
  h: number;
  s: number;
  l: number;
}

const DEFAULT_DARK: HSL = { h: 0, s: 0, l: 3.5 }; // Your pitch black
const DEFAULT_LIGHT: HSL = { h: 0, s: 0, l: 98 };
const DEFAULT_PRIMARY: HSL = { h: 142, s: 71, l: 45 }; // Emerald-ish default

export function ThemeCustomizer() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State for controls
  const [hue, setHue] = useState(240); // Default Blue-ish
  const [saturation, setSaturation] = useState(60);
  const [lightness, setLightness] = useState(50); // Relative brightness slider (0-100)
  const [contrast, setContrast] = useState(5); // Difference between bg and card
  const [radius, setRadius] = useState(0.75); // Border radius
  const [bgTint, setBgTint] = useState(0); // Background Tint Intensity (0-100)

  useEffect(() => {
    setMounted(true);
    // Load saved values or defaults
    const savedHue = localStorage.getItem("theme-hue");
    const savedSat = localStorage.getItem("theme-sat");
    const savedLit = localStorage.getItem("theme-lit");
    const savedRad = localStorage.getItem("theme-rad");
    const savedTint = localStorage.getItem("theme-tint");
    
    if (savedHue) setHue(Number(savedHue));
    if (savedSat) setSaturation(Number(savedSat));
    if (savedLit) setLightness(Number(savedLit));
    if (savedRad) setRadius(Number(savedRad));
    if (savedTint) setBgTint(Number(savedTint));
  }, []);

  // Apply changes in real-time
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const isDark = resolvedTheme === "dark";

    // 1. Primary Color (Tint)
    const primaryHSL = `${hue} ${saturation}% 50%`;
    root.style.setProperty("--primary", primaryHSL);
    root.style.setProperty("--ring", primaryHSL);
    
    // 2. Radius
    root.style.setProperty("--radius", `${radius}rem`);

    // Save preferences
    localStorage.setItem("theme-hue", String(hue));
    localStorage.setItem("theme-sat", String(saturation));
    localStorage.setItem("theme-lit", String(lightness));
    localStorage.setItem("theme-rad", String(radius));
    localStorage.setItem("theme-tint", String(bgTint));

    // 3. Background Intensity & Tint
    // Mix the primary Hue into the background saturation
    const bgSat = (bgTint / 100) * 20; // Max 20% saturation for background
    
    let bgL, cardL;
    
    if (isDark) {
      // Dark Mode
      const minL = 0; 
      const maxL = 20; 
      const calculatedL = minL + (lightness / 100) * (maxL - minL);
      bgL = calculatedL;
      cardL = calculatedL + contrast; 
    } else {
      // Light Mode
      const maxL = 100;
      const minL = 85;
      const calculatedL = maxL - (lightness / 100) * (maxL - minL);
      bgL = calculatedL;
      cardL = calculatedL - contrast; 
    }

    root.style.setProperty("--background", `${hue} ${bgSat}% ${bgL}%`);
    root.style.setProperty("--card", `${hue} ${bgSat * 0.5}% ${cardL}%`); // Cards have less tint
    root.style.setProperty("--popover", `${hue} ${bgSat * 0.5}% ${cardL}%`);
    root.style.setProperty("--secondary", `${hue} ${bgSat}% ${cardL + (isDark ? 5 : -5)}%`);
    
  }, [hue, saturation, lightness, contrast, radius, bgTint, resolvedTheme, mounted]);

  const resetTheme = () => {
    setHue(240);
    setSaturation(60);
    setLightness(20); 
    setContrast(5);
    setRadius(0.75);
    setBgTint(0);
    localStorage.clear();
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="grid gap-6">
      
      {/* 1. Paint / Tint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" /> Paint
          </CardTitle>
          <CardDescription>
            Customize the primary hue and background tint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Hue ({hue}°)</Label>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: `hsl(${hue}, ${saturation}%, 50%)` }} 
              />
            </div>
            <Slider 
              value={[hue]} 
              max={360} 
              step={1} 
              onValueChange={(val) => setHue(val[0])}
              className="[&>.absolute]:bg-gradient-to-r from-red-500 via-green-500 to-blue-500"
            />
          </div>

          <div className="space-y-3">
            <Label>Saturation ({saturation}%)</Label>
            <Slider 
              value={[saturation]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setSaturation(val[0])} 
            />
          </div>
          
           <div className="space-y-3">
            <Label>Background Tint ({bgTint}%)</Label>
            <Slider 
              value={[bgTint]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setBgTint(val[0])} 
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Shape & Light */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {resolvedTheme === 'dark' ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
            Vibe
          </CardTitle>
          <CardDescription>
             Adjust lighting and shape.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Base Intensity</Label>
              <span className="text-xs text-muted-foreground">{lightness}%</span>
            </div>
            <Slider 
              value={[lightness]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setLightness(val[0])} 
            />
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between">
              <Label>Corner Radius</Label>
              <span className="text-xs text-muted-foreground">{radius}rem</span>
            </div>
            <Slider 
              value={[radius]} 
              max={2} 
              step={0.1} 
              onValueChange={(val) => setRadius(val[0])} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={resetTheme} className="text-destructive hover:text-destructive">
          <RotateCcw className="w-4 h-4 mr-2" /> Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
