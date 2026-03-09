export default function StockLoading() {
  return (
    <div className="min-h-screen bg-[#0c0d0f] p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      {/* Back link */}
      <div className="w-36 h-4 bg-white/5 rounded mb-8" />

      {/* Hero */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5" />
          <div className="space-y-2">
            <div className="w-28 h-7 bg-white/8 rounded" />
            <div className="w-48 h-4 bg-white/5 rounded" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="w-36 h-10 bg-white/8 rounded ml-auto" />
          <div className="w-24 h-7 bg-white/5 rounded ml-auto" />
        </div>
      </div>

      {/* Stat strip */}
      <div className="flex gap-6 pb-4 mb-5 border-b border-white/5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1.5 shrink-0">
            <div className="w-16 h-2.5 bg-white/5 rounded" />
            <div className="w-20 h-4 bg-white/8 rounded" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="w-full h-[380px] bg-white/3 rounded-2xl border border-white/5 mb-6" />

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 mb-8">
        {["Summary", "Financials", "Analysis"].map(t => (
          <div key={t} className="pb-2.5">
            <div className="w-20 h-3 bg-white/8 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeletons */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-white/3 rounded-xl border border-white/5" />
        ))}
      </div>
    </div>
  );
}
