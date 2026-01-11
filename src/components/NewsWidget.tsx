"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

// Helper for "2h ago"
function timeAgo(timestamp: number) {
  if (!timestamp) return '';
  const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000); // *1000 if timestamp is seconds
  let interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

export function NewsWidget({ news }: { news: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-Slide (6s)
  useEffect(() => {
    if (isPaused || !news || news.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    timerRef.current = id;
    return () => clearInterval(id);
  }, [isPaused, news]);

  if (!news || news.length === 0) return null;

  const story = news[currentIndex];
  // Safe image handling
  const imageUrl = story.thumbnail?.resolutions?.[0]?.url;

  const nextStory = () => setCurrentIndex((prev) => (prev + 1) % news.length);
  const prevStory = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

  return (
		<Card className="group relative h-full w-full overflow-hidden border-0 bg-zinc-900 flex flex-col justify-end" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
			{/* 1. Background Image */}
			<div className="absolute inset-0 z-0">
				{imageUrl ? (
					<img src={imageUrl} alt="News Background" className="w-full h-full object-cover opacity-60 transition-transform duration-[10s] ease-linear scale-100 group-hover:scale-110" />
				) : (
					<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black opacity-80" />
				)}
				{/* Vignette Gradient (Darkens the bottom for text) */}
				<div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
			</div>

			{/* 2. Progress Bar */}
			{!isPaused && <div key={currentIndex} className="absolute top-0 left-0 h-1 bg-primary z-20 animate-[progress_6s_linear_forwards]" style={{ width: "100%" }} />}

			{/* 3. Content Area (The Vignette) */}
			<div className="relative z-10 p-6 flex flex-col gap-3">
				{/* Metadata Row */}
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-bold text-black bg-white/90 px-2 py-0.5 rounded uppercase tracking-wider">{story.publisher}</span>
					<span className="text-xs text-zinc-400 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
						<Clock className="w-3 h-3" />
						{timeAgo(story.providerPublishTime)}
					</span>
				</div>

				{/* Title */}
				<Link href={story.link} target="_blank" className="block group/link">
					<h3 className="text-xl font-bold leading-tight text-white group-hover/link:text-blue-300 transition-colors">{story.title}</h3>
				</Link>

				{/* The Insight / Summary */}
				{story.summary && <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed opacity-90">{story.summary}</p>}

				{/* Navigation Controls (Bottom Right) */}
				<div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
					<span className="text-[10px] text-zinc-500 tabular-nums">
						{currentIndex + 1} / {news.length}
					</span>
					<div className="flex gap-2">
						<Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={prevStory}>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={nextStory}>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes progress {
					from {
						width: 0%;
					}
					to {
						width: 100%;
					}
				}
			`}</style>
		</Card>
	);
}