"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Pin, Loader2 } from "lucide-react";
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
    const maxAttempts = 15; // 30 seconds total

    const poll = async () => {
      attempts++;
      try {
        // We use the refresh endpoint but WITHOUT forceUpdate=true to just GET the current status
        // Wait, the refresh endpoint ALWAYS triggers ingestTicker(symbol, true).
        // Let's just check if we can get the stock data another way or if we should just wait.
        // Actually, we can just use router.refresh() and rely on the Server Component 
        // providing the new data, but we need to know when to stop polling.
        
        // BETTER: Let's fetch from the DB via a new simple API or just use the current stock from props.
        // Since we are in a Client Component, we can't easily read DB directly.
        // Let's use the search API if it exists or just wait for the background task.
        
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

    intervalId = setInterval(poll, 2000); // Poll every 2 seconds
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
    <div className="relative group">
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <DeleteButton symbol={stock.symbol} />
      </div>
      <Link href={`/stocks/${stock.symbol}`} className="block h-full">
        <Card className={`h-full cursor-pointer transition-all hover:bg-secondary/80 ${stock.isFeatured ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-card'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {stock.imageUrl && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white shadow-sm ring-1 ring-border">
                    <Image 
                      src={stock.imageUrl} 
                      alt={stock.symbol} 
                      fill
                      className="object-contain p-1"
                      sizes="32px"
                    />
                  </div>
                )}
                <CardTitle className="text-xl font-bold">{stock.symbol}</CardTitle>
                {stock.isFeatured && <Pin className="w-3 h-3 text-primary fill-current" />}
              </div>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
            <Badge 
              variant={isPositive ? "default" : "destructive"} 
              className={`px-2 py-1 text-sm ${isPositive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {stock.change.toFixed(2)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{currencySymbol}{stock.price.toFixed(2)}</div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stock.narrative && stock.narrative !== "Analyst unavailable." ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                  AI Narrative
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handlePin}
                    className={`p-1 transition-colors ${stock.isFeatured ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    title={stock.isFeatured ? "Featured on Dashboard" : "Pin to Dashboard"}
                  >
                    <Pin className={`w-3 h-3 ${stock.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    disabled={isRefreshing}
                    onClick={async (e) => {
                      e.preventDefault(); // Prevent Link navigation
                      e.stopPropagation(); // Stop event bubbling
                      setIsRefreshing(true);
                      
                      await fetch('/api/stocks/refresh', {
                        method: 'POST',
                        body: JSON.stringify({ symbol: stock.symbol })
                      });
                      
                      setIsRefreshing(false);
                      router.refresh(); // Refresh UI to show new narrative
                    }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    title="Regenerate Narrative"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-5 italic">
                {isPending ? (
                  <div className="space-y-2 py-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[95%]" />
                    <Skeleton className="h-4 w-[40%]" />
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
