"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    TrendingUp, TrendingDown, ArrowLeft, Clock, Check, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroChart } from "@/components/HeroChart";
import { AIAnalystDrawer } from "@/components/AIAnalystDrawer";
import { NewsImage } from "@/components/NewsImage";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line,
    Cell, LabelList
} from "recharts";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined, digits = 2) {
    if (n === null || n === undefined) return "—";
    return n.toFixed(digits);
}
function fmtLarge(n: number | null | undefined) {
    if (!n) return "—";
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    return n.toLocaleString();
}
function fmtPct(n: number | null | undefined) {
    if (n === null || n === undefined) return "—";
    return (n * 100).toFixed(2) + "%";
}
function fmtVol(n: number | null | undefined) {
    if (!n) return "—";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
    return n.toLocaleString();
}
function timeAgo(ts: number) {
    if (!ts) return "";
    const s = Math.floor((Date.now() - ts * 1000) / 1000);
    if (s < 0) return "Just now";
    if (s / 3600 > 1) return Math.floor(s / 3600) + "h ago";
    if (s / 60 > 1) return Math.floor(s / 60) + "m ago";
    return "Just now";
}

// ── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5 shrink-0">
            <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-zinc-500">{label}</span>
            <span className="text-[13px] font-mono font-semibold text-zinc-200 tabular-nums">{value}</span>
        </div>
    );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <div className="w-[3px] h-4 rounded-full bg-[#f0a500]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">{children}</span>
        </div>
    );
}

// ── Toggle Button Group ────────────────────────────────────────────────────────
function ToggleGroup({
    options, value, onChange
}: {
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg gap-0.5">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wide transition-all",
                        value === opt.value
                            ? "bg-[#f0a500] text-black"
                            : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

// ── Rating Bar ─────────────────────────────────────────────────────────────────
function RatingBar({ ratings }: { ratings: any }) {
    if (!ratings) return null;
    const { strongBuy, buy, hold, sell, strongSell } = ratings;
    const total = strongBuy + buy + hold + sell + strongSell || 1;
    const pct = (n: number) => ((n / total) * 100).toFixed(1) + "%";
    return (
        <div className="space-y-2">
            {[
                { label: "Strong Buy", value: strongBuy, color: "bg-emerald-500" },
                { label: "Buy", value: buy, color: "bg-emerald-400/70" },
                { label: "Hold", value: hold, color: "bg-amber-400/80" },
                { label: "Sell", value: sell, color: "bg-red-400/70" },
                { label: "Strong Sell", value: strongSell, color: "bg-red-500" },
            ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500 w-20 shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: pct(value) }} />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 tabular-nums w-5 text-right">{value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Price Target Viz ──────────────────────────────────────────────────────────
function PriceTargetViz({ low, current, avg, high }: any) {
    if (!low || !high || !current) return null;
    const range = high - low;
    const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - low) / range) * 100))}%`;
    return (
        <div className="mt-3">
            <div className="relative h-2 bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 rounded-full">
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-zinc-900 shadow z-10" style={{ left: pos(current) }} title={`Current $${current.toFixed(2)}`} />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f0a500] border-2 border-zinc-900 shadow z-10" style={{ left: pos(avg) }} title={`Avg $${avg?.toFixed(2)}`} />
            </div>
            <div className="flex justify-between mt-1.5">
                <span className="text-[10px] font-mono text-red-400">${low?.toFixed(0)} Low</span>
                <span className="text-[10px] font-mono text-zinc-300">${current?.toFixed(2)} Now</span>
                <span className="text-[10px] font-mono text-[#f0a500]">${avg?.toFixed(0)} Avg</span>
                <span className="text-[10px] font-mono text-emerald-400">${high?.toFixed(0)} High</span>
            </div>
        </div>
    );
}

// ── Custom EPS Dot ────────────────────────────────────────────────────────────
function CustomEpsDot({ cx, cy, payload, dataKey }: any) {
    if (!payload || payload[dataKey] === null) return null;
    const isActual = dataKey === "actual";
    const beat = payload.beat;
    if (!isActual) {
        return <circle cx={cx} cy={cy} r={5} fill="transparent" stroke="#71717a" strokeWidth={1.5} />;
    }
    return <circle cx={cx} cy={cy} r={5} fill={beat ? "#10b981" : "#ef4444"} stroke="none" />;
}

// ── Compare To Section ────────────────────────────────────────────────────────
function CompareToSection({ symbol, stockDetails, peers }: { symbol: string; stockDetails: any; peers: any[] }) {
    const isPositive = (n: number) => n >= 0;
    const currentCard = {
        symbol,
        name: stockDetails.name ?? symbol,
        price: stockDetails.price,
        change: stockDetails.change ?? 0,
        marketCap: stockDetails.financials?.marketCap,
        industry: stockDetails.industry,
        selected: true,
    };

    return (
        <section>
            <SectionLabel>Compare To</SectionLabel>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {/* Current stock — highlighted */}
                <div className="shrink-0 w-48 p-4 rounded-xl border-2 border-[#f0a500]/60 bg-[#f0a500]/5 relative">
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#f0a500] flex items-center justify-center">
                        <Check className="w-3 h-3 text-black" />
                    </div>
                    <p className="text-[13px] font-mono font-bold text-white mb-0.5">{currentCard.symbol}</p>
                    <p className="text-[10px] font-sans text-zinc-500 line-clamp-1 mb-3">{currentCard.name}</p>
                    <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-[15px] font-mono font-bold text-white tabular-nums">{currentCard.price.toFixed(2)}</span>
                        <span className={cn("text-[11px] font-mono font-bold", isPositive(currentCard.change) ? "text-emerald-400" : "text-red-400")}>
                            {currentCard.change > 0 ? "+" : ""}{currentCard.change.toFixed(2)}%
                        </span>
                    </div>
                    <div className="pt-2 border-t border-white/10 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-[9px] font-mono text-zinc-600 uppercase">Mkt Cap</span>
                            <span className="text-[10px] font-mono text-zinc-300">{fmtLarge(currentCard.marketCap)}</span>
                        </div>
                        {currentCard.industry && (
                            <div className="flex justify-between gap-2">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase">Industry</span>
                                <span className="text-[10px] font-mono text-zinc-300 text-right line-clamp-1">{currentCard.industry}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Peers */}
                {peers.map(peer => (
                    <Link key={peer.symbol} href={`/stocks/${peer.symbol}`} className="shrink-0 w-48 p-4 rounded-xl border border-white/8 bg-[#111318] hover:border-white/20 hover:bg-[#181b22] transition-all relative group">
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full border border-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-3 h-3 text-zinc-400" />
                        </div>
                        <p className="text-[13px] font-mono font-bold text-white mb-0.5">{peer.symbol}</p>
                        <p className="text-[10px] font-sans text-zinc-500 line-clamp-1 mb-3">{peer.name}</p>
                        <div className="flex items-baseline gap-1.5 mb-2">
                            <span className="text-[15px] font-mono font-bold text-white tabular-nums">{peer.price.toFixed(2)}</span>
                            <span className={cn("text-[11px] font-mono font-bold", isPositive(peer.change) ? "text-emerald-400" : "text-red-400")}>
                                {peer.change > 0 ? "+" : ""}{peer.change.toFixed(2)}%
                            </span>
                        </div>
                        <div className="pt-2 border-t border-white/10 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-[9px] font-mono text-zinc-600 uppercase">Mkt Cap</span>
                                <span className="text-[10px] font-mono text-zinc-300">{fmtLarge(peer.marketCap)}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function StockDetailClient({ stockDetails, stockIngest, stockHistory, peers }: {
    stockDetails: any;
    stockIngest: any;
    stockHistory: any[];
    peers: any[];
}) {
    const [activeTab, setActiveTab] = useState<"summary" | "financials" | "analysis">("summary");
    const [revenueView, setRevenueView] = useState<"quarterly" | "annual">("quarterly");

    const isPositive = (stockIngest?.change ?? 0) > 0;
    const change = stockIngest?.change ?? 0;
    const price = stockDetails?.price ?? 0;
    const currency = stockDetails?.currency ?? "$";
    const fin = stockDetails?.financials ?? {};
    const symbol = stockDetails?.symbol ?? "";
    const narrative = stockIngest?.narrative ?? "";

    const earningsData = (stockDetails?.earningsHistory ?? []).map((q: any) => ({
        quarter: q.date,
        actual: q.actual ?? null,
        estimate: q.estimate ?? null,
        beat: q.actual !== null && q.estimate !== null ? q.actual >= q.estimate : null,
        diff: q.actual !== null && q.estimate !== null ? (q.actual - q.estimate) : null,
    }));

    const revenueDataQ = (stockDetails?.financialsChart ?? []).map((q: any) => ({
        quarter: q.date,
        revenue: q.revenue ? q.revenue / 1e9 : null,
        earnings: q.earnings ? q.earnings / 1e9 : null,
    }));

    const revenueDataA = (stockDetails?.financialsChartYearly ?? []).map((q: any) => ({
        quarter: q.date,
        revenue: q.revenue ? q.revenue / 1e9 : null,
        earnings: q.earnings ? q.earnings / 1e9 : null,
    }));

    const activeRevenueData = revenueView === "quarterly" ? revenueDataQ : revenueDataA;

    const TABS = [
        { id: "summary", label: "Summary" },
        { id: "financials", label: "Financials" },
        { id: "analysis", label: "Analysis" },
    ] as const;

    const tooltipStyle = {
        contentStyle: { background: '#181b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#e4e4e7' },
        labelStyle: { color: '#a1a1aa' },
        itemStyle: { color: '#e4e4e7' },
    };

    return (
        <div className="min-h-screen bg-[#0c0d0f]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-1.5 text-[12px] font-mono text-zinc-500 hover:text-zinc-200 transition-colors mb-6">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                </Link>

                {/* ── Hero ─────────────────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-4">
                        {stockIngest?.imageUrl && (
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-white/10 shrink-0">
                                <Image src={stockIngest.imageUrl} alt={stockIngest.name} fill className="object-contain p-1.5" sizes="56px" />
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h1 className="text-[28px] font-mono font-bold text-white tracking-tight leading-none">{symbol}</h1>
                                {stockDetails?.exchange && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-500 uppercase tracking-wider">{stockDetails.exchange}</span>
                                )}
                            </div>
                            <p className="text-[14px] font-sans text-zinc-400">{stockIngest?.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[36px] font-mono font-bold text-white leading-none tabular-nums">{currency}{price.toFixed(2)}</div>
                        <div className={cn(
                            "inline-flex items-center gap-1.5 mt-1.5 px-3 py-1.5 rounded-full text-[13px] font-mono font-bold",
                            isPositive ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
                        )}>
                            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {isPositive ? "+" : ""}{change.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* ── Stat Strip ───────────────────────────────────────────────────── */}
                <div className="flex items-center gap-5 overflow-x-auto no-scrollbar pb-3 mb-5 border-b border-white/5">
                    <StatChip label="Prev Close" value={`${currency}${fmt(stockDetails?.previousClose)}`} />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatChip label="Open" value={`${currency}${fmt(stockDetails?.open)}`} />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatChip label="Day Range" value={`${fmt(stockDetails?.dayLow)} – ${fmt(stockDetails?.dayHigh)}`} />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatChip label="52W Range" value={`${fmt(stockDetails?.fiftyTwoWeekLow)} – ${fmt(stockDetails?.fiftyTwoWeekHigh)}`} />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatChip label="Volume" value={fmtVol(stockDetails?.volume)} />
                    <div className="w-px h-6 bg-white/10 shrink-0" />
                    <StatChip label="Market Cap" value={fmtLarge(fin.marketCap)} />
                    {fin.targetPrice && (
                        <>
                            <div className="w-px h-6 bg-white/10 shrink-0" />
                            <StatChip label="Analyst Target" value={`${currency}${fmt(fin.targetPrice)}`} />
                        </>
                    )}
                </div>

                {/* ── Chart ────────────────────────────────────────────────────────── */}
                <div className="w-full h-[380px] mb-6">
                    <HeroChart symbol={symbol} name={stockIngest?.name ?? symbol} initialData={stockHistory} />
                </div>

                {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 border-b border-white/10 mb-8">
                    {TABS.map(({ id, label }) => (
                        <button key={id} onClick={() => setActiveTab(id)} className={cn(
                            "px-5 py-2.5 text-[12px] font-mono font-bold uppercase tracking-widest transition-all duration-200 border-b-2 -mb-px",
                            activeTab === id ? "text-[#f0a500] border-[#f0a500]" : "text-zinc-500 border-transparent hover:text-zinc-300"
                        )}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* ════════════════════════════════════════════════════════════════════ */}
                {/* TAB 1: SUMMARY                                                      */}
                {/* ════════════════════════════════════════════════════════════════════ */}
                {activeTab === "summary" && (
                    <div className="space-y-8 pb-32">
                        {/* Latest Headlines */}
                        <section>
                            <SectionLabel>Latest Headlines</SectionLabel>
                            <div className="space-y-px overflow-hidden rounded-xl border border-white/8">
                                {(stockDetails?.news ?? []).slice(0, 5).map((item: any) => (
                                    <Link key={item.uuid} href={item.link} target="_blank"
                                        className="flex items-start gap-4 p-4 bg-[#111318] hover:bg-[#181b22] transition-colors group">
                                        <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                            <NewsImage src={item.thumbnail?.resolutions?.[0]?.url} alt={item.title} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[9px] font-mono font-bold text-[#f0a500] uppercase tracking-widest">{item.publisher}</span>
                                                <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1 shrink-0">
                                                    <Clock className="w-2.5 h-2.5" />{timeAgo(item.providerPublishTime)}
                                                </span>
                                            </div>
                                            <h3 className="text-[13px] font-sans font-medium text-zinc-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">{item.title}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Compare To */}
                        {peers.length > 0 && (
                            <CompareToSection symbol={symbol} stockDetails={{ ...stockDetails, name: stockIngest?.name, change }} peers={peers} />
                        )}

                        {/* About */}
                        {stockDetails?.description && (
                            <section>
                                <SectionLabel>About {symbol}</SectionLabel>
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <p className="text-[13px] font-sans text-zinc-400 leading-relaxed line-clamp-5">{stockDetails.description}</p>
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════════ */}
                {/* TAB 2: FINANCIALS                                                   */}
                {/* ════════════════════════════════════════════════════════════════════ */}
                {activeTab === "financials" && (
                    <div className="space-y-8 pb-32">
                        {/* Earnings + Revenue — side by side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* EPS Chart */}
                            {earningsData.length > 0 && (
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <SectionLabel>Earnings Per Share</SectionLabel>
                                    </div>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={earningsData} margin={{ top: 12, right: 12, bottom: 0, left: -20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="quarter" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#52525b' }} tickLine={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#52525b' }} tickLine={false} axisLine={false} />
                                                <Tooltip {...tooltipStyle} formatter={(v: any, name: string) => [v?.toFixed(2), name]} />
                                                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                                                <Line type="monotone" dataKey="estimate" name="Estimate" stroke="#52525b" strokeWidth={1.5} strokeDasharray="4 4"
                                                    dot={(props: any) => { const { key, ...rest } = props; return <CustomEpsDot key={key} {...rest} dataKey="estimate" />; }} />
                                                <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={2}
                                                    dot={(props: any) => { const { key, ...rest } = props; return <CustomEpsDot key={key} {...rest} dataKey="actual" />; }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Beat/Miss row */}
                                    <div className="flex justify-around mt-3 pt-3 border-t border-white/5">
                                        {earningsData.map((q: any, i: number) => (
                                            <div key={i} className="flex flex-col items-center gap-0.5">
                                                <span className="text-[9px] font-mono text-zinc-600">{q.quarter}</span>
                                                {q.beat !== null && (
                                                    <span className={cn("text-[9px] font-mono font-bold", q.beat ? "text-emerald-400" : "text-red-400")}>
                                                        {q.beat ? "Beat" : "Miss"}
                                                        {q.diff !== null && ` ${q.diff > 0 ? "+" : ""}${q.diff.toFixed(2)}`}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Revenue vs Earnings Chart */}
                            {(revenueDataQ.length > 0 || revenueDataA.length > 0) && (
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <SectionLabel>Revenue vs. Earnings ($B)</SectionLabel>
                                        <ToggleGroup
                                            options={[{ label: "Quarterly", value: "quarterly" }, { label: "Annual", value: "annual" }]}
                                            value={revenueView}
                                            onChange={(v) => setRevenueView(v as "quarterly" | "annual")}
                                        />
                                    </div>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={activeRevenueData} margin={{ top: 12, right: 12, bottom: 0, left: -20 }} barGap={3}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                                <XAxis dataKey="quarter" tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#52525b' }} tickLine={false} axisLine={false} />
                                                <YAxis tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#52525b' }} tickLine={false} axisLine={false} />
                                                <Tooltip {...tooltipStyle} formatter={(v: any) => [(v as number)?.toFixed(2) + "B", ""]} />
                                                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
                                                <Bar dataKey="earnings" name="Earnings" fill="#f0a500" radius={[3, 3, 0, 0]} maxBarSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* Legend */}
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 justify-center">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                                            <span className="text-[10px] font-mono text-zinc-500">Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-sm bg-[#f0a500]" />
                                            <span className="text-[10px] font-mono text-zinc-500">Earnings</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Valuation Measures — two columns */}
                        <section>
                            <SectionLabel>Valuation & Financial Highlights</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f0a500] mb-4">Valuation</p>
                                    {[
                                        { label: "P/E Ratio", value: fmt(fin.peRatio) },
                                        { label: "Forward P/E", value: fmt(fin.forwardPE) },
                                        { label: "PEG Ratio", value: fmt(fin.pegRatio) },
                                        { label: "Price/Sales", value: fmt(fin.priceToSales) },
                                        { label: "Price/Book", value: fmt(fin.priceToBook) },
                                        { label: "EV/EBITDA", value: fmt(fin.evToEbitda) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                            <span className="text-[12px] font-sans text-zinc-500">{label}</span>
                                            <span className="text-[13px] font-mono font-semibold text-zinc-200 tabular-nums">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f0a500] mb-4">Financial Highlights</p>
                                    {[
                                        { label: "Revenue (TTM)", value: fmtLarge(fin.revenue) },
                                        { label: "Revenue Growth", value: fmtPct(fin.revenueGrowth) },
                                        { label: "Gross Margin", value: fmtPct(fin.grossMargins) },
                                        { label: "Profit Margin", value: fmtPct(fin.profitMargin) },
                                        { label: "Free Cash Flow", value: fmtLarge(fin.freeCashflow) },
                                        { label: "Return on Equity", value: fmtPct(fin.roe) },
                                        { label: "Debt/Equity", value: fin.debtToEquity != null ? fin.debtToEquity.toFixed(2) : "—" },
                                        { label: "Beta", value: fmt(fin.beta) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                            <span className="text-[12px] font-sans text-zinc-500">{label}</span>
                                            <span className="text-[13px] font-mono font-semibold text-zinc-200 tabular-nums">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════════ */}
                {/* TAB 3: ANALYSIS                                                     */}
                {/* ════════════════════════════════════════════════════════════════════ */}
                {activeTab === "analysis" && (
                    <div className="space-y-8 pb-32">
                        {/* Analyst Insights — 2 column */}
                        <section>
                            <SectionLabel>Analyst Insights</SectionLabel>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Recommendations Bar */}
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-[2px] h-4 rounded-full bg-[#f0a500]" />
                                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">Analyst Recommendations</span>
                                    </div>
                                    {stockDetails?.analystRatings ? (
                                        <>
                                            <RatingBar ratings={stockDetails.analystRatings} />
                                            {fin.recommendation && (
                                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-zinc-600">Consensus:</span>
                                                    <span className="text-[12px] font-mono font-bold uppercase tracking-wide text-[#f0a500]">
                                                        {fin.recommendation.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-[12px] font-sans text-zinc-600">No analyst data available.</p>
                                    )}
                                </div>

                                {/* Price Target */}
                                <div className="bg-[#111318] border border-white/8 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-[2px] h-4 rounded-full bg-[#f0a500]" />
                                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">Price Target Range</span>
                                    </div>
                                    <div className="text-[30px] font-mono font-bold text-white tabular-nums leading-none">{currency}{fmt(fin.targetPrice)}</div>
                                    <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Average of {fin.totalAnalysts ?? "—"} analysts</div>
                                    <PriceTargetViz low={fin.targetLow} current={fin.currentPrice ?? price} avg={fin.targetPrice} high={fin.targetHigh} />
                                </div>
                            </div>
                        </section>

                        {/* Recent Analyst Actions */}
                        {stockDetails?.recentUpgrades?.length > 0 && (
                            <section>
                                <SectionLabel>Recent Analyst Actions</SectionLabel>
                                <div className="overflow-hidden rounded-xl border border-white/8">
                                    {stockDetails.recentUpgrades.map((u: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between px-5 py-3.5 bg-[#111318] border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-1.5 h-1.5 rounded-full", u.action === "up" ? "bg-emerald-400" : u.action === "down" ? "bg-red-400" : "bg-zinc-500")} />
                                                <span className="text-[13px] font-sans font-medium text-zinc-200">{u.firm}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {u.fromGrade && <span className="text-[11px] font-mono text-zinc-600 line-through">{u.fromGrade}</span>}
                                                <span className={cn(
                                                    "text-[11px] font-mono font-bold px-2 py-0.5 rounded",
                                                    u.toGrade?.toLowerCase().includes("buy") || u.toGrade?.toLowerCase().includes("outperform") || u.toGrade?.toLowerCase().includes("overweight")
                                                        ? "bg-emerald-500/15 text-emerald-400"
                                                        : u.toGrade?.toLowerCase().includes("sell") || u.toGrade?.toLowerCase().includes("underperform") || u.toGrade?.toLowerCase().includes("underweight")
                                                            ? "bg-red-500/15 text-red-400"
                                                            : "bg-zinc-800 text-zinc-400"
                                                )}>
                                                    {u.toGrade}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-600">{u.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Compare To (also in Analysis) */}
                        {peers.length > 0 && (
                            <CompareToSection symbol={symbol} stockDetails={{ ...stockDetails, name: stockIngest?.name, change }} peers={peers} />
                        )}
                    </div>
                )}
            </div>

            {/* AI Analyst Floating Drawer */}
            <AIAnalystDrawer symbol={symbol} narrative={narrative} />
        </div>
    );
}
