import yahooFinance from 'yahoo-finance2';
import { getStockHistory } from "@/lib/history";
import { prisma } from "@/lib/prisma";

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

    // A. Sector Quotes
    const sectorsPromise = yf.quote(sectorSymbols);

    // B. Sector Sparklines (The Fix: Use Date objects instead of "range")
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // Go back 7 days to ensure 5 trading days

    const sparklinesPromise = Promise.all(
      sectorSymbols.map(sym => 
        yf.chart(sym, { 
          period1: startDate, 
          period2: endDate, 
          interval: '1d' 
        })
        .then(res => ({ symbol: sym, data: res.quotes.map((q: any) => q.close) }))
        .catch((e) => {
          // console.warn(`Sparkline failed for ${sym}`, e);
          return { symbol: sym, data: [] };
        })
      )
    );

    // C. Other Promises
    const vixPromise = yf.quote(['^VIX']);
    
    // Safe Trending Fetch
    const trendingPromise = yf.trendingSymbols('US').catch(() => ({ quotes: [] }));

    // Safe News Fetch (Search fallback)
    const newsPromise = yf.search('Business News', { newsCount: 5, quotesCount: 0 })
      .then(res => res.news || [])
      .catch(() => []);

    // D. Hero Chart History
    const heroPromise = getStockHistory(heroSymbol);

    // 3. Resolve All
    const [sectors, sparklines, vix, trendingResult, news, heroHistory] = await Promise.all([
      sectorsPromise,
      sparklinesPromise,
      vixPromise, 
      trendingPromise,
      newsPromise,
      heroPromise
    ]);

    // 4. Merge Sparklines into Sectors
    const enhancedSectors = (sectors || []).map((sector: any) => {
      const spark = sparklines.find(s => s.symbol === sector.symbol);
      return { ...sector, sparkline: spark ? spark.data : [] };
    });

    // 5. Format News
    const formattedNews = news.map((item: any) => ({
      uuid: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.thumbnail,
      summary: item.summary || item.snippet || ""
    }));

    // 6. Format Trending
    const trendingQuotes = trendingResult?.quotes?.slice(0, 5) || [];

    return {
      sectors: enhancedSectors,
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
      vix: null, 
      trending: [], 
      heroHistory: [], 
      heroSymbol: 'AAPL', 
      heroName: 'Apple Inc.',
      news: [] 
    };
  }
}
