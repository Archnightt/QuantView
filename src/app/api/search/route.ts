import { NextResponse } from 'next/server';
import { fetchWithCache } from '@/lib/redis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    const results = await fetchWithCache(`search:query:${query.toLowerCase()}`, async () => {
      // Fetch directly from Yahoo's public API (no library needed)
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`;
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0' // Yahoo requires a user-agent
        }
      });
      
      const data = await res.json();
      return data.quotes || [];
    }, 86400); // Cache search results for 24 hours
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Search Proxy Error:', error);
    return NextResponse.json([]);
  }
}