import { getMarketNews } from "@/lib/news";
import { NewsList } from "./NewsList";

export async function NewsFeed() {
  const news = await getMarketNews();

  if (!news.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">Market Pulse</h2>
      <NewsList news={news} />
    </div>
  );
}