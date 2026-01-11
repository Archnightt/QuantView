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

export async function getMarketNews(): Promise<NewsItem[]> {
  try {
    // @ts-ignore
    const yf = new yahooFinance();
    
    // Fallback: Use Search. 
    // We search for "Business" to get general market news.
    // Note: Search results often lack the full "summary" field, 
    // but this prevents the dashboard from crashing.
    const result = await yf.search('Business News', { 
      newsCount: 10, 
      quotesCount: 0 
    });

    if (!result.news || result.news.length === 0) return [];

    return result.news.map((item: any) => ({
      uuid: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.thumbnail,
      // Some search results might hide snippets in other fields, 
      // but usually they are just titles. We handle missing summaries in the UI.
      summary: item.summary || item.snippet || "" 
    })) as NewsItem[];

  } catch (error) {
    console.error("Failed to fetch market news:", error);
    return [];
  }
}