"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Pin, Sparkles } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import { Skeleton } from "@/components/ui/skeleton";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  currency?: string | null;
  narrative?: string | null;
  isFeatured?: boolean;
  imageUrl?: string | null;
}

export function StockCard({ stock: initialStock }: { stock: Stock }) {
  const [stock, setStock] = useState(initialStock);
  const isPositive = stock.change > 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const currencySymbol = stock.currency || "$";

  const isPending = stock.narrative?.includes("Analysis pending");

  // Sync state with props when they change (e.g. from a global refresh)
  useEffect(() => {
    setStock(initialStock);
  }, [initialStock]);

  // Polling logic for pending narratives
  useEffect(() => {
    if (!isPending) return;

    let intervalId: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 15;

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`/api/stocks/refresh`, {
          method: 'POST',
          body: JSON.stringify({ symbol: stock.symbol })
        });

        if (res.ok) {
          const updated = await res.json();
          if (updated && !updated.narrative.includes("Analysis pending")) {
            setStock(updated);
            router.refresh();
            return;
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    };

    intervalId = setInterval(poll, 2000);
    return () => clearInterval(intervalId);
  }, [isPending, stock.symbol, router]);

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fetch('/api/stocks/feature', {
        method: 'POST',
        body: JSON.stringify({ symbol: stock.symbol })
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to pin stock", error);
    }
  };

  return (
    <div className="relative group h-full">
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteButton symbol={stock.symbol} />
      </div>
      <Link href={`/stocks/${stock.symbol}`} className="block h-full">
        <Card
          className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden ${isPositive ? 'gain-bar glow-gain' : 'loss-bar glow-loss'
            } ${stock.isFeatured ? 'ring-1 ring-brand/40 border-brand/20' : ''}`}
        >
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {stock.imageUrl && (
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-border shrink-0">
                    <Image
                      src={stock.imageUrl}
                      alt={stock.symbol}
                      fill
                      className="object-contain p-0.5"
                      sizes="28px"
                    />
                  </div>
                )}
                {/* Ticker in monospace */}
                <span className="font-mono text-base font-bold tracking-tight leading-none">
                  {stock.symbol}
                </span>
                {stock.isFeatured && (
                  <Pin className="w-3 h-3 text-brand fill-current shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-sans leading-snug line-clamp-1 max-w-[140px]">
                {stock.name}
              </p>
            </div>

            {/* Change badge */}
            <Badge
              variant="outline"
              className={`shrink-0 tabular px-2 py-1 text-xs font-mono font-semibold border-0 ${isPositive
                  ? 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-500 dark:bg-red-500/15 dark:text-red-400'
                }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {isPositive ? '+' : ''}{stock.change.toFixed(2)}%
            </Badge>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            {/* Price — display serif for hero number */}
            <div className="font-display text-3xl leading-tight text-foreground mb-4 tabular">
              <span className="text-lg font-sans font-normal text-muted-foreground mr-0.5">{currencySymbol}</span>
              {stock.price.toFixed(2)}
            </div>

            {/* AI Narrative Section */}
            <div className="rounded-lg overflow-hidden" style={{ background: 'hsl(var(--narrative-bg))' }}>
              {/* Narrative Header */}
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
                <div className="flex items-center gap-1.5">
                  {/* Pulsing amber dot */}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stock.narrative && stock.narrative !== "Analyst unavailable."
                      ? "bg-brand ai-pulse-dot"
                      : "bg-muted-foreground/40"
                    }`} />
                  <Sparkles className="w-3 h-3 text-brand/70" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground font-sans">
                    AI Narrative
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handlePin}
                    className={`p-1 rounded transition-colors ${stock.isFeatured ? 'text-brand' : 'text-muted-foreground hover:text-brand'}`}
                    title={stock.isFeatured ? "Featured on Dashboard" : "Pin to Dashboard"}
                  >
                    <Pin className={`w-3 h-3 ${stock.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    disabled={isRefreshing}
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsRefreshing(true);

                      await fetch('/api/stocks/refresh', {
                        method: 'POST',
                        body: JSON.stringify({ symbol: stock.symbol })
                      });

                      setIsRefreshing(false);
                      router.refresh();
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-brand transition-colors disabled:opacity-50"
                    title="Regenerate Narrative"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Narrative Body — lighter sans-serif, italic */}
              <div className="px-3 pb-3 text-[12.5px] font-sans font-light italic text-muted-foreground leading-relaxed line-clamp-4 tracking-[0.01em]">
                {isPending ? (
                  <div className="space-y-1.5 py-0.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-[90%]" />
                    <Skeleton className="h-3 w-[95%]" />
                    <Skeleton className="h-3 w-[40%]" />
                  </div>
                ) : (
                  `"${stock.narrative || "Analyst unavailable."}"`
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
