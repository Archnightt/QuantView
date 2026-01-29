import { getStockHistory } from '@/lib/history';
import { getStockDetails } from '@/lib/stock-data';
import { HeroChart } from '@/components/HeroChart';
import { FinancialsWidget } from '@/components/FinancialsWidget';
import { CompanyNews } from '@/components/CompanyNews';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ingestTicker } from '@/lib/ingest';

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  
  // Parallel Fetch: History, Details, and Ingest
  const [stockHistory, stockDetails, stockIngest] = await Promise.all([
    getStockHistory(symbol),
    getStockDetails(symbol),
    ingestTicker(symbol)
  ]);

  if (!stockDetails || !stockIngest) return <div className="p-10">Stock not found</div>;

  const isPositive = stockDetails.price > 0 && stockIngest.change > 0;
  const change = stockIngest.change;
  const price = stockDetails.price;
  const currency = stockDetails.currency || "$";

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
        <div className="flex items-center gap-4">
          {stockIngest.imageUrl && (
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-border">
              <Image 
                src={stockIngest.imageUrl} 
                alt={stockIngest.name} 
                fill
                className="object-contain p-2"
                sizes="64px"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">{stockDetails.symbol}</h1>
            <p className="text-xl text-muted-foreground">{stockIngest.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold">{currency}{price?.toFixed(2)}</div>
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
      <div className="w-full h-[400px]">
        {/* The component now handles its own Card, Title, and Range Buttons */}
        <HeroChart 
          symbol={symbol} 
          name={stockIngest.name} 
          initialData={stockHistory} 
        /> 
      </div>

      {/* 2. Middle Row: Financials + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <FinancialsWidget data={stockDetails.financials} />
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full bg-secondary/10 border-blue-100 dark:border-blue-900 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
                AI Analyst
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
