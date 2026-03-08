import yahooFinance from 'yahoo-finance2';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

async function getIndicesData() {
  const symbols = ['^GSPC', '^IXIC', '^DJI', '^NSEI', '^BSESN'];
  try {
    const yf = new ((yahooFinance as any).default || yahooFinance)({
      suppressNotices: ['yahooSurvey']
    });

    // Fetch quotes and sparklines in parallel
    const promises = symbols.map(async (sym) => {
      try {
        // Calculate dates for 5-day history
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
  const width = 100;
  const height = 30;

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
        strokeWidth="2"
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
    <div className="flex flex-row gap-4 overflow-x-auto pb-4 mb-2 w-full no-scrollbar px-1">
      {indices.map((item) => {
        const { symbol, quote, chart } = item!;
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChange || 0;
        const changePercent = quote.regularMarketChangePercent || 0;
        const isPositive = change >= 0;
        const color = isPositive ? "#10b981" : "#ef4444"; // emerald-500 : red-500

        // Extract closes for sparkline
        const sparkData = (chart as any)?.quotes?.map((q: any) => q.close).filter((c: any) => c) || [];

        return (
          <Card
            key={symbol}
            className="min-w-[200px] flex-1 p-4 bg-card hover:shadow-md transition-all duration-200 shrink-0 border-border"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {getName(symbol)}
                </div>
                <div className="text-lg font-bold mt-1 text-foreground">
                  {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className={`flex flex-col items-end text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                <span className="flex items-center">
                  {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {changePercent.toFixed(2)}%
                </span>
                <span className="opacity-80">
                  {change > 0 ? '+' : ''}{change.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sparkline Area */}
            <div className="h-8 w-full mt-2 opacity-80">
              <Sparkline data={sparkData} color={color} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
