import yahooFinance from 'yahoo-finance2';
import { fetchWithCache } from './redis';

export interface StockHistory {
  date: string;
  price: number | null;
}

type Range = '1d' | '5d' | '1mo' | '6mo' | 'ytd' | '1y' | '5y';

export async function getStockHistory(symbol: string, range: Range = '1mo'): Promise<StockHistory[]> {
  const cacheKey = `v2:stock:history:${symbol.toUpperCase()}:${range}`;

  // Dynamic TTL based on range
  let ttl = 3600; // default 1 hour
  if (range === '1d') ttl = 300; // 5 mins
  if (range === '5d') ttl = 900; // 15 mins
  if (range === '1mo') ttl = 3600; // 1 hour
  if (range === '6mo') ttl = 21600; // 6 hours
  if (range === 'ytd') ttl = 21600; // 6 hours
  if (range === '1y') ttl = 43200; // 12 hours
  if (range === '5y') ttl = 86400; // 24 hours

  return fetchWithCache(cacheKey, async () => {
    try {
      const now = new Date();
      let period1 = new Date();
      let interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1d';

      // Clone date to avoid mutation issues if we used the same object
      const start = new Date(now);

      switch (range) {
        case '1d':
          // Fetching last 2 days to ensure we get "today's" intraday data even across UTC boundaries or weekends
          // But actually period1 is the START time.
          // For 1d, usually we want from market open. 
          // Yahoo finance chart often handles "1d" range automatically if we don't pass period1/2 strictly?
          // The library requires period1. 
          // Let's do 24h ago or from last close? 
          // "1d" usually implies "Today".
          start.setDate(start.getDate() - 2); // Go back a bit to catch open
          interval = '5m';
          break;
        case '5d':
          start.setDate(start.getDate() - 7); // 5 trading days approx 7 calendar days
          interval = '15m';
          break;
        case '1mo':
          start.setMonth(start.getMonth() - 1);
          interval = '1d';
          break;
        case '6mo':
          start.setMonth(start.getMonth() - 6);
          interval = '1d';
          break;
        case 'ytd':
          start.setMonth(0, 1); // Jan 1st
          start.setHours(0, 0, 0, 0);
          interval = '1d';
          break;
        case '1y':
          start.setFullYear(start.getFullYear() - 1);
          interval = '1d';
          break;
        case '5y':
          start.setFullYear(start.getFullYear() - 5);
          interval = '1wk';
          break;
        default:
          start.setMonth(start.getMonth() - 1);
          interval = '1d';
      }

      const yf = new ((yahooFinance as any).default || yahooFinance)({
        suppressNotices: ['yahooSurvey']
      });

      const result = await yf.chart(symbol, {
        period1: start,
        interval,
      });

      if (!result || !result.quotes) return [];

      let quotes = result.quotes;

      // Filter for strictly the requested range if needed?
      // Yahoo usually returns data starting from period1. 
      // For '1d', we might get 2 days if we asked for 2. 
      // Let's filter on the client side (UI) or just return what we have.
      // Ideally for 1d we only want "today" or "latest trading session".

      return quotes.map((day: any) => {
        // Handle date parsing safely
        const dateObj = new Date(day.date);
        let dateStr = dateObj.toISOString(); // Use ISO for consistency with recharts

        return {
          date: dateStr,
          price: day.close ? parseFloat(day.close.toFixed(2)) : null,
        };
      }).filter((d: any) => d.price !== null);

    } catch (error) {
      console.error(`Failed to fetch history for ${symbol}:`, error);
      return [];
    }
  }, ttl);
}
