"use client";

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import {
  TrendingUp, TrendingDown, Activity, Zap, PieChart, ChevronLeft, ChevronRight,
  Cpu, Landmark, HeartPulse, ShoppingBag, ShoppingCart, Factory, Lightbulb, Pickaxe, Building, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SentimentChart } from "@/components/SentimentChart";

function WidgetHeader({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-[3px] h-4 rounded-full bg-brand shrink-0" />
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
    </div>
  );
}

function MiniSparkline({ data, isPositive }: { data: number[], isPositive: boolean }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 50;
    const y = 20 - ((val - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="50" height="20" className="opacity-75">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  'XLK': Cpu,
  'XLF': Landmark,
  'XLV': HeartPulse,
  'XLE': Zap,
  'XLY': ShoppingBag,
  'XLP': ShoppingCart,
  'XLI': Factory,
  'XLU': Lightbulb,
  'XLB': Pickaxe,
  'XLRE': Building,
  'XLC': MessageCircle
};

export function SectorWidget({ data }: { data: any[] }) {
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const nextPage = () => setPage((p) => (p + 1) % totalPages);
  const prevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <Card className="h-[400px] p-4 dark:bg-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 rounded-full bg-brand shrink-0" />
          <PieChart className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Sectors</span>
        </div>
        <div className="flex gap-0.5">
          <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-secondary/50" onClick={prevPage}>
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-secondary/50" onClick={nextPage}>
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-0.5 flex-1">
        {paginatedData.map((sector: any) => {
          const Icon = SECTOR_ICONS[sector.symbol] || PieChart;
          const change = sector.regularMarketChangePercent || 0;
          const isPositive = change > 0;

          return (
            <div key={sector.symbol} className="flex items-center justify-between py-2 px-1.5 rounded-lg hover:bg-secondary/30 transition-colors animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-sans font-medium leading-none mb-0.5 truncate">
                    {SECTOR_MAP[sector.symbol] || sector.symbol}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {sector.symbol}
                  </div>
                </div>
              </div>

              {/* Right: Sparkline + % Change */}
              <div className="flex items-center gap-3 shrink-0">
                <MiniSparkline data={sector.sparkline} isPositive={isPositive} />
                <div className={`text-[13px] font-mono font-semibold w-14 text-right tabular ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-2 flex justify-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === page ? 'w-4 bg-brand' : 'w-1 bg-brand/20'}`} />
        ))}
      </div>
    </Card>
  );
}

export function SentimentWidget({ vix }: { vix: any }) {
  const value = vix?.regularMarketPrice || 0;

  return (
    <div className="h-[400px] bg-card dark:bg-card rounded-xl overflow-hidden shadow-sm border border-border/60">
      <SentimentChart value={value} />
    </div>
  );
}

export function TrendingWidget({ data }: { data: any[] }) {
  return (
    <Card className="h-full p-4 dark:bg-card">
      <WidgetHeader title="Trending Now" icon={Zap} />
      <div className="space-y-2">
        {data.map((t: any) => (
          <div key={t.symbol} className="flex justify-between items-center">
            <span className="font-mono text-sm font-bold">{t.symbol}</span>
            <span className="text-muted-foreground text-[10px] font-sans">Active</span>
          </div>
        ))}
      </div>
    </Card>
  );
}