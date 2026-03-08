import yahooFinance from 'yahoo-finance2';
import { unstable_cache } from 'next/cache';
import { getStockHistory } from "@/lib/history";
import { prisma } from "@/lib/prisma";
import { getAIParsedCalendar } from "@/lib/calendar";

const MARKET_GROUPS = {
  crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'],
  rates: ['^TNX', '^TYX', '^FVX', '^IRX'], // 10y, 30y, 5y, 13wk Treasuries
  commodities: ['CL=F', 'GC=F', 'SI=F', 'NG=F', 'HG=F', 'ZC=F'], // Crude, Gold, Silver, Nat Gas, Copper, Corn
  currencies: ['EURUSD=X', 'JPY=X', 'GBPUSD=X', 'INR=X'],
  worldIndices: {
    america: ['^GSPC', '^DJI', '^IXIC', '^GSPTSE', '^BVSP', '^MXX'],
    europe: ['^GDAXI', '^FTSE', '^FCHI', '^STOXX50E', '^IBEX', '^FTSEMIB.MI'],
    asia: ['^N225', '^HSI', '^STI', '^NSEI', '^SSEC', '^AXJO']
  }
};

async function fetchDashboardData() {
  try {
    const yf = new ((yahooFinance as any).default || yahooFinance)({
      suppressNotices: ['yahooSurvey']
    });

    // 1. Fetch Featured Stock (Database)
    const featuredStock = await prisma.stock.findFirst({
      where: { isFeatured: true }
    });
    const heroSymbol = featuredStock ? featuredStock.symbol : 'AAPL';
    const heroName = featuredStock ? featuredStock.name : 'Apple Inc.';

    // 2. Fetch Dashboard Data
    const sectorSymbols = ['XLK', 'XLF', 'XLV', 'XLE', 'XLY', 'XLP', 'XLI', 'XLU', 'XLB', 'XLRE', 'XLC'];
    const summarySymbols = [
      ...MARKET_GROUPS.crypto,
      ...MARKET_GROUPS.rates,
      ...MARKET_GROUPS.commodities,
      ...MARKET_GROUPS.currencies
    ];

    // Comprehensive Index symbols
    const allWorldIndices = [
      ...MARKET_GROUPS.worldIndices.america,
      ...MARKET_GROUPS.worldIndices.europe,
      ...MARKET_GROUPS.worldIndices.asia
    ];

    // A. Quotes (Sectors + Market Summary + World Indices)
    const sectorsPromise = yf.quote(sectorSymbols);
    const summaryPromise = yf.quote(summarySymbols);
    const worldIndicesPromise = yf.quote(allWorldIndices);

    // B. Sector Sparklines
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const sparklinesPromise = Promise.all(
      sectorSymbols.map(sym =>
        yf.chart(sym, {
          period1: startDate,
          period2: endDate,
          interval: '1d'
        })
          .then((res: any) => ({ symbol: sym, data: res.quotes.map((q: any) => q.close) }))
          .catch(() => ({ symbol: sym, data: [] }))
      )
    );

    // C. Other Promises
    const vixPromise = yf.quote(['^VIX']);
    const trendingPromise = yf.trendingSymbols('US').catch(() => ({ quotes: [] }));

    // Use screener as dailyGainers/dailyLosers are deprecated
    const gainersPromise = yf.screener({ scrIds: 'day_gainers', count: 10 }, { validate: false } as any).catch(() => ({ quotes: [] }));
    const losersPromise = yf.screener({ scrIds: 'day_losers', count: 10 }, { validate: false } as any).catch(() => ({ quotes: [] }));

    // Fetch from multiple sources to guarantee volume
    const newsPromise = Promise.all([
      yf.search('^GSPC', { newsCount: 10, quotesCount: 0 }), // S&P 500
      yf.search('^DJI', { newsCount: 10, quotesCount: 0 }),  // Dow Jones
      yf.search('^IXIC', { newsCount: 10, quotesCount: 0 }), // Nasdaq
    ])
      .then(results => {
        const allNews = results.flatMap(r => r.news || []);
        // Deduplicate by UUID
        const seen = new Set();
        return allNews.filter(item => {
          if (!item.uuid || seen.has(item.uuid)) return false;
          seen.add(item.uuid);
          return true;
        });
      })
      .catch(() => []);

    // D. Economic Calendar
    const calendarPromise = getAIParsedCalendar().catch(() => []);

    // 5. Fetch Hero Chart History
    const heroPromise = getStockHistory(heroSymbol, '1mo');

    // 3. Resolve All
    const [sectors, rawSummary, sparklines, vix, trendingResult, gainersResult, losersResult, news, heroHistory, calendar, rawWorldIndices] = await Promise.all([
      sectorsPromise,
      summaryPromise,
      sparklinesPromise,
      vixPromise,
      trendingPromise,
      gainersPromise,
      losersPromise,
      newsPromise,
      heroPromise,
      calendarPromise,
      worldIndicesPromise
    ]);

    // 4. Process Data
    const enhancedSectors = (sectors || []).map((sector: any) => {
      const spark = sparklines.find((s: any) => s.symbol === sector.symbol);
      return { ...sector, sparkline: spark ? spark.data : [] };
    });

    const marketSummary = {
      crypto: rawSummary.filter((q: any) => MARKET_GROUPS.crypto.includes(q.symbol)),
      rates: rawSummary.filter((q: any) => MARKET_GROUPS.rates.includes(q.symbol)),
      commodities: rawSummary.filter((q: any) => MARKET_GROUPS.commodities.includes(q.symbol)),
      currencies: rawSummary.filter((q: any) => MARKET_GROUPS.currencies.includes(q.symbol)),
    };

    const formattedNews = news.slice(0, 10).map((item: any) => ({
      uuid: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.thumbnail,
      summary: item.summary || item.snippet || ""
    }));

    const trendingQuotes = trendingResult?.quotes?.slice(0, 5) || [];
    // Ensure gainers/losers are arrays. Some versions return { quotes: [] }, others return [].
    const gainers = (gainersResult as any)?.quotes || (Array.isArray(gainersResult) ? gainersResult : []);
    const losers = (losersResult as any)?.quotes || (Array.isArray(losersResult) ? losersResult : []);

    const worldIndices = {
      america: rawWorldIndices.filter((q: any) => MARKET_GROUPS.worldIndices.america.includes(q.symbol)),
      europe: rawWorldIndices.filter((q: any) => MARKET_GROUPS.worldIndices.europe.includes(q.symbol)),
      asia: rawWorldIndices.filter((q: any) => MARKET_GROUPS.worldIndices.asia.includes(q.symbol)),
    };

    return {
      sectors: enhancedSectors,
      marketSummary,
      worldIndices,
      vix: vix ? vix[0] : null,
      trending: trendingQuotes,
      gainers: gainers.slice(0, 10),
      losers: losers.slice(0, 10),
      calendar: calendar,
      heroHistory: heroHistory || [],
      heroSymbol,
      heroName,
      news: formattedNews
    };

  } catch (error) {
    console.error("Dashboard Data Fatal Error:", error);
    return {
      sectors: [],
      marketSummary: { crypto: [], rates: [], commodities: [], currencies: [] },
      worldIndices: { america: [], europe: [], asia: [] },
      vix: null,
      trending: [],
      gainers: [],
      losers: [],
      calendar: [],
      heroHistory: [],
      heroSymbol: 'AAPL',
      heroName: 'Apple Inc.',
      news: []
    };
  }
}

export const getDashboardData = unstable_cache(
  fetchDashboardData,
  ['dashboard-data-cache'],
  { revalidate: 60 } // Cache for 1 minute
);