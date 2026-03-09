"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function timeAgo(timestamp: number) {
	if (!timestamp) return '';
	const seconds = Math.floor((new Date().getTime() - timestamp * 1000) / 1000);
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
	const imageUrl = story.thumbnail?.resolutions?.[0]?.url;

	const nextStory = () => setCurrentIndex((prev) => (prev + 1) % news.length);
	const prevStory = () => setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);

	return (
		<Card
			className="group relative h-full w-full overflow-hidden flex flex-col justify-end border-border bg-neutral-950"
			onMouseEnter={() => setIsPaused(true)}
			onMouseLeave={() => setIsPaused(false)}
		>
			{/* Progress bar */}
			{!isPaused && (
				<div
					key={currentIndex}
					className="absolute top-0 left-0 h-[2px] z-20"
					style={{
						background: 'hsl(var(--brand))',
						animation: 'progress 6s linear forwards',
					}}
				/>
			)}

			{/* Background Image */}
			<div className="absolute inset-0 z-0">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt="News Background"
						fill
						className="object-cover transition-transform ease-linear scale-100 group-hover:scale-110"
						style={{ transitionDuration: '10s' }}
						priority
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					/>
				) : (
					<div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black opacity-80" />
				)}
				{/* Strong vignette */}
				<div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />
				{/* Brand accent line on top edge */}
				<div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, hsl(var(--brand)) 0%, hsl(var(--brand)/0.2) 100%)' }} />
			</div>

			{/* Content */}
			<div className="relative z-10 p-5 flex flex-col gap-2.5">
				{/* Publisher + time */}
				<div className="flex items-center justify-between">
					<span className="text-[10px] font-mono font-bold text-black bg-brand px-2 py-0.5 rounded uppercase tracking-wider">
						{story.publisher}
					</span>
					<span className="text-[10px] font-mono text-zinc-300 flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
						<Clock className="w-2.5 h-2.5" />
						{timeAgo(story.providerPublishTime)}
					</span>
				</div>

				{/* Headline — editorial large treatment */}
				<Link href={story.link} target="_blank" className="block group/link">
					<h3 className="font-display text-xl leading-tight text-white group-hover/link:text-brand transition-colors">
						{story.title}
					</h3>
				</Link>

				{/* Summary */}
				{story.summary && (
					<p className="text-[12px] font-sans font-light text-zinc-300 line-clamp-2 leading-relaxed opacity-90">
						{story.summary}
					</p>
				)}

				{/* Nav controls */}
				<div className="flex items-center justify-between pt-2 border-t border-white/10">
					<span className="text-[10px] font-mono text-zinc-400 tabular">
						{currentIndex + 1} / {news.length}
					</span>
					<div className="flex gap-1.5">
						<Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full" onClick={prevStory}>
							<ChevronLeft className="w-3.5 h-3.5" />
						</Button>
						<Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full" onClick={nextStory}>
							<ChevronRight className="w-3.5 h-3.5" />
						</Button>
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes progress {
					from { width: 0%; }
					to { width: 100%; }
				}
			`}</style>
		</Card>
	);
}