export const dynamic = "force-dynamic";
import { getDashboardData } from "@/lib/dashboard-data";
import { DraggableDashboard } from "@/components/DraggableDashboard";
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
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <div className="w-full md:w-1/2">
           <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
           <p className="text-muted-foreground">Market overview</p>
        </div>
        
        {/* Right Actions / Search */}
        <div className="w-full md:w-1/2 flex justify-end gap-4 z-10">
          <StockSearch />
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
                No stocks tracked. Use the search bar to add one.
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
