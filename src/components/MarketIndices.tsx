import yahooFinance from 'yahoo-finance2';
import { TrendingUp, TrendingDown } from "lucide-react";

async function getIndicesData() {
  const symbols = ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN'];
  try {
    const yf = new ((yahooFinance as any).default || yahooFinance)({
      suppressNotices: ['yahooSurvey']
    });

    const promises = symbols.map(async (sym) => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 5);

        const [quote, chart] = await Promise.all([
          yf.quote(sym),
          yf.chart(sym, {
            period1: startDate,
            period2: endDate,
            interval: '60m'
          } as any)
        ]);
        return { symbol: sym, quote, chart };
      } catch (e) {
        console.error(`Failed to fetch index ${sym}`, e);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
  } catch (error) {
    console.error("Failed to fetch indices", error);
    return [];
  }
}

// Simple SVG Sparkline Component
function Sparkline({ data, color }: { data: number[], color: string }) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function MarketIndices() {
  const indices = await getIndicesData();

  if (!indices.length) return null;

  const getName = (symbol: string) => {
    const map: Record<string, string> = {
      '^GSPC': 'S&P 500',
      '^IXIC': 'Nasdaq',
      '^DJI': 'Dow 30',
      '^NSEI': 'Nifty 50',
      '^BSESN': 'Sensex'
    };
    return map[symbol] || symbol;
  };

  return (
    <div className="flex flex-row gap-3 overflow-x-auto pb-2 w-full no-scrollbar">
      {indices.map((item) => {
        const { symbol, quote, chart } = item!;
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        const isPositive = change >= 0;
        const color = isPositive ? "#10b981" : "#ef4444";

        const sparkData = (chart as any)?.quotes?.map((q: any) => q.close).filter((c: any) => c) || [];

        return (
          <div
            key={symbol}
            className={`min-w-[190px] flex-1 shrink-0 rounded-xl border border-border/60 bg-card hover:shadow-md transition-all duration-200 p-3.5 overflow-hidden relative ${isPositive ? 'glow-gain' : 'glow-loss'}`}
          >
            {/* Left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />

            <div className="flex justify-between items-start mb-2 pl-1">
              <div>
                <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  {getName(symbol)}
                </div>
                {/* Price in display serif */}
                <div className="font-display text-xl leading-tight tabular text-foreground">
                  {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              {/* % change in mono */}
              <div className={`flex flex-col items-end text-xs font-mono font-semibold leading-tight tabular ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                <span className="flex items-center gap-0.5">
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {changePercent.toFixed(2)}%
                </span>
                <span className="text-[10px] opacity-80 mt-0.5">
                  {change > 0 ? '+' : ''}{change.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="h-7 w-full pl-1 opacity-75">
              <Sparkline data={sparkData} color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
