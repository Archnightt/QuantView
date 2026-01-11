"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RefreshCw, Pin } from "lucide-react";
import { DeleteButton } from "./DeleteButton";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  narrative?: string | null;
  isFeatured?: boolean;
}

export function StockCard({ stock }: { stock: Stock }) {
  const isPositive = stock.change > 0;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

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
        <Card className={`h-full cursor-pointer transition-all hover:bg-secondary/80 border-0 shadow-sm dark:shadow-none ${stock.isFeatured ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/20' : 'bg-card'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
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
            <div className="text-3xl font-bold mb-4">${stock.price.toFixed(2)}</div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stock.narrative && stock.narrative !== "Analyst unavailable." ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                  Analyst Narrative
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
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-5 italic">
                "{stock.narrative || "Analyst unavailable."}"
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
