import yahooFinance from 'yahoo-finance2';
import { fetchWithCache } from './redis';

export interface StockHistory {
  date: string;
  price: number | null;
}

type Range = '1d' | '1w' | '1mo' | '1y';

export async function getStockHistory(symbol: string, range: Range = '1mo'): Promise<StockHistory[]> {
  const cacheKey = `stock:history:${symbol.toUpperCase()}:${range}`;
  
  // Dynamic TTL based on range
  let ttl = 3600; // default 1 hour
  if (range === '1d') ttl = 900; // 15 mins
  if (range === '1w') ttl = 3600; // 1 hour
  if (range === '1mo') ttl = 43200; // 12 hours
  if (range === '1y') ttl = 86400; // 24 hours

  return fetchWithCache(cacheKey, async () => {
    try {
      const now = new Date();
      let period1 = new Date();
      let interval: '1d' | '5m' | '15m' | '1wk' | '1mo' = '1d';

      switch (range) {
        case '1d':
          period1 = new Date(now.setDate(now.getDate() - 4)); // Back 4 days for weekends
          interval = '5m';
          break;
        case '1w':
          period1 = new Date(now.setDate(now.getDate() - 7));
          interval = '15m';
          break;
        case '1mo':
          period1 = new Date(now.setMonth(now.getMonth() - 1));
          interval = '1d'; // Daily for 1mo
          break;
        case '1y':
          period1 = new Date(now.setFullYear(now.getFullYear() - 1));
          interval = '1d';
          break;
        default:
          period1 = new Date(now.setMonth(now.getMonth() - 1));
          interval = '1d';
      }

      // @ts-ignore
      const yf = new yahooFinance();

      const result = await yf.chart(symbol, {
        period1,
        interval,
      });

      if (!result || !result.quotes) return [];

      return result.quotes.map((day: any) => {
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