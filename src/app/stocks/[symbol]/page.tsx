import { getStockHistory } from '@/lib/history';
import { getStockDetails } from '@/lib/stock-data';
import { PriceChart } from '@/components/PriceChart';
import { FinancialsWidget } from '@/components/FinancialsWidget';
import { CompanyNews } from '@/components/CompanyNews';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ingestTicker } from '@/lib/ingest';

export default async function StockPage({ params, searchParams }: { params: Promise<{ symbol: string }>, searchParams: Promise<{ range?: string }> }) {
  const { symbol } = await params;
  const { range = '1mo' } = await searchParams;
  
  // Parallel Fetch: History, Details, and Ingest/Update
  const [stockHistory, stockDetails, stockIngest] = await Promise.all([
    getStockHistory(symbol, range as any),
    getStockDetails(symbol),
    ingestTicker(symbol) // Ensure DB is fresh for narrative
  ]);

  if (!stockDetails || !stockIngest) return <div className="p-10">Stock not found</div>;

  const isPositive = stockDetails.price > 0 && stockIngest.change > 0; // Fallback logic
  const change = stockIngest.change;
  const price = stockDetails.price;
  const ranges = ['1d', '1w', '1mo', '1y'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Navigation */}
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground w-fit">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">{stockDetails.symbol}</h1>
          <p className="text-xl text-muted-foreground">{stockIngest.name}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold">${price?.toFixed(2)}</div>
          <Badge variant={isPositive ? "default" : "destructive"} className={`text-lg px-3 py-1 mt-1 ${
            change > 0
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" 
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
          }`}>
            {change > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            {change?.toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* 1. Main Chart (Full Width) */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>Price Trend</CardTitle>
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
            {ranges.map((r) => (
              <Link 
                key={r} 
                href={`?range=${r}`}
                className={`text-xs px-3 py-1 rounded-md transition-all ${
                  range === r 
                    ? "bg-background shadow-sm font-semibold text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.toUpperCase()}
              </Link>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pl-0 h-[500px]">
          <PriceChart data={stockHistory} range={range} />
        </CardContent>
      </Card>

      {/* 2. Middle Row: Financials + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <FinancialsWidget data={stockDetails.financials} />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full bg-secondary/10 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                ✨ AI Analyst
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed italic text-foreground/80">
                "{stockIngest.narrative}"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Bottom Row: Deep Company News */}
      <div>
         <CompanyNews news={stockDetails.news} symbol={symbol} />
      </div>
    </div>
  );
}