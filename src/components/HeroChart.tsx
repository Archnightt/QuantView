"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const RANGES = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "6M", value: "6mo" },
  { label: "YTD", value: "ytd" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

import { cn } from "@/lib/utils";

export function HeroChart({ symbol, name, initialData, className }: { symbol: string, name?: string, initialData?: any[], className?: string }) {
  const [range, setRange] = useState("5d"); 
  
  const [data, setData] = useState<any[]>(() => {
    if (initialData && initialData.length > 0) {
        return initialData.map((item: any) => ({
          time: new Date(item.date || item.time).toLocaleDateString(undefined, { 
             month: 'short', day: 'numeric' 
          }),
          originalTime: item.date || item.time,
          price: item.price
        }));
    }
    return [];
  });

  const [loading, setLoading] = useState(!initialData || initialData.length === 0);

  useEffect(() => {
    // If we have initial data and haven't changed range, don't fetch immediately
    if (initialData && initialData.length > 0 && range === "5d" && !loading) {
        // Just ensure data is set if we switched back to default range, 
        // but typically we let the fetch override or we check if data matches range.
        // For simplicity, we just fetch on range change always unless it's the very first render.
        // But since we initialized data, we need a way to skip.
        // Actually, let's just fetch. The initial data prevents layout shift.
    }

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stocks/history?symbol=${encodeURIComponent(symbol)}&range=${range}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const json = await res.json();
        
        if (!Array.isArray(json)) {
            setData([]);
            return;
        }
        
        const formatted = json.map((item: any) => ({
          time: new Date(item.time).toLocaleDateString(undefined, { 
             month: 'short', day: 'numeric', 
             hour: range === '1d' ? 'numeric' : undefined 
          }),
          originalTime: item.time,
          price: item.price
        }));
        
        setData(formatted);
      } catch (err) {
        console.error("Chart Error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    // Skip fetch on mount if we have initial data matching the default range
    // We can use a ref to track if it's the first mount, or just rely on the fact 
    // that if data is populated we might skip. 
    // However, to keep it simple and ensure data is fresh:
    // We will fetch unless it's the strict initial load.
    // Actually, just fetching is safer to ensure timezone correctness client-side.
    // The initialData just provides the "Skeleton" value.
    fetchData();
  }, [symbol, range]);

  return (
    <Card className={cn("h-full border bg-card shadow-sm flex flex-col overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50 shrink-0">
        <div className="space-y-1">
           <CardTitle className="text-xl flex items-center gap-2">
             {name || symbol}
           </CardTitle>
           <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
             {RANGES.find(r => r.value === range)?.label} Trend
           </p>
        </div>

        <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r.value)}
              className={`h-7 px-2 md:px-3 text-[10px] md:text-xs font-semibold ${
                range === r.value 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-background/50 text-muted-foreground"
              }`}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 relative">
        {loading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        ) : (
          <div className="absolute inset-0 pt-6 pr-2 pb-2">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                     <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="time" hide={true} interval="preserveStartEnd" />
                 <YAxis 
                   domain={['dataMin', 'dataMax']} 
                   orientation="right" 
                   tick={{ fontSize: 11, fill: '#888' }}
                   tickFormatter={(val) => val.toFixed(2)}
                   width={50}
                   axisLine={false}
                   tickLine={false}
                 />
                 <Tooltip 
                   contentStyle={{ 
                     borderRadius: '8px', 
                     border: '1px solid var(--border)', 
                     backgroundColor: 'hsl(var(--card))',
                     color: 'hsl(var(--foreground))',
                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                   }}
                   itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                   formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                   labelStyle={{ display: 'none' }}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="price" 
                   stroke="hsl(var(--primary))" 
                   strokeWidth={2}
                   fill="url(#fillGradient)" 
                   animationDuration={800}
                   baseValue="dataMin"
                 />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}