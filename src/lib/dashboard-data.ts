import yahooFinance from 'yahoo-finance2';
import { getStockHistory } from "@/lib/history";
import { prisma } from "@/lib/prisma";

const MARKET_GROUPS = {
  crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'DOGE-USD'],
  rates: ['^TNX', '^TYX', '^FVX', '^IRX'], // 10y, 30y, 5y, 13wk Treasuries
  commodities: ['CL=F', 'GC=F', 'SI=F', 'NG=F'], // Crude, Gold, Silver, Nat Gas
  currencies: ['EURUSD=X', 'JPY=X', 'GBPUSD=X', 'INR=X']
};

export async function getDashboardData() {
  try {
    // @ts-ignore
    const yf = new yahooFinance();
    
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

    // A. Quotes (Sectors + Market Summary)
    const sectorsPromise = yf.quote(sectorSymbols);
    const summaryPromise = yf.quote(summarySymbols);

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
        .then(res => ({ symbol: sym, data: res.quotes.map((q: any) => q.close) }))
        .catch(() => ({ symbol: sym, data: [] }))
      )
    );

    // C. Other Promises
    const vixPromise = yf.quote(['^VIX']);
    const trendingPromise = yf.trendingSymbols('US').catch(() => ({ quotes: [] }));
    
    // Fetch from multiple sources to guarantee volume
    const newsPromise = Promise.all([
      yf.search('Finance News', { newsCount: 10, quotesCount: 0 }),
      yf.search('Stock Market', { newsCount: 10, quotesCount: 0 }),
      yf.search('Economy', { newsCount: 10, quotesCount: 0 })
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

    const heroPromise = getStockHistory(heroSymbol);

    // 3. Resolve All
    const [sectors, rawSummary, sparklines, vix, trendingResult, news, heroHistory] = await Promise.all([
      sectorsPromise,
      summaryPromise,
      sparklinesPromise,
      vixPromise, 
      trendingPromise,
      newsPromise,
      heroPromise
    ]);

    // 4. Process Data
    const enhancedSectors = (sectors || []).map((sector: any) => {
      const spark = sparklines.find(s => s.symbol === sector.symbol);
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

    return {
      sectors: enhancedSectors,
      marketSummary,
      vix: vix ? vix[0] : null,
      trending: trendingQuotes,
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
      vix: null, 
      trending: [], 
      heroHistory: [], 
      heroSymbol: 'AAPL', 
      heroName: 'Apple Inc.',
      news: [] 
    };
  }
}