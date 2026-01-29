export const dynamic = "force-dynamic";
import { getDashboardData } from "@/lib/dashboard-data";
import { DraggableDashboard } from "@/components/DraggableDashboard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { StockSearch } from "@/components/StockSearch";
import { DraggableWatchlist } from "@/components/DraggableWatchlist";
import { MarketIndices } from "@/components/MarketIndices";
import { DraggablePageLayout } from "@/components/DraggablePageLayout";
import { prisma } from "@/lib/prisma";
import { HeroChart } from "@/components/HeroChart";
import { NewsWidget } from "@/components/NewsWidget";

export default async function DashboardPage() {
  // 1. Fetch Watchlist (DB)
  const stocks = await prisma.stock.findMany({
    orderBy: { lastUpdated: 'desc' }
  });

  // 2. Fetch Widget Data (Cached API)
  const dashboardData = await getDashboardData();

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toolbar / Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
           <p className="text-muted-foreground">Market overview and watchlist</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <StockSearch />
          <ModeToggle />
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
             <Link href="/add"><Plus className="w-4 h-4 mr-1"/> Add Stock</Link>
          </Button>
        </div>
      </div>

      {/* 1. Ticker Row */}
      <MarketIndices />

      {/* 2. Reorderable Sections */}
      <DraggablePageLayout
        watchlist={
          <div className="min-h-[200px]">
            {stocks.length > 0 ? (
              <DraggableWatchlist initialStocks={stocks} />
            ) : (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-secondary/20">
                No stocks tracked. Click "Add Stock" to start.
              </div>
            )}
          </div>
        }
        pinnedChart={
           <div className="h-[400px]">
             <HeroChart 
               symbol={dashboardData.heroSymbol} 
               name={dashboardData.heroName}
               initialData={dashboardData.heroHistory} 
             />
           </div>
        }
        newsFeed={
           <div className="h-[400px]">
             <NewsWidget news={dashboardData.news} />
           </div>
        }
        overview={
          <DraggableDashboard serverData={dashboardData} />
        }
      />

    </div>
  );
}
