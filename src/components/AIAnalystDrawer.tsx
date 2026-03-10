"use client";

import { useState, useEffect, useRef } from "react";
import { X, Sparkles, ThumbsUp, ThumbsDown, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIAnalystDrawerProps {
    symbol: string;
    narrative: string;
}

const SOURCES = [
    { label: "Yahoo Finance", icon: "📰" },
    { label: "Analyst Reports", icon: "📊" },
    { label: "Market Data", icon: "📈" },
    { label: "Fundamentals", icon: "💹" },
];

export function AIAnalystDrawer({ symbol, narrative }: AIAnalystDrawerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
    const streamRef = useRef<NodeJS.Timeout | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    // Stream in narrative text character by character when opened
    useEffect(() => {
        if (!isOpen || !narrative) return;
        if (isDone) return; // Don't re-stream if already done

        setDisplayedText("");
        setIsStreaming(true);
        setIsDone(false);

        let i = 0;
        // Start after a short "thinking" pause
        const startDelay = setTimeout(() => {
            streamRef.current = setInterval(() => {
                if (i < narrative.length) {
                    setDisplayedText(narrative.slice(0, i + 1));
                    i++;
                } else {
                    clearInterval(streamRef.current!);
                    setIsStreaming(false);
                    setIsDone(true);
                }
            }, 12); // ~83 chars/sec
        }, 1400); // Thinking delay

        return () => {
            clearTimeout(startDelay);
            if (streamRef.current) clearInterval(streamRef.current);
        };
    }, [isOpen, narrative]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    // Format narrative into structured sections
    const formatNarrative = (text: string) => {
        if (!text) return null;
        return text.split('\n').filter(p => p.trim()).map((para, i) => (
            <p key={i} className={cn(
                "text-[14px] font-sans leading-relaxed text-foreground/80",
                i < text.split('\n').filter(p => p.trim()).length - 1 && "mb-3"
            )}>
                {para}
            </p>
        ));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-8 right-8 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 group",
                    "bg-[#f0a500] hover:bg-[#f0a500]/90 text-black",
                    "ring-4 ring-[#f0a500]/20 hover:ring-[#f0a500]/40",
                    isOpen && "opacity-0 pointer-events-none scale-90"
                )}
            >
                {/* Live pulse dot */}
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/40 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black/60" />
                </span>
                <Sparkles className="w-4 h-4" />
                <span className="text-[13px] font-mono font-bold tracking-wide">QuantView AI</span>
                <span className="text-[10px] font-mono opacity-60 hidden sm:block">· Live Analysis</span>
            </button>

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 flex flex-col",
                    "bg-card border-l border-border",
                    "shadow-2xl",
                    "transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-brand/15 border border-brand/30 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 text-brand" />
                        </div>
                        <div>
                            <p className="text-[13px] font-mono font-bold text-foreground">QuantView AI</p>
                            <p className="text-[10px] font-mono text-muted-foreground">Equity Analyst · {symbol}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border px-5 py-5 space-y-5">

                    {/* Thinking state */}
                    {isOpen && !isDone && displayedText === "" && (
                        <div className="flex items-start gap-3 bg-secondary/40 rounded-xl p-4 border border-border">
                            <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Loader2 className="w-3.5 h-3.5 text-brand animate-spin" />
                            </div>
                            <div>
                                <p className="text-[12px] font-mono text-muted-foreground mb-1">Analyzing market data...</p>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <span
                                            key={i}
                                            className="w-1.5 h-1.5 rounded-full bg-brand/60 animate-bounce"
                                            style={{ animationDelay: `${i * 150}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Streamed Text */}
                    {displayedText && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-3">
                                <div className="w-[2px] h-4 rounded-full bg-brand" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                    Executive Summary
                                </span>
                                {isStreaming && (
                                    <span className="ml-1 inline-block w-[2px] h-[14px] bg-brand animate-pulse rounded-sm" />
                                )}
                            </div>
                            {formatNarrative(displayedText)}
                        </div>
                    )}

                    {/* Sources */}
                    {isDone && (
                        <div>
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                                Data Sources
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {SOURCES.map((s) => (
                                    <span
                                        key={s.label}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/60 border border-border text-[11px] font-mono text-muted-foreground hover:bg-secondary transition-colors cursor-default"
                                    >
                                        {s.icon} {s.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {isDone && (
                    <div className="px-5 py-4 border-t border-border bg-background flex items-center justify-between">
                        <p className="text-[11px] font-mono text-muted-foreground/60">Was this analysis helpful?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFeedback("up")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all",
                                    feedback === "up"
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ThumbsUp className="w-3 h-3" /> Helpful
                            </button>
                            <button
                                onClick={() => setFeedback("down")}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono border transition-all",
                                    feedback === "down"
                                        ? "bg-red-500/20 border-red-500/40 text-red-600 dark:text-red-400"
                                        : "border-border text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ThumbsDown className="w-3 h-3" /> Not helpful
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
