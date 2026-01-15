import yahooFinance from 'yahoo-finance2';
import { fetchWithCache } from '@/lib/redis';

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  thumbnail?: {
    resolutions: { url: string; width: number; height: number }[];
  };
  summary?: string; 
}

export async function getFullNewsFeed(count: number = 20, query: string = 'US Markets'): Promise<NewsItem[]> {
  return fetchWithCache(`news:feed:${query}:${count}`, async () => {
    try {
      // @ts-ignore
      const yf = new yahooFinance();
      
      // Perform multiple parallel searches to ensure we get enough items (Yahoo often caps at 10 per query)
      // We request more than needed to handle deduplication and API limits
      const fetchCount = Math.max(count, 30);
      const [res1, res2, res3, res4] = await Promise.all([
        yf.search(query, { newsCount: fetchCount, quotesCount: 0 }),
        yf.search('Tech Stocks', { newsCount: fetchCount, quotesCount: 0 }),
        yf.search('Economy News', { newsCount: fetchCount, quotesCount: 0 }),
        yf.search('Global Finance', { newsCount: fetchCount, quotesCount: 0 })
      ]);

      const allNews = [
        ...(res1.news || []), 
        ...(res2.news || []),
        ...(res3.news || []),
        ...(res4.news || [])
      ];
      
      if (allNews.length === 0) return [];

      // Deduplicate by UUID
      const seen = new Set();
      const uniqueNews = allNews.filter(item => {
        if (!item.uuid || seen.has(item.uuid)) return false;
        seen.add(item.uuid);
        return true;
      });

      return uniqueNews.slice(0, count).map((item: any) => ({
        uuid: item.uuid,
        title: item.title,
        publisher: item.publisher,
        link: item.link,
        providerPublishTime: item.providerPublishTime,
        thumbnail: item.thumbnail,
        summary: item.summary || item.snippet || "" 
      })) as NewsItem[];

    } catch (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
  }, 600); // Cache for 10 minutes
}

export async function getMarketNews(): Promise<NewsItem[]> {
   // Unify logic to ensure consistency across dashboard and news page
   return await getFullNewsFeed(14);
}