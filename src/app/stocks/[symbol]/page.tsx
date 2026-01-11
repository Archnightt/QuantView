import { ingestTicker } from '@/lib/ingest';
import { getStockHistory } from '@/lib/history';
import { PriceChart } from '@/components/PriceChart';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StockPage({ params, searchParams }: { params: Promise<{ symbol: string }>, searchParams: Promise<{ range?: string }> }) {
  const { symbol } = await params;
  const { range = '1mo' } = await searchParams;
  
  // Parallel Fetch
  const [stock, history] = await Promise.all([
    ingestTicker(symbol),
    getStockHistory(symbol, range as any)
  ]);

  if (!stock) return <div className="p-10">Stock not found</div>;

  const isPositive = stock.change > 0;
  const ranges = ['1d', '1w', '1mo', '1y'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      {/* Navigation */}
      <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">{stock.symbol}</h1>
          <p className="text-xl text-muted-foreground">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold">${stock.price.toFixed(2)}</div>
          <Badge variant={isPositive ? "default" : "destructive"} className={`text-lg px-3 py-1 mt-1 ${
            isPositive 
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" 
              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
          }`}>
            {isPositive ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
            {stock.change.toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Chart (Takes up 2/3) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Price Trend</CardTitle>
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
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
          <CardContent className="pl-0">
            <PriceChart data={history} range={range} />
          </CardContent>
        </Card>

        {/* Right Column: AI Analysis & News */}
        <div className="space-y-6">
          <Card className="bg-muted/50 border-blue-100 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
                AI Analyst
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed italic text-gray-700 dark:text-gray-300">
                "{stock.narrative}"
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/50 dark:border-white/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" /> Recent Headlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {stock.headlines && stock.headlines.length > 0 ? (
                  stock.headlines.slice(0, 4).map((news: string, i: number) => (
                    <li key={i} className="text-sm border-l-2 pl-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer border-l-primary/20 hover:border-l-primary rounded-r-md">
                      {news}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-muted-foreground">No recent headlines.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
