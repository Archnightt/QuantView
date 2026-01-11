import { MarketIndices } from "@/components/MarketIndices";
import { getDashboardData } from "@/lib/dashboard-data";
import { DraggableDashboard } from "@/components/DraggableDashboard";
import { DraggableWatchlist } from "@/components/DraggableWatchlist";
import { prisma } from "@/lib/prisma";
import { getMarketNews } from "@/lib/news";

export default async function DashboardPage() {
  // 1. Fetch Watchlist (DB)
  // 2. Fetch Widget Data (API)
  const [stocks, dashboardData] = await Promise.all([
    prisma.stock.findMany({
      orderBy: { lastUpdated: 'desc' }
    }),
    getDashboardData()
  ]);

  return (
    <main className="min-h-screen text-foreground p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 1. Ticker Row */}
      <MarketIndices />

      {/* 2. Main Watchlist (Sortable) */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-lg font-semibold">Your Watchlist</h2>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">Drag to Reorder</span>
        </div>
        
        <div className="min-h-[200px]">
          {stocks.length > 0 ? (
            <DraggableWatchlist initialStocks={stocks} />
          ) : (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-secondary/20">
              No stocks tracked. Use the search bar to start adding tickers.
            </div>
          )}
        </div>
      </div>

      {/* 3. The Draggable Bento Grid */}
      <div className="pt-4">
         <div className="flex items-center justify-between mb-4 px-1">
           <h2 className="text-lg font-semibold">Market Overview</h2>
           <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">Drag to Reorder</span>
         </div>
         <DraggableDashboard serverData={dashboardData} />
      </div>

    </main>
  );
}