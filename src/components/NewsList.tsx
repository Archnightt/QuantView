import { NewsItem } from "@/lib/news";
import { Card } from "@/components/ui/card";
import { ExternalLink, Clock } from "lucide-react";
import Link from "next/link";

function TimeAgo({ timestamp }: { timestamp: number }) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let timeString = "";
  if (diffInSeconds < 60) timeString = "Just now";
  else if (diffInSeconds < 3600) timeString = `${Math.floor(diffInSeconds / 60)}m ago`;
  else if (diffInSeconds < 86400) timeString = `${Math.floor(diffInSeconds / 3600)}h ago`;
  else timeString = `${Math.floor(diffInSeconds / 86400)}d ago`;

  return <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {timeString}</span>;
}

export function NewsList({ news }: { news: NewsItem[] }) {
  if (!news.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map((item) => {
        const hasImage = item.thumbnail && item.thumbnail.resolutions?.length > 0;
        const imageUrl = hasImage ? item.thumbnail!.resolutions[0].url : null;

        return (
          <Link key={item.uuid} href={item.link} target="_blank" className="group">
            <Card className="h-full border-0 bg-secondary/20 hover:bg-secondary/40 transition-colors overflow-hidden flex flex-col">
              {imageUrl && (
                <div className="h-40 w-full overflow-hidden bg-muted">
                  <img 
                    src={imageUrl} 
                    alt="News thumbnail" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.publisher}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-medium leading-snug text-foreground group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="mt-auto pt-2 border-t border-border/50">
                  <TimeAgo timestamp={item.providerPublishTime} />
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
