"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, TrendingDown, Activity, Zap, PieChart, ChevronLeft, ChevronRight,
  Cpu, Landmark, HeartPulse, ShoppingBag, ShoppingCart, Factory, Lightbulb, Pickaxe, Building, MessageCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentimentChart } from "@/components/SentimentChart";

// --- Helper Components ---

function WidgetHeader({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
    </div>
  );
}

function MiniSparkline({ data, isPositive }: { data: number[], isPositive: boolean }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  // Normalize to 0-100 range for SVG
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 50; // Width 50px
    const y = 20 - ((val - min) / range) * 20; // Height 20px (inverted)
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="50" height="20" className="opacity-70">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#22c55e" : "#ef4444"} // Green or Red
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- The Widgets ---

const SECTOR_MAP: Record<string, string> = {
  'XLK': 'Technology',
  'XLF': 'Financials',
  'XLV': 'Healthcare',
  'XLE': 'Energy',
  'XLY': 'Cons. Disc.',
  'XLP': 'Cons. Stap.',
  'XLI': 'Industrials',
  'XLU': 'Utilities',
  'XLB': 'Materials',
  'XLRE': 'Real Estate',
  'XLC': 'Comm. Svcs'
};

const SECTOR_ICONS: Record<string, any> = {
  'XLK': Cpu,          // Tech
  'XLF': Landmark,     // Finance
  'XLV': HeartPulse,   // Health
  'XLE': Zap,          // Energy
  'XLY': ShoppingBag,  // Cons Disc
  'XLP': ShoppingCart, // Cons Stap
  'XLI': Factory,      // Industrial
  'XLU': Lightbulb,    // Utilities
  'XLB': Pickaxe,      // Materials
  'XLRE': Building,    // Real Estate
  'XLC': MessageCircle // Comm
};

export function SectorWidget({ data }: { data: any[] }) {
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <Card className="h-full p-4 border-0 bg-secondary/20 flex flex-col">
      <div className="flex items-center justify-between mb-3">
         <div className="flex items-center gap-2 text-muted-foreground">
            <PieChart className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Sectors</span>
         </div>
         <div className="flex gap-1">
           <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-secondary/50" onClick={prevPage}>
             <ChevronLeft className="w-3 h-3" />
           </Button>
           <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-secondary/50" onClick={nextPage}>
             <ChevronRight className="w-3 h-3" />
           </Button>
         </div>
      </div>
      
      <div className="space-y-2 flex-1">
        {paginatedData.map((sector: any) => {
          const Icon = SECTOR_ICONS[sector.symbol] || PieChart;
          const change = sector.regularMarketChangePercent || 0;
          const isPositive = change > 0;
          
          return (
            <div key={sector.symbol} className="flex items-center justify-between py-2 group animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-medium leading-none mb-1">
                    {SECTOR_MAP[sector.symbol] || sector.symbol}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {sector.symbol}
                  </div>
                </div>
              </div>

              {/* Right: Sparkline + % Change */}
              <div className="flex items-center gap-4">
                 <MiniSparkline data={sector.sparkline} isPositive={isPositive} />
                 <div className={`text-sm font-semibold w-12 text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                   {change > 0 ? '+' : ''}{change.toFixed(2)}%
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-auto pt-2 flex justify-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === page ? 'w-4 bg-primary' : 'w-1 bg-primary/20'}`} />
        ))}
      </div>
    </Card>
  );
}

export function SentimentWidget({ vix }: { vix: any }) {
  const value = vix?.regularMarketPrice || 0;
  
  return (
    <div className="h-full bg-secondary/20 rounded-xl overflow-hidden">
       <SentimentChart value={value} />
    </div>
  );
}

export function TrendingWidget({ data }: { data: any[] }) {
  return (
    <Card className="h-full p-4 border-0 bg-secondary/20">
      <WidgetHeader title="Trending Now" icon={Zap} />
      <div className="space-y-3">
        {data.map((t: any) => (
          <div key={t.symbol} className="flex justify-between items-center text-sm">
            <span className="font-bold">{t.symbol}</span>
            <span className="text-muted-foreground truncate max-w-[100px] text-xs">Active</span>
          </div>
        ))}
      </div>
    </Card>
  );
}