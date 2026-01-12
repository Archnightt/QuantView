import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function timeAgo(timestamp: number) {
  if (!timestamp) return '';
  const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export function CompanyNews({ news, symbol }: { news: any[], symbol: string }) {
  if (!news || news.length === 0) {
    return (
        <Card className="border bg-card shadow-sm">
            <CardHeader>
                <CardTitle>Latest Updates for {symbol}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">No recent news found.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="border bg-card shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4">
        <CardTitle className="text-2xl">Latest Headlines for {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {news.map((item) => (
            <Link 
              href={item.link} 
              key={item.uuid} 
              target="_blank" 
              className="flex flex-col md:flex-row gap-6 group bg-card hover:bg-secondary/30 transition-all duration-200 p-6"
            >
               {/* Larger Thumbnail Section */}
               <div className="relative w-full md:w-64 h-48 md:h-40 flex-shrink-0 bg-secondary/30 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                 {item.thumbnail?.resolutions?.[0]?.url ? (
                   <Image 
                     src={item.thumbnail.resolutions[0].url} 
                     alt="News Thumbnail" 
                     fill 
                     className="object-cover transition-transform duration-500 group-hover:scale-105"
                     sizes="(max-width: 768px) 100vw, 300px"
                   />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                     No Image
                   </div>
                 )}
               </div>
               
               {/* Larger Text Content */}
               <div className="flex-1 flex flex-col justify-center min-w-0 space-y-3">
                 <div>
                   <div className="flex justify-between items-start gap-2 mb-2">
                     <span className="text-sm text-primary font-semibold uppercase tracking-wider">
                        {item.publisher}
                     </span>
                     <span className="text-sm text-muted-foreground whitespace-nowrap font-medium tabular-nums">
                       {timeAgo(item.providerPublishTime)}
                     </span>
                   </div>
                   <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3">
                     {item.title}
                   </h3>
                 </div>
                 
                 <p className="text-base text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed hidden md:block">
                   {item.summary}
                 </p>
               </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}