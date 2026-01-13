"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wifi, WifiOff } from "lucide-react";

// Helper to determine Market Status (Simple ET time check)
function getMarketStatus() {
  const now = new Date();
  const etTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = etTime.getDay();
  const hour = etTime.getHours();
  const minute = etTime.getMinutes();
  
  // Mon(1) - Fri(5), 9:30 - 16:00
  const isWeekday = day >= 1 && day <= 5;
  const isTradeHours = (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;
  
  return isWeekday && isTradeHours 
    ? { label: "U.S. Markets Open", open: true } 
    : { label: "U.S. Markets Closed", open: false };
}

export function MarketSummaryWidget({ data }: { data: any }) {
  const [status, setStatus] = useState({ label: "Checking...", open: false });

  useEffect(() => {
    setStatus(getMarketStatus());
  }, []);

  const QuoteGrid = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((item) => {
        const change = item.regularMarketChangePercent || 0;
        const isPos = change >= 0;
        return (
          <div key={item.symbol} className="flex flex-col p-3 rounded-lg bg-background/40 hover:bg-background/60 transition-colors">
             <div className="flex justify-between items-start mb-1">
               <span className="font-bold text-sm">{item.shortName || item.symbol}</span>
             </div>
             <div className="flex items-baseline gap-2">
               <span className="text-lg font-bold tabular-nums">
                 {item.regularMarketPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
             </div>
             <span className={`text-xs font-medium ${isPos ? "text-emerald-500" : "text-rose-500"}`}>
                {isPos ? "+" : ""}{change.toFixed(2)}%
             </span>
          </div>
        )
      })}
    </div>
  );

  return (
    <Card className="h-full flex flex-col dark:bg-secondary/20 overflow-hidden">
      {/* Status Bar */}
      <div className={`px-4 py-2 text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 ${status.open ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800/50 text-zinc-400'}`}>
         {status.open ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
         {status.label}
      </div>

      <Tabs defaultValue="commodities" className="flex-1 flex flex-col">
        <div className="px-4 pt-3">
          <TabsList className="w-full bg-background/50 backdrop-blur">
            <TabsTrigger value="crypto" className="flex-1 text-xs">Crypto</TabsTrigger>
            <TabsTrigger value="rates" className="flex-1 text-xs">Rates</TabsTrigger>
            <TabsTrigger value="commodities" className="flex-1 text-xs">Commodities</TabsTrigger>
            <TabsTrigger value="currencies" className="flex-1 text-xs">Currencies</TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-[220px]">
          <TabsContent value="crypto" className="mt-0 h-full"><QuoteGrid items={data.crypto || []} /></TabsContent>
          <TabsContent value="rates" className="mt-0 h-full"><QuoteGrid items={data.rates || []} /></TabsContent>
          <TabsContent value="commodities" className="mt-0 h-full"><QuoteGrid items={data.commodities || []} /></TabsContent>
          <TabsContent value="currencies" className="mt-0 h-full"><QuoteGrid items={data.currencies || []} /></TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
