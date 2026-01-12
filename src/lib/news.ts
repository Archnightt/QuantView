import yahooFinance from 'yahoo-finance2';

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
  try {
    // @ts-ignore
    const yf = new yahooFinance();
    
    // Perform two parallel searches to ensure we get enough items (Yahoo often caps at 10 per query)
    const [res1, res2] = await Promise.all([
      yf.search(query, { newsCount: count, quotesCount: 0 }),
      yf.search(query + ' economy stocks', { newsCount: count, quotesCount: 0 })
    ]);

    const allNews = [...(res1.news || []), ...(res2.news || [])];
    
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
}

export async function getMarketNews(): Promise<NewsItem[]> {
   // Unify logic to ensure consistency across dashboard and news page
   return await getFullNewsFeed(10);
}