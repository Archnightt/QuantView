import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDashboard() {
  return (
    <div className="home-dashboard-shell min-h-[calc(100vh-60px)]">
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 md:py-8 animate-pulse">
        {/* Market Indices Row */}
        <section className="space-y-4 border-b border-border/70 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-sm" />
              <Skeleton className="h-3 w-28 rounded-sm" />
            </div>
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-64 shrink-0 rounded-lg" />
            ))}
          </div>
        </section>

        {/* Middle Section: Metrics, Watchlist, Headlines */}
        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            {/* Metric Strip */}
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>

            {/* Watchlist */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-sm" />
                <Skeleton className="h-3 w-24 rounded-sm" />
              </div>
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <Skeleton className="h-10 w-48 rounded-md" />
                <Skeleton className="h-4 w-[400px] rounded-md max-w-full" />
              </div>

              {/* Watchlist Table */}
              <div className="overflow-hidden rounded-lg border border-border/70 shadow-sm">
                <div className="grid grid-cols-[1fr_0.5fr_0.5fr] border-b border-border/70 px-4 py-3 md:grid-cols-[0.8fr_0.4fr_0.4fr_2fr]">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="ml-auto h-3 w-12" />
                  <Skeleton className="ml-auto h-3 w-12" />
                  <Skeleton className="hidden md:block ml-auto h-3 w-16" />
                </div>
                <div className="divide-y divide-border/60">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_0.5fr_0.5fr] items-center gap-3 px-4 py-4 md:grid-cols-[0.8fr_0.4fr_0.4fr_2fr]"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="ml-auto h-4 w-16" />
                      <Skeleton className="ml-auto h-4 w-12" />
                      <Skeleton className="hidden md:block h-4 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Headlines */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-3.5 w-3.5 rounded-sm" />
              <Skeleton className="h-3 w-24 rounded-sm" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
