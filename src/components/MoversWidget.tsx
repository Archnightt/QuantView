"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    return <div className="p-4 text-center text-muted-foreground text-sm">No data available</div>;
  }

  return (
    <div className="h-[260px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-secondary">
      {items.map((item) => (
        <Link 
            key={item.symbol} 
            href={`/stocks/${item.symbol}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50"
        >
          <div className="flex flex-col">
            <span className="font-bold text-sm">{item.symbol}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {item.shortName || item.longName || item.symbol}
            </span>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-medium">
              ${item.regularMarketPrice?.toFixed(2)}
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs px-1.5 py-0 h-5 mt-1 border-0 ${
                type === 'gainers' 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {type === 'gainers' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(item.regularMarketChangePercent).toFixed(2)}%
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function MoversWidget({ gainers, losers }: { gainers: any[], losers: any[] }) {
  return (
    <Card className="h-full flex flex-col shadow-sm dark:bg-secondary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          Market Movers
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <Tabs defaultValue="gainers" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="gainers" className="text-green-600 dark:text-green-400 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/30">
                Top Gainers
            </TabsTrigger>
            <TabsTrigger value="losers" className="text-red-600 dark:text-red-400 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/30">
                Top Losers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="flex-1 mt-0">
            <MoverList items={gainers} type="gainers" />
          </TabsContent>
          <TabsContent value="losers" className="flex-1 mt-0">
            <MoverList items={losers} type="losers" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
