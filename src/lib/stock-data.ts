import yahooFinance from 'yahoo-finance2';
import { getCurrencySymbol } from "@/lib/utils";
import { fetchWithCache } from "@/lib/redis";

function safeNum(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'object' && 'raw' in val) return val.raw ?? null;
  return typeof val === 'number' ? val : null;
}

export async function getStockDetails(symbol: string) {
  return fetchWithCache(`stock:details:v3:${symbol.toUpperCase()}`, async () => {
    try {
      const yf = new ((yahooFinance as any).default || yahooFinance)({
        suppressNotices: ['yahooSurvey']
      });

      const [result, newsResult] = await Promise.all([
        yf.quoteSummary(symbol, {
          modules: [
            'price',
            'summaryDetail',
            'financialData',
            'defaultKeyStatistics',
            'recommendationTrend',
            'upgradeDowngradeHistory',
            'earnings',
            'summaryProfile',
          ]
        } as any),
        yf.search(symbol, { newsCount: 8, quotesCount: 0 })
      ]);

      const d = result as any;
      const price = d.price;
      const summary = d.summaryDetail;
      const fin = d.financialData;
      const stats = d.defaultKeyStatistics;
      const recs = d.recommendationTrend;
      const upgrades = d.upgradeDowngradeHistory;
      const earnings = d.earnings;
      const profile = d.summaryProfile;

      // Analyst Consensus (latest month)
      const latestRec = recs?.trend?.[0];
      const analystRatings = latestRec ? {
        strongBuy: latestRec.strongBuy ?? 0,
        buy: latestRec.buy ?? 0,
        hold: latestRec.hold ?? 0,
        sell: latestRec.sell ?? 0,
        strongSell: latestRec.strongSell ?? 0,
      } : null;

      // Recent upgrade/downgrade actions
      const recentUpgrades = (upgrades?.history || []).slice(0, 4).map((u: any) => ({
        date: u.epochGradeDate
          ? new Date(typeof u.epochGradeDate === 'number' && u.epochGradeDate < 1e12
            ? u.epochGradeDate * 1000   // seconds → ms
            : u.epochGradeDate           // already ms
          ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null,
        firm: u.firm,
        toGrade: u.toGrade,
        fromGrade: u.fromGrade,
        action: u.action,
      }));

      // Earnings quarters (last 4)
      const earningsHistory = (earnings?.earningsChart?.quarterly || []).slice(-4).map((q: any) => ({
        date: q.date,
        actual: safeNum(q.actual),
        estimate: safeNum(q.estimate),
      }));

      // Revenue / Earnings quarterly chart
      const financialsChart = (earnings?.financialsChart?.quarterly || []).slice(-4).map((q: any) => ({
        date: q.date,
        revenue: safeNum(q.revenue),
        earnings: safeNum(q.earnings),
      }));

      // Revenue / Earnings annual chart
      const financialsChartYearly = (earnings?.financialsChart?.yearly || []).slice(-4).map((q: any) => ({
        date: q.date,
        revenue: safeNum(q.revenue),
        earnings: safeNum(q.earnings),
      }));

      const priceTarget = safeNum(fin?.targetMeanPrice);

      return {
        symbol,
        price: safeNum(price?.regularMarketPrice) ?? 0,
        previousClose: safeNum(summary?.previousClose),
        open: safeNum(price?.regularMarketOpen),
        dayHigh: safeNum(price?.regularMarketDayHigh),
        dayLow: safeNum(price?.regularMarketDayLow),
        fiftyTwoWeekHigh: safeNum(summary?.fiftyTwoWeekHigh),
        fiftyTwoWeekLow: safeNum(summary?.fiftyTwoWeekLow),
        volume: safeNum(price?.regularMarketVolume),
        avgVolume: safeNum(summary?.averageVolume),
        currency: getCurrencySymbol(price?.currency),
        marketCap: safeNum(summary?.marketCap),
        exchange: price?.exchangeName || null,
        description: profile?.longBusinessSummary || null,
        sector: profile?.sector || null,
        industry: profile?.industry || null,

        // Financials
        financials: {
          marketCap: safeNum(summary?.marketCap),
          peRatio: safeNum(summary?.trailingPE),
          forwardPE: safeNum(summary?.forwardPE),
          pegRatio: safeNum(stats?.pegRatio),
          priceToSales: safeNum(summary?.priceToSalesTrailing12Months),
          priceToBook: safeNum(stats?.priceToBook),
          evToEbitda: safeNum(stats?.enterpriseToEbitda),
          revenue: safeNum(fin?.totalRevenue),
          revenueGrowth: safeNum(fin?.revenueGrowth),
          grossMargins: safeNum(fin?.grossMargins),
          profitMargin: safeNum(fin?.profitMargins),
          operatingMargins: safeNum(fin?.operatingMargins),
          ebitda: safeNum(fin?.ebitda),
          freeCashflow: safeNum(fin?.freeCashflow),
          roe: safeNum(fin?.returnOnEquity),
          debtToEquity: safeNum(fin?.debtToEquity),
          beta: safeNum(stats?.beta),
          targetPrice: priceTarget,
          targetLow: safeNum(fin?.targetLowPrice),
          targetHigh: safeNum(fin?.targetHighPrice),
          targetMedian: safeNum(fin?.targetMedianPrice),
          currentPrice: safeNum(fin?.currentPrice),
          totalAnalysts: safeNum(fin?.numberOfAnalystOpinions),
          recommendation: fin?.recommendationKey || null,
        },

        // Analyst
        analystRatings,
        recentUpgrades,

        // Earnings
        earningsHistory,
        financialsChart,
        financialsChartYearly,

        // News
        news: (newsResult.news || []).map((item: any) => ({
          uuid: item.uuid,
          title: item.title,
          publisher: item.publisher,
          link: item.link,
          providerPublishTime: item.providerPublishTime,
          thumbnail: item.thumbnail,
          summary: item.summary || item.snippet || ""
        }))
      };
    } catch (error) {
      console.error("Failed to fetch stock details:", error);
      return null;
    }
  }, 300); // Cache 5 mins
}

// Sector-based peer map
const SECTOR_PEERS: Record<string, string[]> = {
  // Semiconductors
  NVDA: ['AMD', 'TSM', 'AVGO', 'INTC', 'MU'],
  AMD: ['NVDA', 'TSM', 'INTC', 'AVGO', 'QCOM'],
  TSM: ['NVDA', 'AMD', 'AVGO', 'INTC', 'ASML'],
  INTC: ['NVDA', 'AMD', 'TSM', 'QCOM', 'MU'],
  AVGO: ['NVDA', 'AMD', 'TSM', 'QCOM', 'TXN'],
  MU: ['NVDA', 'AMD', 'TSM', 'INTC', 'WDC'],
  QCOM: ['AVGO', 'AMD', 'NVDA', 'TXN', 'INTC'],
  // Big Tech
  AAPL: ['MSFT', 'GOOGL', 'META', 'AMZN', 'TSLA'],
  MSFT: ['AAPL', 'GOOGL', 'META', 'AMZN', 'ORCL'],
  GOOGL: ['MSFT', 'AAPL', 'META', 'AMZN', 'SNAP'],
  GOOG: ['MSFT', 'AAPL', 'META', 'AMZN', 'SNAP'],
  META: ['GOOGL', 'MSFT', 'AAPL', 'AMZN', 'SNAP'],
  AMZN: ['MSFT', 'GOOGL', 'META', 'AAPL', 'NFLX'],
  // EV / Auto
  TSLA: ['RIVN', 'GM', 'F', 'NIO', 'LCID'],
  // Finance
  JPM: ['BAC', 'WFC', 'GS', 'MS', 'C'],
  BAC: ['JPM', 'WFC', 'GS', 'C', 'USB'],
  GS: ['MS', 'JPM', 'BAC', 'WFC', 'BLK'],
  MS: ['GS', 'JPM', 'BAC', 'WFC', 'BLK'],
  // Healthcare
  JNJ: ['PFE', 'MRK', 'ABBV', 'LLY', 'BMY'],
  PFE: ['JNJ', 'MRK', 'ABBV', 'LLY', 'BMY'],
  // Energy
  XOM: ['CVX', 'COP', 'SLB', 'EOG', 'OXY'],
  CVX: ['XOM', 'COP', 'SLB', 'EOG', 'OXY'],
};

export function getPeersForSymbol(symbol: string): string[] {
  return SECTOR_PEERS[symbol.toUpperCase()] ?? ['SPY', 'QQQ', 'MSFT', 'AAPL', 'AMZN'];
}

// Fetch lightweight peer comparison data
export async function getPeerQuotes(symbol: string, peers: string[]) {
  const cacheKey = `stock:peers:${symbol}:${peers.join('-')}`;
  return fetchWithCache(cacheKey, async () => {
    try {
      const yf = new ((yahooFinance as any).default || yahooFinance)({ suppressNotices: ['yahooSurvey'] });
      const quotes = await yf.quote(peers);
      return (Array.isArray(quotes) ? quotes : [quotes]).map((q: any) => ({
        symbol: q.symbol,
        name: q.shortName || q.longName || q.symbol,
        price: q.regularMarketPrice ?? 0,
        change: q.regularMarketChangePercent ?? 0,
        marketCap: q.marketCap ?? null,
        industry: q.industry ?? null,
      }));
    } catch {
      return [];
    }
  }, 120);
}