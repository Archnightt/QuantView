"use client";

import { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RANGES = [
  { label: "1D", value: "1d" },
  { label: "1W", value: "5d" },
  { label: "1M", value: "1mo" },
  { label: "6M", value: "6mo" },
  { label: "YTD", value: "ytd" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

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

  // Derive price change for coloring
  const priceChange = data.length >= 2 ? data[data.length - 1]?.price - data[0]?.price : 0;
  const isPositiveChart = priceChange >= 0;
  const chartColor = isPositiveChart ? "hsl(142, 70%, 50%)" : "hsl(0, 65%, 55%)";

  useEffect(() => {
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

    fetchData();
  }, [symbol, range]);

  const lastPrice = data[data.length - 1]?.price;
  const pctChange = data.length >= 2
    ? ((data[data.length - 1]?.price - data[0]?.price) / data[0]?.price) * 100
    : 0;

  return (
    <div className={cn("h-full flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg", className)}>
      {/* Hero header — elevated treatment */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
        <div className="space-y-0.5">
          {/* Ticker in mono */}
          <p className="text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
            {symbol} &middot; {RANGES.find(r => r.value === range)?.label} Trend
          </p>
          {/* Name in display serif */}
          <h2 className="font-display text-2xl leading-tight text-foreground">
            {name || symbol}
          </h2>
          {/* Price & change in mono */}
          {lastPrice && (
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="font-display text-3xl tabular">
                ${lastPrice.toFixed(2)}
              </span>
              <span className={`font-mono text-sm font-semibold tabular ${isPositiveChart ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositiveChart ? '+' : ''}{pctChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Range Buttons */}
        <div className="flex gap-0.5 bg-secondary/40 p-1 rounded-lg shrink-0">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              variant={range === r.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setRange(r.value)}
              className={`h-7 px-2 md:px-3 text-[10px] md:text-xs font-mono font-semibold ${range === r.value
                  ? "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90"
                  : "hover:bg-background/50 text-muted-foreground"
                }`}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative">
        {loading && data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--brand))' }} />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-sans text-sm">
            No data available
          </div>
        ) : (
          <div className="absolute inset-0 pt-4 pr-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide={true} interval="preserveStartEnd" />
                <YAxis
                  domain={['dataMin', 'dataMax']}
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#888', fontFamily: 'var(--font-mono)' }}
                  tickFormatter={(val) => val.toFixed(2)}
                  width={52}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    backgroundColor: 'hsl(var(--card))',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: chartColor, fontWeight: 'bold' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  labelStyle={{ display: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#fillGradient)"
                  animationDuration={800}
                  baseValue="dataMin"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}