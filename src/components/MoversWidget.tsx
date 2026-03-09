"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

interface Mover {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
}

function MoverList({ items, type }: { items: Mover[], type: 'gainers' | 'losers' }) {
  if (!items || items.length === 0) {
    return <div className="p-4 text-center text-muted-foreground text-sm font-sans">No data available</div>;
  }

  return (
    <div className="space-y-1 pr-1">
      {items.map((item, idx) => {
        const isGainer = type === 'gainers';
        const pct = Math.abs(item.regularMarketChangePercent).toFixed(2);
        return (
          <Link
            key={item.symbol}
            href={`/stocks/${item.symbol}`}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-all duration-150 border border-transparent hover:border-border/50 group relative overflow-hidden ${isGainer ? 'hover:glow-gain' : 'hover:glow-loss'}`}
          >
            {/* Rank */}
            <span className="text-[10px] font-mono text-muted-foreground/50 w-4 shrink-0 tabular">
              {idx + 1}
            </span>
            <div className="flex flex-col flex-1 min-w-0">
              {/* Ticker in mono */}
              <span className="font-mono text-sm font-bold leading-tight tracking-tight">{item.symbol}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[110px] font-sans leading-tight">
                {item.shortName || item.longName || item.symbol}
              </span>
            </div>
            <div className="text-right shrink-0">
              {/* Price in display serif */}
              <div className="font-display text-base leading-tight tabular text-foreground">
                ${item.regularMarketPrice?.toFixed(2)}
              </div>
              {/* % in mono */}
              <div className={`flex items-center justify-end gap-0.5 font-mono text-xs font-semibold tabular mt-0.5 ${isGainer ? 'text-emerald-500' : 'text-red-500'
                }`}>
                {isGainer ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {pct}%
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function MoversWidget({ gainers, losers }: { gainers: any[], losers: any[] }) {
  return (
    <Card className="h-[400px] flex flex-col shadow-sm dark:bg-card overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-4">
        <div className="flex items-center gap-2">
          {/* Left accent line */}
          <div className="w-[3px] h-5 rounded-full bg-brand" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
            Market Movers
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-3 min-h-0 overflow-hidden">
        <Tabs defaultValue="gainers" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-3 shrink-0 bg-secondary/40 p-0.5 rounded-lg h-8">
            <TabsTrigger
              value="gainers"
              className="text-[11px] font-mono font-semibold rounded-md h-full data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-500 text-muted-foreground"
            >
              ▲ Gainers
            </TabsTrigger>
            <TabsTrigger
              value="losers"
              className="text-[11px] font-mono font-semibold rounded-md h-full data-[state=active]:bg-red-500/15 data-[state=active]:text-red-500 text-muted-foreground"
            >
              ▼ Losers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="flex-1 mt-0 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
            <MoverList items={gainers} type="gainers" />
          </TabsContent>
          <TabsContent value="losers" className="flex-1 mt-0 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
            <MoverList items={losers} type="losers" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
