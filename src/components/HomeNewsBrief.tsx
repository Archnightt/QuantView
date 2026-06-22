"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";

export type HomeNewsStory = {
  uuid?: string;
  title?: string;
  publisher?: string;
  link?: string;
  providerPublishTime?: number;
  thumbnail?: {
    resolutions?: Array<{ url?: string }>;
  };
  summary?: string;
};

function getStoryImage(story?: HomeNewsStory) {
  return story?.thumbnail?.resolutions?.[0]?.url;
}

function getRelativeTime(timestamp?: number) {
  if (!timestamp) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp * 1000) / 1000));
  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}h ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m ago`;

  return "Just now";
}

export function HomeNewsBrief({ stories }: { stories: HomeNewsStory[] }) {
  const cleanStories = useMemo(() => stories.filter((story) => story.title), [stories]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStory = cleanStories[activeIndex] || cleanStories[0];
  const activeImage = getStoryImage(activeStory);

  if (!activeStory) {
    return (
      <div className="rounded-lg border border-border/70 bg-card/70 p-6 text-sm text-muted-foreground">
        No market headlines are available right now.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-card/70 shadow-sm backdrop-blur">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {activeImage ? (
          <Image
            src={activeImage}
            alt=""
            fill
            className="object-cover transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 520px"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Newspaper className="h-9 w-9 opacity-30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
            <span>{activeStory.publisher || "Market news"}</span>
            <span>{getRelativeTime(activeStory.providerPublishTime)}</span>
          </div>
          <Link
            href={activeStory.link || "/news"}
            target={activeStory.link ? "_blank" : undefined}
            className="group inline-block"
          >
            <h2 className="font-display text-2xl font-semibold leading-tight text-white group-hover:text-brand">
              {activeStory.title}
            </h2>
          </Link>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {cleanStories.slice(0, 5).map((story, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={story.uuid || story.title}
              role="button"
              tabIndex={0}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveIndex(index);
                }
              }}
              className={`group grid w-full grid-cols-[3px_minmax(0,1fr)_auto] items-start gap-4 px-4 py-4 text-left transition-colors hover:bg-secondary/35 ${isActive ? "bg-secondary/30" : ""}`}
            >
              <span className={`mt-1 h-12 rounded-full ${isActive ? "bg-brand" : "bg-border"}`} />
              <span className="min-w-0">
                <Link
                  href={story.link || "/news"}
                  target={story.link ? "_blank" : undefined}
                  onClick={(event) => event.stopPropagation()}
                  className="line-clamp-2 text-sm font-semibold leading-5 text-foreground hover:text-brand"
                >
                  {story.title}
                </Link>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {story.publisher || "News"} {getRelativeTime(story.providerPublishTime) ? `- ${getRelativeTime(story.providerPublishTime)}` : ""}
                </span>
              </span>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-brand" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
