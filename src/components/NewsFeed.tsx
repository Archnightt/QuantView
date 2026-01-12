"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Newspaper, Loader2, ChevronDown } from "lucide-react";
import { NewsItem } from "@/lib/news";

// Helper: Time Ago
function timeAgo(timestamp: number) {
  if (!timestamp) return '';
  const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

// Helper: Gradients
function getFallbackGradient(title: string) {
  const gradients = [
    "bg-gradient-to-br from-indigo-900 to-slate-900",
    "bg-gradient-to-br from-emerald-900 to-slate-900",
    "bg-gradient-to-br from-blue-900 to-slate-900",
    "bg-gradient-to-br from-violet-900 to-slate-900",
    "bg-gradient-to-br from-rose-900 to-slate-900",
  ];
  return gradients[title.length % gradients.length];
}

const CATEGORIES = [
  { id: "US Markets", label: "Top Stories" },
  { id: "Entertainment", label: "Entertainment" },
  { id: "Technology Stocks", label: "Technology" },
  { id: "Artificial Intelligence Market", label: "AI & Chips" },
  { id: "Cryptocurrency News", label: "Crypto" },
  { id: "Energy Sector", label: "Energy" },
  { id: "Biotech and Healthcare", label: "Healthcare" },
  { id: "Economy and Fed", label: "Economy" },
];

export function NewsFeed({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [loading, setLoading] = useState(false);
  const [currentCount, setCurrentCount] = useState(initialNews.length);
  const [activeCategory, setActiveCategory] = useState("US Markets");
  const [noMoreNews, setNoMoreNews] = useState(false);
  
  // Hero Autoplay State
  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Cycle Hero
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(5, news.length));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, news.length]);

  const changeCategory = async (catId: string) => {
    if (catId === activeCategory) return;
    setLoading(true);
    setActiveCategory(catId);
    setHeroIndex(0); // Reset hero
    setNews([]); 
    setNoMoreNews(false);
    
    try {
      const res = await fetch(`/api/news?count=20&category=${encodeURIComponent(catId)}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setNews(data);
      setCurrentCount(20);
    } catch (error) {
      console.error("Failed to fetch category:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoading(true);
    // Request 20 more than current
    const nextCount = currentCount + 20;
    try {
      const res = await fetch(`/api/news?count=${nextCount}&category=${encodeURIComponent(activeCategory)}`, {
        cache: 'no-store'
      });
      const newBatch = await res.json();
      
      if (newBatch.length <= news.length) {
        setNoMoreNews(true);
      }

      const existingIds = new Set(news.map(n => n.uuid));
      const uniqueNewStories = newBatch.filter((n: NewsItem) => !existingIds.has(n.uuid));
      
      if (uniqueNewStories.length > 0) {
        setNews(prev => [...prev, ...uniqueNewStories]);
        setCurrentCount(nextCount);
      } else {
        setNoMoreNews(true);
      }
    } catch (error) {
      console.error("Failed to load more news", error);
    } finally {
      setLoading(false);
    }
  };

  if (!news && !loading) return null;

  // Split Data
  const heroStories = news.slice(0, 5);
  const gridStories = news.slice(5);
  const currentHero = heroStories[heroIndex] || heroStories[0];
  const heroImage = currentHero?.thumbnail?.resolutions?.[0]?.url;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "default" : "outline"}
            onClick={() => changeCategory(cat.id)}
            className={`rounded-full whitespace-nowrap px-6 transition-all ${
              activeCategory === cat.id 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "bg-secondary/50 hover:bg-secondary border-transparent text-muted-foreground"
            }`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {loading && news.length === 0 && (
         <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      )}

      {/* 1. Hero Section (Autoplay) */}
      {currentHero && (
        <div 
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => setIsPaused(false)}
          className="relative h-[450px] w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-card dark:bg-transparent group"
        >
          {/* Main Clickable Area */}
          <Link href={currentHero.link} target="_blank" className="block w-full h-full">
            {/* Background */}
            <div className={`absolute inset-0 ${!heroImage ? getFallbackGradient(currentHero.title) : 'bg-zinc-900'}`}>
               {heroImage && (
                 <Image 
                   key={heroImage} // Force re-render for smooth fade
                   src={heroImage} 
                   alt={currentHero.title}
                   fill
                   className="object-cover transition-transform duration-700 group-hover:scale-105 animate-in fade-in zoom-in-50 duration-700"
                   priority
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                 />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
               {!heroImage && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Newspaper className="w-32 h-32 text-white" />
                  </div>
               )}
            </div>
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-4xl z-10">
               <div className="flex items-center gap-3 mb-4">
                 <span className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                   {currentHero.publisher}
                 </span>
                 <span className="text-white/80 text-sm flex items-center gap-1 font-medium bg-black/30 px-2 py-1 rounded-full backdrop-blur-md">
                   <Clock className="w-3 h-3" /> {timeAgo(currentHero.providerPublishTime)}
                 </span>
               </div>
               <h1 className="text-2xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:text-blue-200 transition-colors drop-shadow-md">
                 {currentHero.title}
               </h1>
               <p className="text-zinc-200 text-lg line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-sm">
                 {currentHero.summary}
               </p>
            </div>
          </Link>

          {/* Progress Indicators - Positioned on top, outside of the Link */}
          <div className="absolute top-6 right-6 flex gap-1 z-30">
            {heroStories.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  setHeroIndex(idx);
                  setIsPaused(true);
                }}
                className="group/dot p-2 focus:outline-none" 
                aria-label={`Go to story ${idx + 1}`}
              >
                <div 
                  className={`h-1 rounded-full transition-all duration-300 shadow-sm backdrop-blur-md ${
                    idx === heroIndex 
                      ? "w-6 bg-white" 
                      : "w-1.5 bg-white/40 group-hover/dot:bg-white/80 group-hover/dot:w-3"
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gridStories.map((story) => {
          const imgUrl = story.thumbnail?.resolutions?.[0]?.url;
          
          return (
            <Link href={story.link} key={story.uuid} target="_blank" className="group h-full block">
              <Card className="h-full border bg-card dark:bg-secondary/10 hover:shadow-md dark:hover:bg-secondary/20 transition-all duration-300 overflow-hidden flex flex-col shadow-sm">
                
                {/* Card Image Area */}
                <div className={`h-48 relative overflow-hidden ${!imgUrl ? getFallbackGradient(story.title) : 'bg-zinc-800'}`}>
                  {imgUrl ? (
                    <Image 
                      src={imgUrl} 
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full opacity-20">
                      <Newspaper className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {/* Subtle overlay on images too */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                </div>
                
                {/* Card Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                      {story.publisher}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {timeAgo(story.providerPublishTime)}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {story.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 leading-relaxed">
                    {story.summary}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto group/btn">
                     Read Full Article <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 3. Load More Button */}
      {!noMoreNews && (
        <div className="flex justify-center pt-8 pb-10">
           <Button 
             variant="outline" 
             size="lg" 
             onClick={loadMore} 
             disabled={loading}
             className="min-w-[200px] gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
           >
             {loading ? (
               <><Loader2 className="w-4 h-4 animate-spin" /> Loading Stories...</>
             ) : (
               <><ChevronDown className="w-4 h-4" /> Load More News</>
             )}
           </Button>
        </div>
      )}
      
    </div>
  );
}