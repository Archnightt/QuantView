"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
	if (!news || news.length === 0) return null;

	return (
		<Card className="flex flex-col bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 overflow-hidden">
			<div className="p-4 border-b border-border/50 bg-muted/20 flex items-center gap-2">
				<h3 className="font-semibold">Latest News</h3>
				<span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{news.length} updates</span>
			</div>

			<div className="flex-grow overflow-y-auto p-4 space-y-4 max-h-[500px] scrollbar-thin scrollbar-thumb-secondary">
				{news.map((story, i) => (
					<div key={i} className="group flex gap-4 p-4 rounded-lg bg-card/40 border border-transparent hover:border-border/50 hover:bg-card/60 transition-colors">
						{/* Thumbnail */}
						{story.thumbnail?.resolutions?.[0]?.url && (
							<div className="relative w-16 h-16 shrink-0 rounded-md overflow-hidden bg-muted">
								<Image
									src={story.thumbnail.resolutions[0].url}
									alt="thumbnail"
									fill
									className="object-cover transition-transform group-hover:scale-110"
									sizes="64px"
								/>
							</div>
						)}

						{/* Content */}
						<div className="flex flex-col flex-grow min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{story.publisher}</span>
								<span className="text-[10px] text-muted-foreground/70">• {timeAgo(story.providerPublishTime)}</span>
							</div>
							<Link href={story.link} target="_blank" className="block">
								<h4 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
									{story.title}
								</h4>
							</Link>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}