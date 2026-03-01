export const dynamic = "force-dynamic";
import { getDashboardData } from "@/lib/dashboard-data";
import { DraggableDashboard } from "@/components/DraggableDashboard";

import { DraggableWatchlist } from "@/components/DraggableWatchlist";
import { MarketIndices } from "@/components/MarketIndices";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // 1. Fetch Watchlist (DB)
  const stocks = await prisma.stock.findMany({
    orderBy: { lastUpdated: 'desc' }
  });

  // 2. Fetch Widget Data (Cached API)
  const dashboardData = await getDashboardData();

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">

      {/* The Search and Header are now handled by TopNav */}

      {/* 1. Ticker Row */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <MarketIndices />
      </div>

      {/* 2. Pro Desktop Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">

        {/* Left Sidebar: Watchlist (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl flex-grow overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <h3 className="font-semibold">Watchlist</h3>
            </div>
            <div className="p-4 flex-grow overflow-y-auto min-h-[400px]">
              {stocks.length > 0 ? (
                <DraggableWatchlist initialStocks={stocks} />
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-secondary/20">
                  No stocks tracked. Use the search bar to add one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Main Content (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-6">

          {/* Widgets Grid (Now includes News) */}
          <div className="w-full">
            <DraggableDashboard serverData={dashboardData} />
          </div>

        </div>
      </div>

    </div>
  );
}
